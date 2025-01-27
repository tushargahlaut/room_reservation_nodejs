const Joi = require('joi');
const RoomAllocationDAO = require('./allocation_dao'); // Assuming the DAO class is in this path

class RoomAllocationService {
  constructor(roomAllocationDAO) {
    if (!roomAllocationDAO) throw new Error("RoomAllocationDAO instance is required");
    this.roomAllocationDAO = roomAllocationDAO;
  }

  // Schema for room allocation validation
  static getRoomAllocationSchema() {
    return Joi.object({
      userId: Joi.string().hex().length(24).required(),
      roomId: Joi.string().hex().length(24).required(),
    });
  }

  // Allocate a room to a user
  async allocateRoom(roomAllocationData) {
    const { error } = RoomAllocationService.getRoomAllocationSchema().validate(roomAllocationData);
    if (error) throw new Error(`Validation error: ${error.message}`);

    const { userId, roomId } = roomAllocationData;
    
    // Allocate room via DAO
    const allocationId = await this.roomAllocationDAO.allocateRoom(userId, roomId);
    return allocationId;
  }

  // Get all room allocations for a user
  async getAllocationsByUser(userId) {
    if (!userId) throw new Error("User ID is required");
    return await this.roomAllocationDAO.getAllocationsByUser(userId);
  }

  // Get all room allocations for a room
  async getAllocationsByRoom(roomId) {
    if (!roomId) throw new Error("Room ID is required");
    return await this.roomAllocationDAO.getAllocationsByRoom(roomId);
  }

  // Deallocate a room
  async deallocateRoom(roomId) {
    if (!roomId) throw new Error("Room ID is required");
    return await this.roomAllocationDAO.deallocateRoom(roomId);
  }
}

module.exports = RoomAllocationService;
