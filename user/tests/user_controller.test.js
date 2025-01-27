const express = require('express');
const request = require('supertest');
const UserController = require('../user_controller');
const UserService = require('../user_service');

jest.mock('../user_service'); // Mock UserService

describe('UserController Tests', () => {
  let app;

  beforeEach(() => {
    // Set up an Express app and the UserController routes
    app = express();
    app.use(express.json());
    const userController = new UserController(new UserService());
    app.use('/users', userController.router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /users/register - should register a new user successfully', async () => {
    const mockUserId = 'mockUserId123';
    const requestBody = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    UserService.prototype.registerUser.mockResolvedValue(mockUserId);

    const response = await request(app).post('/users/register').send(requestBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: mockUserId });
    expect(UserService.prototype.registerUser).toHaveBeenCalledWith(requestBody);
  });

  test('POST /users/register - should return 400 if request body is invalid', async () => {
    const invalidRequestBody = {
      email: 'john@example.com',
      password: 'password123', // Missing "name"
    };

    const response = await request(app).post('/users/register').send(invalidRequestBody);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Validation error');
    expect(UserService.prototype.registerUser).not.toHaveBeenCalled();
  });

  test('POST /users/login - should log in a user and return a token', async () => {
    const mockToken = 'mockJwtToken123';
    const requestBody = {
      email: 'john@example.com',
      password: 'password123',
    };

    UserService.prototype.loginUser.mockResolvedValue(mockToken);

    const response = await request(app).post('/users/login').send(requestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: mockToken });
    expect(UserService.prototype.loginUser).toHaveBeenCalledWith(requestBody);
  });

  test('POST /users/login - should return 401 for invalid credentials', async () => {
    const requestBody = {
      email: 'john@example.com',
      password: 'wrongpassword',
    };

    UserService.prototype.loginUser.mockRejectedValue(new Error('Invalid email or password'));

    const response = await request(app).post('/users/login').send(requestBody);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password');
    expect(UserService.prototype.loginUser).toHaveBeenCalledWith(requestBody);
  });

  test('GET /users/:id - should fetch a user by ID', async () => {
    const mockUser = {
      _id: 'mockUserId',
      name: 'John Doe',
      email: 'john@example.com',
    };

    UserService.prototype.getUserById.mockResolvedValue(mockUser);

    const response = await request(app).get('/users/mockUserId');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(UserService.prototype.getUserById).toHaveBeenCalledWith('mockUserId');
  });

  test('GET /users/:id - should return 404 if user is not found', async () => {
    UserService.prototype.getUserById.mockRejectedValue(new Error('User not found'));

    const response = await request(app).get('/users/nonexistentId');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
    expect(UserService.prototype.getUserById).toHaveBeenCalledWith('nonexistentId');
  });
});
