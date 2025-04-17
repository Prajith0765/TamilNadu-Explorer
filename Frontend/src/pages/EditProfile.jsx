import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const interestOptions = [
    'Beach', 'Mountains', 'Cities', 'Culture', 'Food & Wine',
    'Adventure', 'History', 'Art', 'Nature', 'Photography',
    'Wildlife', 'Architecture', 'Shopping', 'Nightlife', 'Relaxation',
    'Sports', 'Music', 'Festivals', 'Local Experience', 'Eco Tourism'
  ];

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/update-interests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ interests }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/account');
      } else {
        alert(data.message || 'Failed to update interests');
      }
    } catch (error) {
      alert('Unable to connect to the server');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Edit Your Interests
        </h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`p-3 text-sm rounded-lg border transition-all ${
                  interests.includes(interest)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 bg-blue-600 text-white rounded-md"
          >
            Save Interests
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;