import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Heart } from 'lucide-react';

const PlaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const response = await axios.get(
          `https://api.geoapify.com/v2/place-details?id=${id}&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`
        );
        const data = response.data.features[0]?.properties || {};
        setPlace({
          id,
          name: data.name || 'Unknown Place',
          description: data.address_line2 || 'A beautiful destination in Tamil Nadu.',
          coordinates: data,
          tags: data.categories || [],
          address: data.formatted || 'No address available',
          imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(data.name || 'tourism')},tamilnadu`,
        });
      } catch (err) {
        setError('Failed to fetch place details.');
        console.error('Fetch place error:', err);
      }
      setLoading(false);
    };
    fetchPlace();
  }, [id]);

  const handleSave = async () => {
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

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!place) return <p>Place not found.</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-96 object-cover"
          onError={(e) => {
            e.target.src = 'https://source.unsplash.com/featured/?tourism';
          }}
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">{place.name}</h1>
          <p className="text-gray-600 mt-4">{place.description}</p>
          <div className="flex items-center mt-4">
            <MapPin className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-500">{place.address}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="mt-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Heart className="h-5 w-5 mr-2" />
            Save to Destinations
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;