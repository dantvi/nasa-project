// Import the MongoDB models for launches and planets
const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

// Default flight number for a new launch
const DEFAULT_FLIGHT_NUMBER = 100;

// In-memory map to store launch data temporarily
const launches = new Map();

// Sample launch object with default values
const launch = {
  flightNumber: 100,
  mission: 'Keppler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030'),
  target: 'Keppler-442 b',
  customers: ['ZTM', 'NASA'],
  upcoming: true,
  success: true
};

// Save the initial sample launch to the database
saveLaunch(launch);

// Check if a launch with the given ID exists in the map
function existsLaunchWithId(launchId) {
  return launches.has(launchId);
}

// Retrieve the latest flight number from the database
async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase
    .findOne()
    .sort('-flightNumber'); // Sort by flight number in descending order

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER; // Default flight number if no launches exist
  }

  return latestLaunch.flightNumber;
}

// Get all launches from the database
async function getAllLaunches() {
  return await launchesDatabase.
    find({}, { '_id': 0, '__v': 0 });
}

// Save a new launch to the database
async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target // Check if the target planet exists
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  await launchesDatabase.updateOne({
    flightNumber: launch.flightNumber, // Find the launch by flight number
  }, launch, {
    upsert: true // Insert if it doesn't exist, update if it does
  });
}

// Add a new launch to the in-memory launches map
function addNewLaunch(launch) {
  latestFlightNumber++; // Increment the latest flight number
  launches.set(
    latestFlightNumber,
    Object.assign(launch, {
      flightNumber: latestFlightNumber,
      customers: ['ZTM', 'NASA'], // Default customers
      upcoming: true,
      success: true
    }));
}

// Abort a launch by its ID
function abortLaunchById(launchId) {
  const aborted = launches.get(launchId);
  aborted.upcoming = false;
  aborted.success = false;
  return aborted; // Return the updated launch object
}

// Export the functions to be used in other modules
module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById
}
