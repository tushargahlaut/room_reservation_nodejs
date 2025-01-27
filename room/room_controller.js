const express = require('express');
const RoomService = require('./room_service'); // Assuming RoomService exists
const { verifyToken } = require('../middlewares/auth_middleware'); // JWT validation middleware
const { checkAdminRole } = require('../middlewares/check_admin_middleware'); // Admin role check middleware

class RoomController {
  constructor(roomService = new RoomService()) {
    this.roomService = roomService;
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    
    // Admin-only routes protected by both JWT and RBAC middleware
    this.router.post('/create', verifyToken, checkAdminRole, this.createRoom.bind(this)); 
    this.router.put('/:id', verifyToken, checkAdminRole, this.updateRoom.bind(this)); 
    this.router.delete('/:id', verifyToken, checkAdminRole, this.deleteRoom.bind(this)); 

    // Routes that are accessible to anyone with a valid token
    this.router.get('/:id', this.getRoomById.bind(this));
    this.router.get('/', this.getRooms.bind(this));

    return this.router;
  }

  async createRoom(req, res) {
    try {
      const roomData = req.body;
      const roomId = await this.roomService.createRoom(roomData);
      res.status(201).json({ id: roomId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRoomById(req, res) {
    try {
      const room = await this.roomService.getRoomById(req.params.id);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.status(200).json(room);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateRoom(req, res) {
    try {
      const updatedData = req.body;
      const success = await this.roomService.updateRoom(req.params.id, updatedData);
      if (!success) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.status(200).json({ message: 'Room updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRoom(req, res) {
    try {
      const success = await this.roomService.deleteRoom(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRooms(req, res) {
    try {
      const { query, pagination } = req;
      const rooms = await this.roomService.getRooms(query, pagination);
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RoomController;
