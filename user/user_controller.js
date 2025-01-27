const express = require('express');
const { verifyToken } = require('../middlewares/auth_middleware');

class UserController {
  constructor(userService) {
    if (!userService) throw new Error("UserService instance is required");
    this.userService = userService;
  }

  // Initialize routes
  initRoutes() {
    const router = express.Router();

    // Public routes
    router.post('/register', this.registerUser.bind(this));
    router.post('/login', this.loginUser.bind(this));

    // Protected routes
    router.get('/:id', verifyToken, this.getUserById.bind(this));
    router.put('/:id', verifyToken, this.updateUser.bind(this));
    router.delete('/:id', verifyToken, this.deleteUser.bind(this));

    return router;
  }

  // Controller methods
  async registerUser(req, res) {
    try {
      const userId = await this.userService.registerUser(req.body);
      res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async loginUser(req, res) {
    try {
      const loginResponse = await this.userService.loginUser(req.body);
      res.status(200).json(loginResponse);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const isUpdated = await this.userService.updateUser(req.params.id, req.body);
      if (!isUpdated) return res.status(404).json({ error: 'User not found or no changes made' });

      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const isDeleted = await this.userService.deleteUser(req.params.id);
      if (!isDeleted) return res.status(404).json({ error: 'User not found' });

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
