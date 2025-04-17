import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Interests = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');

  const availableInterests = [
    'History',
    'Adventure',
    'Culture',
    'Relaxation',
    'Nature',
    'Sport',
    'Wildlife',
    'Beach',
    'Mountains',
    'Food & Wine',
    'Art',
    'Photography',
    'Festivals',
    'Local Experience',
    'Eco Tourism',
  ];

  const handleInterestToggle = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign up again');
        navigate('/signup');
        return;
      }
      const response = await fetch('http://localhost:5000/api/auth/interests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ interests }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/');
      } else {
        setError(data.message || 'Failed to save interests');
      }
    } catch (error) {
      setError('Unable to connect to the server');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Select Your Interests
        </h2>
        <p className="text-center text-sm text-gray-600">
          Choose what you love to explore
        </p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-3 justify-center">
            {availableInterests.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  interests.includes(interest)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Interests
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Interests;