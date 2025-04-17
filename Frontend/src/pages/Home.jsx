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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          setError('Unable to get location. Showing default places.');
          fetchPlaces();
        }
      );
    } else {
      setError('Geolocation not supported. Showing default places.');
      fetchPlaces();
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchPlaces(location);
    }
  }, [location]);

  const fetchPlaces = async (loc = null) => {
    setLoading(true);
    try {
      let url = `https://api.geoapify.com/v2/places?categories=tourism&limit=20&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`;
      if (loc) {
        url += `&filter=circle:${loc.lon},${loc.lat},10000`;
      } else {
        url += '&filter=circle:80.2707,13.0827,10000'; // Default: Chennai
      }
      const response = await axios.get(url);
      const fetchedPlaces = response.data.features.map((feature) => ({
        id: feature.properties.place_id,
        name: feature.properties.name || 'Unknown Place',
        description: feature.properties.address_line2 || 'A beautiful destination',
        coordinates: feature.properties,
        tags: feature.properties.categories || [],
        address: feature.properties.formatted || 'No address available',
        imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(feature.properties.name || 'tourism')},tamilnadu`,
      }));
      setPlaces(fetchedPlaces);
    } catch (err) {
      setError('Failed to fetch places.');
      console.error('Fetch places error:', err);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v2/places?categories=tourism&conditions=named&filter=place:51a69e94d17e6551c0590d833423e9a5e135c0f029db9e52&limit=20&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`
      );
      const searchResults = response.data.features.map((feature) => ({
        id: feature.properties.place_id,
        name: feature.properties.name || 'Unknown Place',
        description: feature.properties.address_line2 || 'A beautiful destination',
        coordinates: feature.properties,
        tags: feature.properties.categories || [],
        address: feature.properties.formatted || 'No address available',
        imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(feature.properties.name || 'tourism')},tamilnadu`,
      }));
      setPlaces(searchResults);
    } catch (err) {
      setError('Search failed.');
      console.error('Search error:', err);
    }
    setLoading(false);
  };

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
      alert('Failed to save place.');
      console.error('Save place error:', err);
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
            placeholder="Search places (e.g., Marina Beach, Chennai)"
            className="w-full outline-none text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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

      {/* Featured Destinations */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Featured Destinations</h2>
        {loading ? (
          <p>Loading places...</p>
        ) : (
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
                  >
                    <Heart className="h-5 w-5 mr-1" />
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;