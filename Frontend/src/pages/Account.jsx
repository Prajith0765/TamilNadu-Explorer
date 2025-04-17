import React, { useState, useEffect } from 'react';
import { User, MapPin, Heart, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    interests: [],
    createdAt: '',
  });
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your account');
          navigate('/login');
          return;
        }
        const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.status === 200) {
          setUser({
            name: userResponse.data.name || 'User',
            email: userResponse.data.email || 'Not set',
            dateOfBirth: userResponse.data.dateOfBirth
              ? new Date(userResponse.data.dateOfBirth).toLocaleDateString('en-US')
              : 'Not set',
            interests: userResponse.data.interests || [],
            createdAt: userResponse.data.createdAt
              ? new Date(userResponse.data.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })
              : 'Not set',
          });
        }
        const savedResponse = await axios.get('http://localhost:5000/api/places/saved', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedDestinations(savedResponse.data);
      } catch (error) {
        setError(error.response?.status === 401 ? 'Session expired. Please log in again.' : 'Unable to fetch data');
        console.error('Fetch error:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-200 rounded-full p-4">
                <User className="h-12 w-12 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">Member since {user.createdAt}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900">Profile Details</h3>
              <div className="mt-2 space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Date of Birth:</span> {user.dateOfBirth}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900">Travel Interests</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.interests.length > 0 ? (
                  user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No interests selected</p>
                )}
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/edit-profile')}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Settings className="h-5 w-5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Saved Destinations</h3>
            {savedDestinations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedDestinations.map((place) => (
                  <Link
                    key={place._id}
                    to={`/place/${place.externalId || place._id}`}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={place.imageUrl}
                        alt={place.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://source.unsplash.com/featured/?tourism';
                        }}
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{place.name}</h4>
                        <p className="text-gray-600 text-sm">{place.address}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No saved destinations yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Account;