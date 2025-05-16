import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const PlacesByTag = () => {
  const { tag } = useParams();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/places/by-tag/${tag}`);
        setPlaces(res.data);
      } catch (err) {
        setError('Failed to fetch places. Please try again later.');
        console.error('Error fetching places by tag:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [tag]);

  if (loading) return <div className="text-center p-4">Loading... ⏳</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 capitalize">{tag} Places in Tamil Nadu</h1>
      {places.length === 0 ? (
        <p>No places found with this tag.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <div key={place._id} className="border rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold">{place.name}</h2>
              <p className="text-gray-600">{place.location}</p>
              <p className="mt-2">{place.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {place.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/places/by-tag/${tag}`}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesByTag;