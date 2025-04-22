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

  // Fetch places on mount or when location changes
  useEffect(() => {
    const fetchPlaces = async (loc = null) => {
      setLoading(true);
      setError('');
      try {
        // Build Geoapify API URL with valid categories
        let url = `https://api.geoapify.com/v2/places?categories=tourism.attraction,beach,natural&limit=20&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`;
        if (loc) {
          url += `&filter=circle:${loc.lon},${loc.lat},50000`; // 50km radius
        } else {
          // Tamil Nadu bounding box: lonMin,latMin,lonMax,latMax
          url += '&filter=rect:76.0,8.0,80.3,13.5';
        }
        console.log('Fetching places from:', url);
        const response = await axios.get(url);
        console.log('Geoapify response:', response.data);

        const fetchedPlaces = response.data.features.map((feature) => ({
          id: feature.properties.place_id || feature.properties.datasource?.raw?.place_id || 'unknown',
          name: feature.properties.name || 'Unknown Place',
          description: feature.properties.address_line2 || 'A beautiful destination',
          coordinates: {
            lon: feature.properties.lon,
            lat: feature.properties.lat,
          },
          tags: feature.properties.categories || [],
          address: feature.properties.formatted || 'No address available',
          imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(feature.properties.name || 'tourism')},tamilnadu`,
        }));

        setPlaces(fetchedPlaces);
        if (fetchedPlaces.length === 0) {
          setError('No places found in this area. Try searching for a specific place like "Marina Beach".');
        }
      } catch (err) {
        console.error('Fetch places error:', err.response || err.message);
        if (err.response?.status === 400) {
          setError(`Invalid API request: ${err.response.data?.message || 'Check query parameters.'}`);
        } else {
          setError('Failed to fetch places. Please check your API key or network.');
        }
      }
      setLoading(false);
    };

    // Try geolocation, fallback to Tamil Nadu if it fails
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
          fetchPlaces(); // Tamil Nadu-wide
        },
        { timeout: 5000 }
      );
    } else {
      console.log('Geolocation not supported, using Tamil Nadu default');
      fetchPlaces(); // Tamil Nadu-wide
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
      // Search across Tamil Nadu with valid categories
      const response = await axios.get(
        `https://api.geoapify.com/v2/places?categories=tourism.attraction,beach,natural&limit=20&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}&filter=rect:76.0,8.0,80.3,13.5&text=${encodeURIComponent(searchQuery)}`
      );
      console.log('Search response:', response.data);

      const searchResults = response.data.features.map((feature) => ({
        id: feature.properties.place_id || feature.properties.datasource?.raw?.place_id || 'unknown',
        name: feature.properties.name || 'Unknown Place',
        description: feature.properties.address_line2 || 'A beautiful destination',
        coordinates: {
          lon: feature.properties.lon,
          lat: feature.properties.lat,
        },
        tags: feature.properties.categories || [],
        address: feature.properties.formatted || 'No address available',
        imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(feature.properties.name || 'tourism')},tamilnadu`,
      }));

      setPlaces(searchResults);
      if (searchResults.length === 0) {
        setError(`No places found for "${searchQuery}". Try terms like "Meenakshi Temple" or "Ooty".`);
      }
    } catch (err) {
      console.error('Search error:', err.response || err.message);
      if (err.response?.status === 400) {
        setError(`Invalid search request: ${err.response.data?.message || 'Check search term.'}`);
      } else {
        setError('Search failed. Please try again.');
      }
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
            placeholder="Search places (e.g., Marina Beach, Meenakshi Temple)"
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
                    e.target.src = 'https://source.unsplash.com/featured/?tourism';
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
              No places found. Try searching for places like "Meenakshi Temple" or "Ooty".
            </p>
          )
        )}
      </section>
    </div>
  );
};

export default Home;