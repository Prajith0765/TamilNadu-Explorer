import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Search, MapPin } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isAuthenticated = !!localStorage.getItem('token');

  // Map Geoapify categories to Pexels query terms
  const getImageQuery = (placeName, categories) => {
    if (categories.includes('beach')) return 'beach';
    if (categories.includes('tourism.attraction') && placeName.toLowerCase().includes('temple')) return 'temple';
    if (categories.includes('natural') && placeName.toLowerCase().includes('reservoir')) return 'reservoir';
    if (categories.includes('natural')) return 'nature';
    return 'tamil nadu';
  };

  // Fetch places on mount or when location changes
  useEffect(() => {
    const fetchPlaces = async (loc = null) => {
      setLoading(true);
      setError('');
      try {
        // Build Geoapify API URL for places
        let url = `https://api.geoapify.com/v2/places?categories=tourism.attraction,beach,natural&limit=20&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}&lang=en`;
        if (loc) {
          url += `&filter=circle:${loc.lon},${loc.lat},50000`;
        } else {
          url += '&filter=rect:76.0,8.0,80.3,13.5';
        }
        console.log('Fetching places from:', url);
        const response = await axios.get(url);
        console.log('Geoapify places response:', response.data);

        const fetchedPlaces = await Promise.all(
          response.data.features.map(async (feature) => {
            let imageUrl = 'https://via.placeholder.com/400x200?text=Tamil+Nadu';
            try {
              const query = getImageQuery(feature.properties.name || 'tamil nadu', feature.properties.categories || []);
              console.log(`Pexels query for ${feature.properties.name}: ${query}`);
              const pexelsResponse = await axios.get(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
                {
                  headers: {
                    Authorization: import.meta.env.VITE_PEXELS_API_KEY,
                  },
                }
              );
              if (pexelsResponse.data.photos.length > 0) {
                imageUrl = pexelsResponse.data.photos[0].src.medium;
              }
              console.log(`Image for ${feature.properties.name}: ${imageUrl}`);
            } catch (imgErr) {
              console.error(`Image fetch error for ${feature.properties.name}:`, imgErr.message);
            }

            return {
              id: feature.properties.place_id || feature.properties.datasource?.raw?.place_id || 'unknown',
              name: feature.properties.name || 'Unknown Place',
              description: feature.properties.address_line2 || 'A beautiful destination',
              coordinates: {
                lon: feature.properties.lon,
                lat: feature.properties.lat,
              },
              tags: feature.properties.categories || [],
              address: feature.properties.formatted || 'No address available',
              imageUrl,
            };
          })
        );

        setPlaces(fetchedPlaces);
        if (fetchedPlaces.length === 0) {
          setError('No places found in this area. Try searching for "Marina Beach" or "Chennai".');
        }
      } catch (err) {
        console.error('Fetch places error:', err.response || err.message);
        setError(`Failed to fetch places: ${err.response?.data?.message || 'Please check your API key or network.'}`);
      }
      setLoading(false);
    };

    // Try geolocation, fallback to Tamil Nadu
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setLocation(loc);
          fetchPlaces(loc);
        },
        () => {
          console.log('Geolocation failed, using Tamil Nadu default');
          fetchPlaces();
        },
        { timeout: 5000 }
      );
    } else {
      console.log('Geolocation not supported, using Tamil Nadu default');
      fetchPlaces();
    }
  }, []);

  // Search places
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search term.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Step 1: Geocode the search query to get coordinates
      let url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&filter=rect:76.0,8.0,80.3,13.5&limit=1&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}&lang=en`;
      console.log('Geocoding search from:', url);
      let response = await axios.get(url);
      console.log('Geocoding response:', response.data);

      let searchResults = [];
      if (response.data.features.length > 0) {
        // Step 2: Use coordinates to fetch nearby places
        const { lon, lat } = response.data.features[0].properties;
        url = `https://api.geoapify.com/v2/places?categories=tourism.attraction,beach,natural&limit=20&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}&filter=circle:${lon},${lat},50000&lang=en`;
        console.log('Fetching nearby places from:', url);
        response = await axios.get(url);
        console.log('Nearby places response:', response.data);

        searchResults = await Promise.all(
          response.data.features.map(async (feature) => {
            let imageUrl = 'https://via.placeholder.com/400x200?text=Tamil+Nadu';
            try {
              const query = getImageQuery(feature.properties.name || searchQuery, feature.properties.categories || []);
              console.log(`Pexels query for ${feature.properties.name}: ${query}`);
              const pexelsResponse = await axios.get(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
                {
                  headers: {
                    Authorization: import.meta.env.VITE_PEXELS_API_KEY,
                  },
                }
              );
              if (pexelsResponse.data.photos.length > 0) {
                imageUrl = pexelsResponse.data.photos[0].src.medium;
              }
              console.log(`Image for ${feature.properties.name}: ${imageUrl}`);
            } catch (imgErr) {
              console.error(`Image fetch error for ${feature.properties.name}:`, imgErr.message);
            }

            return {
              id: feature.properties.place_id || feature.properties.datasource?.raw?.place_id || 'unknown',
              name: feature.properties.name || searchQuery,
              description: feature.properties.address_line2 || 'A beautiful destination',
              coordinates: {
                lon: feature.properties.lon,
                lat: feature.properties.lat,
              },
              tags: feature.properties.categories || ['tourism'],
              address: feature.properties.formatted || 'No address available',
              imageUrl,
            };
          })
        );
      }

      // Fallback to text-based places search if geocoding fails or no nearby places
      if (searchResults.length === 0) {
        url = `https://api.geoapify.com/v2/places?categories=tourism.attraction,beach,natural&limit=20&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}&filter=rect:76.0,8.0,80.3,13.5&lang=en&text=${encodeURIComponent(searchQuery)}`;
        console.log('Fallback search from:', url);
        response = await axios.get(url);
        console.log('Fallback places response:', response.data);

        searchResults = await Promise.all(
          response.data.features.map(async (feature) => {
            let imageUrl = 'https://via.placeholder.com/400x200?text=Tamil+Nadu';
            try {
              const query = getImageQuery(feature.properties.name || searchQuery, feature.properties.categories || []);
              console.log(`Pexels query for ${feature.properties.name}: ${query}`);
              const pexelsResponse = await axios.get(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
                {
                  headers: {
                    Authorization: import.meta.env.VITE_PEXELS_API_KEY,
                  },
                }
              );
              if (pexelsResponse.data.photos.length > 0) {
                imageUrl = pexelsResponse.data.photos[0].src.medium;
              }
              console.log(`Image for ${feature.properties.name}: ${imageUrl}`);
            } catch (imgErr) {
              console.error(`Image fetch error for ${feature.properties.name}:`, imgErr.message);
            }

            return {
              id: feature.properties.place_id || feature.properties.datasource?.raw?.place_id || 'unknown',
              name: feature.properties.name || searchQuery,
              description: feature.properties.address_line2 || 'A beautiful destination',
              coordinates: {
                lon: feature.properties.lon,
                lat: feature.properties.lat,
              },
              tags: feature.properties.categories || ['tourism'],
              address: feature.properties.formatted || 'No address available',
              imageUrl,
            };
          })
        );
      }

      setPlaces(searchResults);
      if (searchResults.length === 0) {
        setError(`No places found for "${searchQuery}". Try terms like "Chennai" or "Ooty".`);
      }
    } catch (err) {
      console.error('Search error:', err.response || err.message);
      setError(`Search failed: ${err.response?.data?.message || 'Please try again.'}`);
    }
    setLoading(false);
  };

  // Save place
  const handleSave = async (place) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/places/save',
        {
          name: place.name,
          description: place.description,
          lon: place.coordinates.lon,
          lat: place.coordinates.lat,
          tags: place.tags,
          address: place.address,
          imageUrl: place.imageUrl,
          externalId: place.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Place saved!');
    } catch (err) {
      console.error('Save place error:', err.response || err.message);
      alert('Failed to save place.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to Tamil Nadu Explorer</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex items-center border border-gray-300 rounded-md p-2">
          <Search className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search places (e.g., Chennai, Meenakshi Temple)"
            className="w-full outline-none text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            Search
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <p className="text-gray-600">Loading places...</p>}

      {/* Featured Destinations */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Featured Destinations</h2>
        {places.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div key={place.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200?text=Tamil+Nadu';
                    console.log(`Image failed for ${place.name}, using fallback`);
                  }}
                />
                <div className="p-4">
                  <Link
                    to={`/place/${place.id}`}
                    className="text-xl font-bold text-gray-900 hover:text-blue-600"
                  >
                    {place.name}
                  </Link>
                  <p className="text-gray-600 mt-2">{place.description}</p>
                  <div className="flex items-center mt-2">
                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-gray-500 text-sm">{place.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {place.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSave(place)}
                    className="mt-4 flex items-center text-gray-500 hover:text-blue-600"
                    disabled={loading}
                  >
                    <Heart className="h-5 w-5 mr-1" />
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-gray-500">
              No places found. Try searching for places like "Chennai" or "Ooty".
            </p>
          )
        )}
      </section>
    </div>
  );
};

export default Home;