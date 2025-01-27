const { ObjectId } = require('mongodb');

class RoomAllocationDAO {
  constructor(db) {
    if (!db) throw new Error("Database instance is required");
    this.db = db;
  }

  // Create room allocation
  async allocateRoom(userId, roomId) {
    try {
      const user = await this.db.collection('users').findOne({ _id: new ObjectId(userId) });
      if (!user) throw new Error('User not found');

      if (user.role === 'admin') {
        throw new Error('Admin users cannot be allocated rooms');
      }

      const room = await this.db.collection('rooms').findOne({ _id: new ObjectId(roomId) });
      if (!room) throw new Error('Room not found');

      // Check if the room is already allocated (assuming we add an "allocated" field to rooms)
      if (room.allocated) {
        throw new Error('Room is already allocated');
      }

      // Update the room to mark it as allocated
      const updateResult = await this.db.collection('rooms').updateOne(
        { _id: new ObjectId(roomId) },
        { $set: { allocated: true, allocatedTo: userId } }
      );

      if (updateResult.modifiedCount === 0) throw new Error('Failed to allocate room');

      // Record the room allocation in a "room_allocations" collection
      const allocationResult = await this.db.collection('room_allocations').insertOne({
        userId: new ObjectId(userId),
        roomId: new ObjectId(roomId),
        allocatedAt: new Date(),
      });

      return allocationResult.insertedId;
    } catch (error) {
      throw new Error('Error allocating room: ' + error.message);
    }
  }

  // Get room allocation by user
  async getAllocationsByUser(userId) {
    try {
      return await this.db.collection('room_allocations')
        .find({ userId: new ObjectId(userId) })
        .toArray();
    } catch (error) {
      throw new Error('Error fetching room allocations: ' + error.message);
    }
  }

  // Get allocation by room
  async getAllocationsByRoom(roomId) {
    try {
      return await this.db.collection('room_allocations')
        .find({ roomId: new ObjectId(roomId) })
        .toArray();
    } catch (error) {
      throw new Error('Error fetching room allocation: ' + error.message);
    }
  }

  // Deallocate room
  async deallocateRoom(roomId) {
    try {
      const room = await this.db.collection('rooms').findOne({ _id: new ObjectId(roomId) });
      if (!room || !room.allocated) throw new Error('Room is not allocated');

      const deallocationResult = await this.db.collection('rooms').updateOne(
        { _id: new ObjectId(roomId) },
        { $set: { allocated: false, allocatedTo: null } }
      );

      if (deallocationResult.modifiedCount === 0) throw new Error('Failed to deallocate room');

      // Remove room allocation record
      await this.db.collection('room_allocations').deleteOne({ roomId: new ObjectId(roomId) });

      return true;
    } catch (error) {
      throw new Error('Error deallocating room: ' + error.message);
    }
  }
}

module.exports = RoomAllocationDAO;
