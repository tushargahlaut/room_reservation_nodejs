const { ObjectId } = require('mongodb');

class RoomDAO {
  constructor(db) {
    if (!db) throw new Error("Database instance is required");
    this.db = db;
  }

  async createRoom(roomData) {
    try {
      const result = await this.db.collection('rooms').insertOne(roomData);
      return result.insertedId;
    } catch (error) {
      throw new Error('Error creating room: ' + error.message);
    }
  }

  async getRoomById(roomId) {
    try {
      const room = await this.db.collection('rooms').findOne({ _id: new ObjectId(roomId) });
      return room;
    } catch (error) {
      throw new Error('Error fetching room by ID: ' + error.message);
    }
  }

  async updateRoom(roomId, updatedData) {
    try {
      const result = await this.db.collection('rooms').updateOne(
        { _id: new ObjectId(roomId) },
        { $set: updatedData }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw new Error('Error updating room: ' + error.message);
    }
  }

  async deleteRoom(roomId) {
    try {
      const result = await this.db.collection('rooms').deleteOne({ _id: new ObjectId(roomId) });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error('Error deleting room: ' + error.message);
    }
  }

  async getRooms(query = {}, pagination = { page: 1, limit: 10 }) {
    try {
      const { page, limit } = pagination;
      const rooms = await this.db.collection('rooms')
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
      return rooms;
    } catch (error) {
      throw new Error('Error fetching rooms: ' + error.message);
    }
  }
}

module.exports = RoomDAO;
