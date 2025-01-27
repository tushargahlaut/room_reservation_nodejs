const UserService = require('../user_service');
const UserDAO = require('../user_dao'); // Mocked UserDAO
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../user_dao');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UserService Tests', () => {
  let userService;
  let mockUserDAO;

  beforeEach(() => {
    // Mock the UserDAO instance
    mockUserDAO = new UserDAO();
    userService = new UserService(mockUserDAO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should register a new user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    bcrypt.hash.mockResolvedValue('hashed_password');
    mockUserDAO.getUserByEmail.mockResolvedValue(null); // No existing user
    mockUserDAO.createUser.mockResolvedValue('mockUserId');

    const userId = await userService.registerUser(userData);

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(mockUserDAO.getUserByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockUserDAO.createUser).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
    });
    expect(userId).toBe('mockUserId');
  });

  test('should throw an error if user already exists during registration', async () => {
    const userData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    };

    mockUserDAO.getUserByEmail.mockResolvedValue({ id: 'existingId' });

    await expect(userService.registerUser(userData)).rejects.toThrow(
      'User already exists'
    );

    expect(mockUserDAO.getUserByEmail).toHaveBeenCalledWith('jane@example.com');
    expect(mockUserDAO.createUser).not.toHaveBeenCalled();
  });

  test('should login user successfully and return a token', async () => {
    const loginData = {
      email: 'jane@example.com',
      password: 'password123',
    };

    const mockUser = {
      _id: 'mockUserId',
      email: 'jane@example.com',
      password: 'hashed_password',
    };

    mockUserDAO.getUserByEmail.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true); // Password matches
    jwt.sign.mockReturnValue('mockJwtToken');

    const token = await userService.loginUser(loginData);

    expect(mockUserDAO.getUserByEmail).toHaveBeenCalledWith('jane@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'mockUserId', email: 'jane@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    expect(token).toBe('mockJwtToken');
  });

  test('should throw an error if email is not found during login', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    mockUserDAO.getUserByEmail.mockResolvedValue(null);

    await expect(userService.loginUser(loginData)).rejects.toThrow(
      'Invalid email or password'
    );

    expect(mockUserDAO.getUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test('should throw an error if password is incorrect during login', async () => {
    const loginData = {
      email: 'jane@example.com',
      password: 'wrongpassword',
    };

    const mockUser = {
      _id: 'mockUserId',
      email: 'jane@example.com',
      password: 'hashed_password',
    };

    mockUserDAO.getUserByEmail.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false); // Password mismatch

    await expect(userService.loginUser(loginData)).rejects.toThrow(
      'Invalid email or password'
    );

    expect(mockUserDAO.getUserByEmail).toHaveBeenCalledWith('jane@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_password');
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test('should fetch a user by ID successfully', async () => {
    const mockUser = {
      _id: 'mockUserId',
      name: 'John Doe',
      email: 'john@example.com',
    };

    mockUserDAO.getUserById.mockResolvedValue(mockUser);

    const user = await userService.getUserById('mockUserId');

    expect(mockUserDAO.getUserById).toHaveBeenCalledWith('mockUserId');
    expect(user).toMatchObject({
      _id: 'mockUserId',
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  test('should throw an error if user is not found by ID', async () => {
    mockUserDAO.getUserById.mockResolvedValue(null);

    await expect(userService.getUserById('invalidId')).rejects.toThrow(
      'User not found'
    );

    expect(mockUserDAO.getUserById).toHaveBeenCalledWith('invalidId');
  });
});
