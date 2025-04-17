import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/places/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (response.ok) {
        setResults(data);
        setError('');
      } else {
        setError('No places found');
        setResults([]);
      }
    } catch (error) {
      setError('Unable to connect to the server');
      setResults([]);
    }
  };

  const handleAddToTrips = async (placeId, type) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const endpoint = type === 'upcoming' ? 'upcoming' : 'completed';
      const response = await fetch(`http://localhost:5000/api/places/trips/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ placeId }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Added to ${type} trips!`);
      } else {
        alert(data.message || 'Failed to add place');
      }
    } catch (error) {
      alert('Unable to connect to the server');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Search Places
        </h2>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
          <div className="flex">
            <input
              type="text"
              placeholder="Enter place name (e.g., Marina Beach)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((place) => (
            <div
              key={place._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={place.image}
                alt={place.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{place.name}</h3>
                <p className="mt-2 text-gray-600">{place.description}</p>
                <p className="mt-2 text-sm text-gray-500">Location: {place.location}</p>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => handleAddToTrips(place._id, 'upcoming')}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add to Upcoming
                  </button>
                  <button
                    onClick={() => handleAddToTrips(place._id, 'completed')}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add to Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;