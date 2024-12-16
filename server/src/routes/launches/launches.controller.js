const { getAllLaunches, scheduleNewLaunch, existsLaunchWithId, abortLaunchById } = require('../../models/launches.model');

// Controller for handling HTTP GET requests to retrieve all launches
async function httpGetAllLaunches(req, res) {
  // Fetch all launches from the database and send them as JSON response
  return res.status(200).json(await getAllLaunches());
}

// Controller for handling HTTP POST requests to add a new launch
async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  // Validate if all required properties are present in the request body
  if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
    return res.status(400).json({
      error: 'Missing required launch property' // Error for incomplete input
    });
  }

  // Parse and validate the launch date
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date' // Error for an invalid date format
    });
  }

  // Schedule the new launch and return a 201 Created status with the launch details
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

// Controller for handling HTTP DELETE requests to abort a launch
async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id); // Extract launch ID from the request URL parameters

  const existsLaunch = await existsLaunchWithId(launchId);
  // Check if the launch ID exists in the database
  if (!existsLaunch) {
    return res.status(404).json({
      error: 'Launch not found' // Error if the launch ID does not exist
    });
  }

  // Abort the launch and return a 200 OK status with the aborted launch details
  const aborted = abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted'
    });
  }

  return res.status(200).json({
    ok: true
  });
}

// Export all HTTP controllers for use in the routes
module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch
}
