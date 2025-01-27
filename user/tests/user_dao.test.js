const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const UserDAO = require('../user_dao');

describe('UserDAO Tests', () => {
  let mongoServer;
  let client;
  let db;
  let userDAO;

  beforeAll(async () => {
    // Start MongoDB in memory
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('test_db'); // Simulated database
    userDAO = new UserDAO(db);
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the users collection before each test
    await db.collection('users').deleteMany({});
  });

  test('should create a new user', async () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password_123',
    };

    const userId = await userDAO.createUser(user);
    expect(userId).toBeTruthy();

    const insertedUser = await db.collection('users').findOne({ _id: userId });
    expect(insertedUser).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password_123',
    });
  });

  test('should fetch a user by email', async () => {
    const user = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashed_password_123',
    };

    await userDAO.createUser(user);

    const fetchedUser = await userDAO.getUserByEmail('jane@example.com');
    expect(fetchedUser).toMatchObject({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashed_password_123',
    });
  });

  test('should return null for a non-existent email', async () => {
    const fetchedUser = await userDAO.getUserByEmail('nonexistent@example.com');
    expect(fetchedUser).toBeNull();
  });

  test('should fetch a user by ID', async () => {
    const user = {
      name: 'Mark Smith',
      email: 'mark@example.com',
      password: 'hashed_password_456',
    };

    const userId = await userDAO.createUser(user);
    const fetchedUser = await userDAO.getUserById(userId.toString());
    expect(fetchedUser).toMatchObject({
      name: 'Mark Smith',
      email: 'mark@example.com',
      password: 'hashed_password_456',
    });
  });

  test('should return null for a non-existent user ID', async () => {
    const nonExistentId = '61d9f29be93e2a88e21b1d6b';
    const fetchedUser = await userDAO.getUserById(nonExistentId);
    expect(fetchedUser).toBeNull();
  });

  test('should update an existing user', async () => {
    const user = {
      name: 'Lucy Brown',
      email: 'lucy@example.com',
      password: 'hashed_password_789',
    };

    const userId = await userDAO.createUser(user);

    const isUpdated = await userDAO.updateUser(userId, { name: 'Lucy Green' });
    expect(isUpdated).toBe(true);

    const updatedUser = await db.collection('users').findOne({ _id: userId });
    expect(updatedUser).toMatchObject({
      name: 'Lucy Green',
      email: 'lucy@example.com',
    });
  });

  test('should not update a non-existent user', async () => {
    const nonExistentId = '61d9f29be93e2a88e21b1d6b';
    const isUpdated = await userDAO.updateUser(nonExistentId, { name: 'Fake Name' });
    expect(isUpdated).toBe(false);
  });

  test('should delete an existing user', async () => {
    const user = {
      name: 'Tom Wilson',
      email: 'tom@example.com',
      password: 'hashed_password_123',
    };

    const userId = await userDAO.createUser(user);

    const isDeleted = await userDAO.deleteUser(userId);
    expect(isDeleted).toBe(true);

    const deletedUser = await db.collection('users').findOne({ _id: userId });
    expect(deletedUser).toBeNull();
  });

  test('should not delete a non-existent user', async () => {
    const nonExistentId = '61d9f29be93e2a88e21b1d6b';
    const isDeleted = await userDAO.deleteUser(nonExistentId);
    expect(isDeleted).toBe(false);
  });
});
