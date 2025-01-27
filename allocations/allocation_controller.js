const express = require('express');
const RoomAllocationService = require('./allocation_service');
const { verifyToken } = require('../middlewares/auth_middleware'); // Assuming JWT verification middleware is in this path

class RoomAllocationController {
  constructor(roomAllocationService) {
    if (!roomAllocationService) throw new Error("RoomAllocationService instance is required");
    this.roomAllocationService = roomAllocationService;
    this.router = express.Router();
    this.initializeRoutes();
  }

  // Initialize all routes
  initializeRoutes() {
    this.router.post('/allocate', verifyToken, this.allocateRoom.bind(this));
    this.router.get('/allocations/user/:userId', verifyToken, this.getAllocationsByUser.bind(this));
    this.router.get('/allocations/room/:roomId', verifyToken, this.getAllocationsByRoom.bind(this));
    this.router.delete('/deallocate/:roomId', verifyToken, this.deallocateRoom.bind(this));
    return this.router;
  }

  // Allocate room to a user
  async allocateRoom(req, res) {
    try {
      const { userId, roomId } = req.body;

      // Check if the user is authorized to allocate the room
      if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Admin users cannot allocate rooms' });
      }

      // Call the service to allocate room
      const allocationId = await this.roomAllocationService.allocateRoom({ userId, roomId });
      res.status(201).json({ allocationId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get room allocations for a specific user
  async getAllocationsByUser(req, res) {
    try {
      const { userId } = req.params;
      const allocations = await this.roomAllocationService.getAllocationsByUser(userId);
      res.status(200).json(allocations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get room allocations for a specific room
  async getAllocationsByRoom(req, res) {
    try {
      const { roomId } = req.params;
      const allocations = await this.roomAllocationService.getAllocationsByRoom(roomId);
      res.status(200).json(allocations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Deallocate room
  async deallocateRoom(req, res) {
    try {
      const { roomId } = req.params;

      // Check if the user is authorized to deallocate
      if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Admin users cannot deallocate rooms' });
      }

      // Call the service to deallocate room
      const success = await this.roomAllocationService.deallocateRoom(roomId);
      if (success) {
        res.status(200).json({ message: 'Room deallocated successfully' });
      } else {
        res.status(400).json({ error: 'Failed to deallocate room' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RoomAllocationController;

