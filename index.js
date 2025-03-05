const { MongoClient } = require("mongodb");
const readline = require("readline");

const uri = "mongodb+srv://effexDB:Fxz%404574896523@cluster0.1e08e.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main menu function
async function mainMenu() {
  console.log(`\n===== PLANET DATABASE MENU =====`);
  console.log(`1. Get info on a planet`);
  console.log(`2. Add a planet`);
  console.log(`3. Exit`);

  rl.question("\nWhat would you like to do? ", async (choice) => {
    if (choice === "1") {
      await getInfo();
    } else if (choice === "2") {
      await addPlanet();
    } else if (choice === "3") {
      console.log("Exiting program...");
      rl.close();
      await client.close();
      process.exit(0);
    } else {
      console.log("Invalid selection. Please choose a valid option.");
      mainMenu();
    }
  });
}

// Function to get planet info
async function getInfo() {
  rl.question("\nEnter the name of the planet: ", async (planetName) => {
    await getPlanetData(planetName.trim());
    mainMenu();  // Return to main menu after fetching data
  });
}

// Function to fetch planet data from the database
async function getPlanetData(planetName) {
  try {
    const database = client.db('sample_guides');
    const planets = database.collection('planets');

    const query = { name: planetName };

    const planet = await planets.findOne(query);

    if (planet) {
      console.log(planet);
    } else {
      console.log(`\nNo data found for planet: ${planetName}`);
    }
  } catch (error) {
    console.error("Error fetching planet data:", error);
  }
}

// Function to add a new planet
async function addPlanet() {
  try {
    const database = client.db('sample_guides');
    const planets = database.collection('planets');

    // Gather planet details from the user
    rl.question("Enter the name of the planet: ", (name) => {
      rl.question("Enter the order from the Sun: ", (orderFromSun) => {
        rl.question("Does the planet have rings? (true/false): ", (hasRings) => {
          rl.question("Enter the main atmosphere elements (comma-separated, e.g., H2,He,CH4): ", (mainAtmosphere) => {
            rl.question("Enter the surface temperature min, max, and mean values (comma-separated, e.g., null,null,-197.2): ", (temperature) => {
              
              // Process user input
              const mainAtmosphereArray = mainAtmosphere.split(',').map(item => item.trim());
              const [minTemp, maxTemp, meanTemp] = temperature.split(',').map(item => item.trim());

              // Create new planet object
              const newPlanet = {
                name: name,
                orderFromSun: parseInt(orderFromSun),
                hasRings: hasRings === 'true',
                mainAtmosphere: mainAtmosphereArray,
                surfaceTemperatureC: {
                  min: minTemp === 'null' ? null : parseFloat(minTemp),
                  max: maxTemp === 'null' ? null : parseFloat(maxTemp),
                  mean: parseFloat(meanTemp)
                }
              };

              // Insert planet into the database
              planets.insertOne(newPlanet, (err, result) => {
                if (err) {
                  console.error("Error inserting planet:", err);
                } else {
                  console.log("\nNew planet added successfully!");
                }
                mainMenu();  // Return to main menu after inserting planet
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Error adding planet:", error);
  }
}

// Connect to MongoDB and start the application
async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    mainMenu();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

run();
