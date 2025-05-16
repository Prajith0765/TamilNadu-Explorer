import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, User, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlacesOpen, setIsPlacesOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  // Define place categories with hyphenated values for URLs
  const placeCategories = [
    { name: 'Temples', value: 'temple', icon: '🛕' },
    { name: 'Beaches', value: 'beach', icon: '🏖️' },
    { name: 'Peak', value: 'peak', icon: '⛰️' }, // Use hyphen
    { name: 'Castle', value: 'castle', icon: '🏛️' },
    { name: 'Park', value: 'park', icon: '🎉' },
    { name: 'Wildlife', value: 'wildlife', icon: '🐯' },
    { name: 'Waterfalls', value: 'waterfall', icon: '💧' },
    { name: 'Museums', value: 'museum', icon: '🖼️' },
    { name: 'Villages', value: 'village', icon: '🏘️' },
    { name: 'Other', value: 'other', icon: '🌍' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold">Tamil Nadu Explorer</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:items-center">
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium hover:text-yellow-300 transition duration-300"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              {/* Places Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsPlacesOpen(!isPlacesOpen)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium hover:text-yellow-300 transition duration-300"
                >
                  Places
                  <ChevronDown className={`h-4 w-4 ml-1 transform transition-transform ${isPlacesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPlacesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 animate-fadeIn">
                    {placeCategories.map((category) => (
                      <Link
                        key={category.value}
                        to={`/places/${category.value}`}
                        className="flex items-center px-4 py-2 text-gray-800 hover:bg-blue-100 hover:text-blue-600 transition duration-200 capitalize"
                        onClick={() => setIsPlacesOpen(false)}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:text-yellow-300 transition duration-300"
                >
                  <User className="h-5 w-5 mr-1" />
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:text-yellow-300 transition duration-300"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:text-yellow-300 transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:text-yellow-300 transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-yellow-300 hover:bg-blue-700 focus:outline-none transition duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-blue-600">
            <Link
              to="/"
              className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-blue-700 hover:text-yellow-300 transition duration-200"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {/* Places in Mobile Menu */}
            <div className="pl-3 pr-4 py-2">
              <button
                onClick={() => setIsPlacesOpen(!isPlacesOpen)}
                className="text-white block text-base font-medium w-full text-left hover:text-yellow-300 transition duration-200"
              >
                Places
                <ChevronDown className={`h-4 w-4 ml-1 inline transform transition-transform ${isPlacesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPlacesOpen && (
                <div className="pl-4 space-y-1">
                  {placeCategories.map((category) => (
                    <Link
                      key={category.value}
                      to={`/places/${category.value}`}
                      className="flex items-center pl-3 pr-4 py-2 text-base text-white hover:bg-blue-700 hover:text-yellow-300 transition duration-200 capitalize"
                      onClick={() => {
                        setIsOpen(false);
                        setIsPlacesOpen(false);
                      }}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-blue-700 hover:text-yellow-300 transition duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-blue-700 hover:text-yellow-300 transition duration-200 w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-blue-700 hover:text-yellow-300 transition duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-blue-700 hover:text-yellow-300 transition duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;