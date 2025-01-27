const Joi = require('joi');
const RoomDAO = require('./room_dao'); // Assuming RoomDAO class exists

class RoomService {
  constructor(roomDAO = new RoomDAO()) {
    this.roomDAO = roomDAO;
  }

  // Define validation schema for room creation and updating
  validateRoomData(roomData) {
    const schema = Joi.object({
      name: Joi.string().min(3).max(50).required(),
      description: Joi.string().max(255).optional(),
      capacity: Joi.number().integer().min(1).required(),
      services: Joi.array().items(Joi.string()).optional(),
      pricePerNight: Joi.number().required(),
      availableFrom: Joi.date().required(),
      availableTo: Joi.date().required(),
    });

    return schema.validate(roomData);
  }

  async createRoom(roomData) {
    const { error } = this.validateRoomData(roomData);
    if (error) {
      throw new Error(`Validation error: ${error.details.map((x) => x.message).join(', ')}`);
    }

    try {
      return await this.roomDAO.createRoom(roomData);
    } catch (error) {
      throw new Error(`Error creating room: ${error.message}`);
    }
  }

  async getRoomById(roomId) {
    try {
      return await this.roomDAO.getRoomById(roomId);
    } catch (error) {
      throw new Error(`Error fetching room: ${error.message}`);
    }
  }

  async updateRoom(roomId, updatedData) {
    const { error } = this.validateRoomData(updatedData);
    if (error) {
      throw new Error(`Validation error: ${error.details.map((x) => x.message).join(', ')}`);
    }

    try {
      return await this.roomDAO.updateRoom(roomId, updatedData);
    } catch (error) {
      throw new Error(`Error updating room: ${error.message}`);
    }
  }

  async deleteRoom(roomId) {
    try {
      return await this.roomDAO.deleteRoom(roomId);
    } catch (error) {
      throw new Error(`Error deleting room: ${error.message}`);
    }
  }

  async getRooms(query, pagination) {
    try {
      return await this.roomDAO.getRooms(query, pagination);
    } catch (error) {
      throw new Error(`Error fetching rooms: ${error.message}`);
    }
  }
}

module.exports = RoomService;
