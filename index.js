const { MongoClient } = require("mongodb");
const readline = require("readline");

// Replace the uri string with your connection string.
const uri = "mongodb+srv://effexDB:Fxz%404574896523@cluster0.1e08e.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

// Function to get user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getPlanetData(planetName) {
  try {
    const database = client.db('sample_guides');
    const planets = database.collection('planets');

    // Query for the planet by name, and project only the "mainAtmosphere" field
    const query = { name: planetName };
    const projection = { _id: 0, mainAtmosphere: 1 };  // Corrected the typo here

    const planet = await planets.findOne(query, { projection });

    if (planet) {
      console.log(`\nMain atmosphere of ${planetName}:`, planet.mainAtmosphere);
    } else {
      console.log(`\nNo data found for planet: ${planetName}`);
    }
  } catch (error) {
    console.error("Error fetching planet data:", error);
  } finally {
    await client.close();
    rl.close();
  }
}

// Ask the user for a planet name
rl.question("Enter the name of the planet: ", (planetName) => {
  getPlanetData(planetName.trim());
});
