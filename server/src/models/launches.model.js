// Import the MongoDB models for launches and planets
const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

// Default flight number for a new launch
const DEFAULT_FLIGHT_NUMBER = 100;

// Sample launch object with default values
const launch = {
  flightNumber: 100,
  mission: 'Keppler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030'),
  target: 'Kepler-442 b',
  customers: ['ZTM', 'NASA'],
  upcoming: true,
  success: true
};

// Save the initial sample launch to the database
saveLaunch(launch);

// Check if a launch with the given ID exists in the map
async function existsLaunchWithId(launchId) {
  return await launchesDatabase.findOne({
    flightNumber: launchId
  });
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

// Save new launch to the database
async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target // Check if the target planet exists
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  await launchesDatabase.findOneAndUpdate({
    flightNumber: launch.flightNumber, // Find the launch by flight number
  }, launch, {
    upsert: true // Insert if it doesn't exist, update if it does
  });
}

// Schedule new launch to the database
async function scheduleNewLaunch(launch) {
  const newFlightNumber = await getLatestFlightNumber() + 1;

  const newLaunch = Object.assign(launch, {
    sucess: true,
    upcoming: true,
    customers: ['ZTM', 'NASA'], // Default customers
    flightNumber: newFlightNumber
  });

  await saveLaunch(newLaunch);
}

// Abort launch by its ID
async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne({
    flightNumber: launchId
  }, {
    upcoming: false,
    sucess: false
  });

  return aborted.modifiedCount === 1;
}

// Export the functions to be used in other modules
module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById
}
