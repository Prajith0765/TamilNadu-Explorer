import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">Tamil Nadu Explorer</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium hover:text-blue-600"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <User className="h-5 w-5 mr-1" />
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="border-blue-500 text-gray-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-blue-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-blue-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-blue-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-blue-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
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