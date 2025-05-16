require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');
const connectDB = require('../config/db');

connectDB();

const places = [
  {
    name: 'Marina Beach',
    description: 'One of the longest urban beaches in the world, perfect for a sunset stroll.',
    address: 'Chennai',
    tags: ['Beach', 'Relaxation', 'Local Experience'],
    imageUrl: 'https://source.unsplash.com/featured/?marina-beach,chennai', // Dynamic Unsplash URL
    category: 'beach',
    coordinates: { lon: 80.2712, lat: 13.0500 },
  },
  {
    name: 'Meenakshi Temple',
    description: 'A historic Hindu temple known for its stunning architecture and vibrant festivals.',
    address: 'Madurai',
    tags: ['History', 'Culture', 'Architecture'],
    imageUrl: 'https://source.unsplash.com/featured/?meenakshi-temple,madurai',
    category: 'temple',
    coordinates: { lon: 78.1198, lat: 9.9192 },
  },
  {
    name: 'Ooty Hill Station',
    description: 'A scenic hill station with tea gardens, lakes, and cool weather.',
    address: 'Ooty',
    tags: ['Nature', 'Hill station', 'Adventure', 'Relaxation'],
    imageUrl: 'https://source.unsplash.com/featured/?ooty,tea-gardens',
    category: 'hill station',
    coordinates: { lon: 76.6932, lat: 11.4064 },
  },
  {
    name: 'Rameshwaram Temple',
    description: 'A sacred pilgrimage site with ancient architecture and spiritual significance.',
    address: 'Rameshwaram',
    tags: ['History', 'Culture', 'Architecture'],
    imageUrl: 'https://source.unsplash.com/featured/?rameshwaram-temple',
    category: 'temple',
    coordinates: { lon: 79.3174, lat: 9.2881 },
  },
  {
    name: 'Thanjavur Palace',
    description: 'A historical palace showcasing Chola architecture and art.',
    address: 'Thanjavur',
    tags: ['History', 'Architecture'],
    imageUrl: 'https://source.unsplash.com/featured/?thanjavur-palace',
    category: 'historical',
    coordinates: { lon: 79.1315, lat: 10.7870 },
  },
  {
    name: 'Courtallam Waterfalls',
    description: 'A series of cascading waterfalls known for their scenic beauty and therapeutic waters.',
    address: 'Courtallam, Tenkasi',
    tags: ['Nature', 'Waterfall', 'Relaxation'],
    imageUrl: 'https://source.unsplash.com/featured/?courtallam-waterfalls',
    category: 'waterfall',
    coordinates: { lon: 77.2811, lat: 8.9340 },
  },
  {
    name: 'Kumbakonam Village',
    description: 'A traditional village known for its temples and cultural heritage.',
    address: 'Kumbakonam',
    tags: ['Culture', 'Village', 'Heritage'],
    imageUrl: 'https://source.unsplash.com/featured/?kumbakonam,village',
    category: 'village',
    coordinates: { lon: 79.3910, lat: 10.9617 },
  },
  {
    name: 'Chidambaram Nataraja Temple Festival',
    description: 'A vibrant festival celebrating Lord Nataraja with dance and music.',
    address: 'Chidambaram',
    tags: ['Culture', 'Festival', 'Dance'],
    imageUrl: 'https://source.unsplash.com/featured/?chidambaram,festival',
    category: 'festival',
    coordinates: { lon: 79.6935, lat: 11.3993 },
  },
  {
    name: 'Mudumalai National Park',
    description: 'A wildlife sanctuary known for its diverse flora and fauna.',
    address: 'Nilgiris',
    tags: ['Wildlife', 'Nature', 'Adventure'],
    imageUrl: 'https://source.unsplash.com/featured/?mudumalai,wildlife',
    category: 'wildlife',
    coordinates: { lon: 76.5650, lat: 11.5970 },
  },
  {
    name: 'Tanjore Art Gallery',
    description: 'A museum showcasing traditional Tanjore paintings and artifacts.',
    address: 'Thanjavur',
    tags: ['Art', 'Museum', 'Culture'],
    imageUrl: 'https://source.unsplash.com/featured/?tanjore-art,thanjavur',
    category: 'museum',
    coordinates: { lon: 79.1315, lat: 10.7870 },
  },
  {
    name: 'Kanyakumari Sunrise Point',
    description: 'A scenic spot to witness the sunrise at the southernmost tip of India.',
    address: 'Kanyakumari',
    tags: ['Nature', 'Scenic', 'Sunrise'],
    imageUrl: 'https://source.unsplash.com/featured/?kanyakumari,sunrise',
    category: 'other',
    coordinates: { lon: 77.5385, lat: 8.0883 },
  },
];

const seedPlaces = async () => {
  try {
    await Place.deleteMany();
    const insertedPlaces = await Place.insertMany(places);
    console.log(`Seeded ${insertedPlaces.length} places successfully`);
    process.exit();
  } catch (error) {
    console.error('Error seeding places:', error);
    process.exit(1);
  }
};

seedPlaces();