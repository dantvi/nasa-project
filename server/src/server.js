// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const http = require('http');
const mongoose = require('mongoose');

// Import the Express application instance
const app = require('./app');

const { loadPlanetsData } = require('./models/planets.model');

// Define the server port, defaulting to 8000 if not specified in .env
const PORT = process.env.PORT || 8000;

// Set up MongoDB connection URL using environment variables for security
const { DB_USERNAME, DB_PASSWORD } = process.env;
const MONGO_URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.7eym4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create an HTTP server to handle requests using the Express app
const server = http.createServer(app);

// Event listener for successful MongoDB connection
mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

// Event listener for MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error(err);
});

// Function to start the server and initialize database connection
async function startServer() {
  // Connect to MongoDB using Mongoose
  await mongoose.connect(MONGO_URL);
  await loadPlanetsData();

  // Start the server and listen on the specified port
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  })
}

// Initialize the server
startServer();
