const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
  constructor(userDAO) {
    if (!userDAO) throw new Error("UserDAO instance is required");
    this.userDAO = userDAO;
  }

  // Schema for user validation
  static getUserSchema() {
    return Joi.object({
      name: Joi.string().min(3).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });
  }

  // Schema for login validation
  static getLoginSchema() {
    return Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });
  }

  // Register a new user
  async registerUser(userData) {
    const { error } = UserService.getUserSchema().validate(userData);
    if (error) throw new Error(`Validation error: ${error.message}`);

    const existingUser = await this.userDAO.getUserByEmail(userData.email);
    if (existingUser) throw new Error("User with this email already exists");

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = { ...userData, password: hashedPassword };

    return await this.userDAO.createUser(user);
  }

  // Login user and generate JWT
  async loginUser(credentials) {
    const { error } = UserService.getLoginSchema().validate(credentials);
    if (error) throw new Error(`Validation error: ${error.message}`);
  
    const user = await this.userDAO.getUserByEmail(credentials.email);
    if (!user) throw new Error("Invalid email or password");
  
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) throw new Error("Invalid email or password");
  
    // Check if user is admin by comparing email and password with admin credentials in the environment variables
    let token;
    if (user.email === process.env.ADMIN_EMAIL && credentials.password === process.env.ADMIN_PASSWORD) {
      // Admin credentials matched, generate admin token
      token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, admin: true },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    } else {
      // Normal user, generate regular token
      token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    }
  
    return { token, user: { id: user._id, name: user.name, email: user.email } };
  }

  // Get user by ID
  async getUserById(userId) {
    if (!userId) throw new Error("User ID is required");
    return await this.userDAO.getUserById(userId);
  }

  // Update user details
  async updateUser(userId, updateFields) {
    if (!userId) throw new Error("User ID is required");
    if (updateFields.password) {
      updateFields.password = await bcrypt.hash(updateFields.password, 10);
    }

    return await this.userDAO.updateUser(userId, updateFields);
  }

  // Delete user
  async deleteUser(userId) {
    if (!userId) throw new Error("User ID is required");
    return await this.userDAO.deleteUser(userId);
  }
}

module.exports = UserService;
