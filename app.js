require('dotenv').config(); // For environment variables
const express = require('express');
const Database = require('./db/db');
const UserDAO = require('./user/user_dao');
const UserService = require('./user/user_service');
const UserController = require('./user/user_controller');
//Importing the room files
const RoomDAO = require('./room/room_dao');
const RoomService = require('./room/room_service');
const RoomController = require('./room/room_controller');


// Load environment variables
const { DB_URI, DB_NAME, PORT } = process.env;
if (!DB_URI || !DB_NAME || !PORT) {
  throw new Error('Environment variables DB_URI, DB_NAME, and PORT must be set');
}

async function main() {
  const app = express();
  app.use(express.json()); // Parse JSON payloads

  // Database Initialization
  const database = new Database(DB_URI, DB_NAME);
  const db = await database.connect();

  // Initialize DAOs
  const userDAO = new UserDAO(db);

  // Initialize Services
  const userService = new UserService(userDAO);

  // Initialize Controllers
  const userController = new UserController(userService);


    // Initialize DAOs
  const roomDAO = new RoomDAO(db);

    // Initialize Services
  const roomService = new RoomService(roomDAO);

    // Initialize Controllers
  const roomController = new RoomController(roomService);


  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  // Set up Routes
  app.use('/users', userController.initRoutes());
  app.use("/rooms", roomController.initRoutes());

  // Start Server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await database.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Error initializing application:', error);
});
