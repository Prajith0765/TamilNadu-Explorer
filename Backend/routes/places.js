const express = require('express');
const router = express.Router();
const axios = require('axios');
const Place = require('../models/Place');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// In-memory cache for Pexels images
const imageCache = new Map();

// Mapping categories to Overpass API queries (replaced hill station and historical)
const categoryToOverpassQuery = {
  temple: '[amenity=place_of_worship]',
  beach: '[natural=beach]',
  peak: '[natural=peak]', // Replaced "hill station"
  castle: '[historic=castle]', // Replaced "historical"
  park: '[leisure~"(park|garden)"],[landuse=recreation_ground]',
  wildlife: '[tourism=zoo],[landuse=nature_reserve],[natural=wildlife]',
  waterfall: '[waterway=waterfall]',
  museum: '[tourism=museum]',
  village: '[place=village]',
  other: '[tourism=attraction]',
};

const tagMap = {
  'amenity.place_of_worship': 'Culture',
  'natural.beach': 'Relaxation',
  'natural.peak': 'Nature', // Updated for "peak"
  'tourism.attraction': 'Adventure',
  'historic.castle': 'History', // Updated for "castle"
  'tourism.museum': 'History',
  'tourism.zoo': 'Wildlife',
  'landuse.nature_reserve': 'Wildlife',
  'natural.wildlife': 'Wildlife',
  'waterway.waterfall': 'Waterfall',
  'place.village': 'Village',
  'leisure.park': 'Recreation',
  'leisure.garden': 'Recreation',
  'landuse.recreation_ground': 'Recreation',
};

// Function to fetch image from Pexels with caching
const fetchImageFromPexels = async (query) => {
  if (imageCache.has(query)) {
    return imageCache.get(query);
  }

  if (!process.env.PEXELS_API_KEY) {
    console.error('Pexels API key is missing in environment variables');
    return null;
  }

  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      params: {
        query: `${query} Tamil Nadu`,
        per_page: 1,
      },
    });
    const imageUrl = response.data.photos[0]?.src?.medium || null;
    imageCache.set(query, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error(`Failed to fetch Pexels image for ${query}:`, error.response?.status || error.message);
    imageCache.set(query, null);
    return null;
  }
};

// Save a place
router.post('/save', protect, async (req, res) => {
  try {
    const { name, description, lon, lat, tags, address, imageUrl, externalId } = req.body;
    let place = await Place.findOne({ externalId });
    if (!place) {
      place = new Place({
        name,
        description,
        coordinates: { lon, lat },
        tags,
        address,
        imageUrl,
        externalId,
        source: 'api',
      });
      await place.save();
    }
    const user = await User.findById(req.user.id);
    if (!user.savedDestinations.includes(place._id)) {
      user.savedDestinations.push(place._id);
      await user.save();
    }
    res.json({ message: 'Place saved', place });
  } catch (error) {
    console.error('Save place error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get saved destinations
router.get('/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedDestinations');
    res.json(user.savedDestinations);
  } catch (error) {
    console.error('Get saved places error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get places by category (dynamically fetch from Overpass API)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      const query = `
        [out:json];
        (
          node["tourism"="attraction"](7.0,75.0,14.0,81.0);
          way["tourism"="attraction"](7.0,75.0,14.0,81.0);
          relation["tourism"="attraction"](7.0,75.0,14.0,81.0);
          node["natural"](7.0,75.0,14.0,81.0);
          way["natural"](7.0,75.0,14.0,81.0);
          relation["natural"](7.0,75.0,14.0,81.0);
        );
        out body 50;
      `;
      console.log('Fetching places from Overpass API (no category):', query);
      let response;
      try {
        response = await axios.post('https://overpass-api.de/api/interpreter', query, {
          headers: { 'Content-Type': 'text/plain' },
        });
      } catch (error) {
        console.error('Overpass API request failed:', error.response?.status, error.response?.data || error.message);
        return res.status(502).json({ error: 'Failed to fetch data from Overpass API' });
      }

      if (!response.data || !response.data.elements || !Array.isArray(response.data.elements)) {
        console.error('Overpass API response is invalid:', response.data);
        return res.status(500).json({ error: 'Invalid response from Overpass API' });
      }

      const places = response.data.elements
        .filter((element) => element.tags?.name && (element.lat || element.center?.lat))
        .map((element) => {
          const tags = Object.entries(element.tags)
            .filter(([key, value]) => tagMap[`${key}.${value}`])
            .map(([key, value]) => tagMap[`${key}.${value}`])
            .filter(Boolean);

          let placeCategory = 'other';
          for (const [cat, query] of Object.entries(categoryToOverpassQuery)) {
            const conditions = query.split(',').map(q => q.replace(/\[|\]/g, ''));
            const matches = conditions.some(condition => {
              const [key, value] = condition.split('=');
              const regex = new RegExp(value?.replace('~"', '').replace('"', '') || '.*');
              return element.tags[key] && regex.test(element.tags[key]);
            });
            if (matches) {
              placeCategory = cat;
              break;
            }
          }

          return {
            name: element.tags.name,
            description: element.tags.description || `Explore ${element.tags.name} in Tamil Nadu.`,
            coordinates: {
              lon: element.lon || element.center?.lon || 0,
              lat: element.lat || element.center?.lat || 0,
            },
            tags: [...new Set(tags)],
            address: element.tags['addr:full'] || element.tags['addr:city'] || 'Tamil Nadu',
            category: placeCategory,
            externalId: `overpass-${element.id}`,
            source: 'overpass-api',
          };
        });

      const placesWithImages = await Promise.all(
        places.map(async (place) => {
          const imageUrl = await fetchImageFromPexels(place.name) ||
            `https://source.unsplash.com/featured/?${encodeURIComponent(place.name)},tamilnadu`;
          return { ...place, imageUrl };
        })
      );

      console.log(`Fetched ${placesWithImages.length} places for category: all from Overpass API`);
      return res.json(placesWithImages);
    }

    const normalizedCategory = category.toLowerCase();
    const overpassQueryParts = categoryToOverpassQuery[normalizedCategory];
    if (!overpassQueryParts) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Overpass query for the specific category
    const queryParts = overpassQueryParts.split(',').map(part => `
      node${part}(7.0,75.0,14.0,81.0);
      way${part}(7.0,75.0,14.0,81.0);
      relation${part}(7.0,75.0,14.0,81.0);
    `).join('\n');
    
    const query = `
      [out:json];
      (
        ${queryParts}
      );
      out body 50;
    `;
    console.log(`Fetching places from Overpass API for ${normalizedCategory}:`, query);

    let response;
    try {
      response = await axios.post('https://overpass-api.de/api/interpreter', query, {
        headers: { 'Content-Type': 'text/plain' },
      });
    } catch (error) {
      console.error(`Overpass API request failed for ${normalizedCategory}:`, error.response?.status, error.response?.data || error.message);
      return res.status(502).json({ error: 'Failed to fetch data from Overpass API' });
    }

    if (!response.data || !response.data.elements || !Array.isArray(response.data.elements)) {
      console.error(`Overpass API response is invalid for ${normalizedCategory}:`, response.data);
      return res.status(500).json({ error: 'Invalid response from Overpass API' });
    }

    console.log(`Raw Overpass response for ${normalizedCategory}:`, response.data.elements.map(element => ({
      name: element.tags?.name || 'Unnamed',
      tags: element.tags || {},
    })));

    let places = [];
    if (response.data.elements.length === 0) {
      console.log(`No places found for category ${normalizedCategory} in the specified region`);
    } else {
      places = response.data.elements
        .filter((element) => {
          const hasRequiredTags = element.tags?.name && (element.lat || element.center?.lat);
          const conditions = overpassQueryParts.split(',').map(q => q.replace(/\[|\]/g, ''));
          const matchesCategory = conditions.some(condition => {
            const [key, value] = condition.split('=');
            const regex = new RegExp(value?.replace('~"', '').replace('"', '') || '.*');
            return element.tags[key] && regex.test(element.tags[key]);
          });
          console.log(`Filtering place: ${element.tags?.name || 'Unnamed'}, hasRequiredTags: ${hasRequiredTags}, matchesCategory: ${matchesCategory}`);
          return hasRequiredTags && matchesCategory;
        })
        .map((element) => {
          const tags = Object.entries(element.tags)
            .filter(([key, value]) => tagMap[`${key}.${value}`])
            .map(([key, value]) => tagMap[`${key}.${value}`])
            .filter(Boolean);

          return {
            name: element.tags.name,
            description: element.tags.description || `Explore ${element.tags.name} in Tamil Nadu.`,
            coordinates: {
              lon: element.lon || element.center?.lon || 0,
              lat: element.lat || element.center?.lat || 0,
            },
            tags: [...new Set(tags)],
            address: element.tags['addr:full'] || element.tags['addr:city'] || 'Tamil Nadu',
            category: normalizedCategory,
            externalId: `overpass-${element.id}`,
            source: 'overpass-api',
          };
        });
    }

    const placesWithImages = await Promise.all(
      places.map(async (place) => {
        const imageUrl = await fetchImageFromPexels(place.name) ||
          `https://source.unsplash.com/featured/?${encodeURIComponent(place.name)},tamilnadu`;
        return { ...place, imageUrl };
      })
    );

    console.log(`Fetched ${placesWithImages.length} places for category: ${normalizedCategory} from Overpass API`);
    res.json(placesWithImages);
  } catch (error) {
    console.error('Error fetching places:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

module.exports = router;