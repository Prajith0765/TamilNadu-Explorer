require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Place = require('../models/Place');
const connectDB = require('../config/db');

connectDB();

const tagMap = {
  'tourism=attraction': 'Adventure',
  'tourism=museum': 'History',
  'amenity=place_of_worship': 'Culture',
  'natural=beach': 'Relaxation',
  'leisure=park': 'Nature',
  'sport=*': 'Sport',
  'tourism=zoo': 'Wildlife',
  'historic=*': 'History',
  'natural=waterfall': 'Waterfall',
  'place=village': 'Village',
  'tourism=theme_park': 'Festival',
};

const categoryMap = {
  'tourism=attraction': 'other',
  'tourism=museum': 'museum',
  'amenity=place_of_worship': 'temple',
  'natural=beach': 'beach',
  'leisure=park': 'nature',
  'sport=*': 'sport',
  'tourism=zoo': 'wildlife',
  'historic=*': 'historical',
  'natural=waterfall': 'waterfall',
  'place=village': 'village',
  'tourism=theme_park': 'festival',
};

const fetchPlaces = async () => {
  try {
    const query = `
      [out:json];
      area[name="Tamil Nadu"]->.tn;
      (
        node[tourism~"attraction|museum|zoo|theme_park"](area.tn);
        node[amenity=place_of_worship](area.tn);
        node[natural~"beach|waterfall"](area.tn);
        node[leisure=park](area.tn);
        node[sport](area.tn);
        node[historic](area.tn);
        node[place=village](area.tn);
      );
      out body;
    `;
    const response = await axios.post('https://overpass-api.de/api/interpreter', query);
    const elements = response.data.elements;

    const places = elements
      .filter((el) => el.tags && el.tags.name && el.lat && el.lon)
      .map((el) => {
        const osmTags = Object.entries(el.tags)
          .filter(([k]) => tagMap[k])
          .map(([k]) => tagMap[k])
          .filter(Boolean);

        let category = 'other';
        for (const [osmTag, cat] of Object.entries(categoryMap)) {
          const [key, value] = osmTag.split('=');
          if (value === '*' ? el.tags[key] : el.tags[key] === value) {
            category = cat;
            break;
          }
        }

        return {
          name: el.tags.name,
          description: el.tags.description || `Explore ${el.tags.name} in Tamil Nadu.`,
          coordinates: {
            lon: el.lon,
            lat: el.lat,
          },
          tags: [...new Set(osmTags)],
          address: el.tags['addr:city'] || 'Tamil Nadu',
          imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(el.tags.name)},tamilnadu`,
          category,
        };
      });

    // Comment out deleteMany to avoid overwriting static data
    // await Place.deleteMany({});
    const insertedPlaces = await Place.insertMany(places);
    console.log(`Inserted ${insertedPlaces.length} places from Overpass API`);
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fetchPlaces();