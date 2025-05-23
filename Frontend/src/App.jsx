import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Interests from './pages/Interests';
import Account from './pages/Account';
import EditProfile from './pages/EditProfile';
import PlaceDetails from './pages/PlaceDetails';
import ChatbotPopup from './components/ChatbotPopup';
import PlacesByCategory from './pages/PlacesByCategory'; // Already added in previous step
import PlacesByTag from './pages/PlacesByTag'; // Add this import

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/interests" element={<Interests />} />
            <Route path="/account" element={<Account />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/place/:id" element={<PlaceDetails />} />
            <Route path="/places/:category" element={<PlacesByCategory />} />
            <Route path="/places/by-tag/:tag" element={<PlacesByTag />} /> {/* Add this route */}
          </Routes>
        </main>
        <ChatbotPopup />
      </div>
    </Router>
  );
};

export default App;