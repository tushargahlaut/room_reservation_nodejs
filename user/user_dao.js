const { ObjectId } = require('mongodb');

class UserDAO {
  constructor(db) {
    if (!db) throw new Error("Database instance is required");
    this.collection = db.collection('users');
  }

  async createUser(user) {
    try {
      const result = await this.collection.insertOne(user);
      return result.insertedId;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async getUserById(userId) {
    try {
      return await this.collection.findOne({ _id: new ObjectId(userId) });
    } catch (error) {
      throw new Error(`Error fetching user by ID: ${error.message}`);
    }
  }

  async getUserByEmail(email) {
    try {
      return await this.collection.findOne({ email });
    } catch (error) {
      throw new Error(`Error fetching user by email: ${error.message}`);
    }
  }

  async updateUser(userId, updateFields) {
    try {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateFields }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async deleteUser(userId) {
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(userId) });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}

module.exports = UserDAO;
