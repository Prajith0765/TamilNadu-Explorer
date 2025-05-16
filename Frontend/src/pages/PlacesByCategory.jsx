import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, MapPin } from 'lucide-react';

const PlacesByCategory = () => {
  const { category: urlCategory } = useParams();
  const category = urlCategory.replace('-', ' ');
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching places for category: "${category}"`);
        const apiUrl = `http://localhost:5000/api/places?category=${encodeURIComponent(category)}`;
        console.log(`API URL: ${apiUrl}`);
        const res = await axios.get(apiUrl);
        console.log('API response:', res.data);
        if (!Array.isArray(res.data)) {
          throw new Error('API response is not an array');
        }
        setPlaces(res.data);
      } catch (err) {
        console.error('Error fetching places:', err.response || err.message);
        setError(
          err.response?.data?.error ||
          err.message ||
          'Failed to fetch places. Please ensure the backend server is running and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [category]);

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
          lon: place.coordinates?.lon || 0,
          lat: place.coordinates?.lat || 0,
          tags: place.tags || [],
          address: place.address,
          imageUrl: place.imageUrl,
          externalId: place._id || place.externalId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Place saved!');
    } catch (err) {
      console.error('Save place error:', err.response || err.message);
      alert('Failed to save place.');
    }
  };

  const handleImageError = (e, placeName, retries = 3) => {
    if (retries > 0) {
      console.log(`Retrying image for ${placeName}, attempts left: ${retries}`);
      setTimeout(() => {
        e.target.src = `https://source.unsplash.com/featured/?${encodeURIComponent(placeName)},tamilnadu`;
      }, 2000);
      e.target.dataset.retries = retries - 1;
    } else {
      e.target.src = '/images/placeholder-tamilnadu.jpg';
      console.log(`Image failed for ${placeName}, using local fallback`);
    }
  };

  if (loading) return <div className="text-center p-4 text-blue-600 animate-pulse">Loading... ⏳</div>;
  if (error) return <div className="text-center p-4 text-red-500 bg-red-100 rounded-lg">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800 capitalize bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">
        {category} in Tamil Nadu
      </h1>
      {places.length === 0 ? (
        <p className="text-gray-500 text-lg">
          No places found for {category} in Tamil Nadu. Try a different category or expand the search area.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <div
              key={place._id || place.externalId}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <img
                src={place.imageUrl}
                alt={place.name}
                className="w-full h-48 object-cover"
                onError={(e) => handleImageError(e, place.name, e.target.dataset.retries ? parseInt(e.target.dataset.retries) : 3)}
                data-retries="3"
              />
              <div className="p-4">
                <Link
                  to={`/place/db/${place._id || place.externalId}`}
                  className="text-xl font-bold text-gray-900 hover:text-blue-600 transition duration-200"
                >
                  {place.name}
                </Link>
                <p className="text-gray-600 mt-2">{place.description}</p>
                <div className="flex items-center mt-2">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-gray-500 text-sm">{place.address}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {place.tags &&
                    place.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/places/by-tag/${tag}`}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition duration-200"
                      >
                        {tag}
                      </Link>
                    ))}
                </div>
                <button
                  onClick={() => handleSave(place)}
                  className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                  disabled={loading}
                >
                  <Heart className="h-5 w-5 mr-1" />
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesByCategory;