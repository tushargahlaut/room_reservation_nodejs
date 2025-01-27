const { MongoClient } = require('mongodb');

class Database {
  constructor(uri, dbName) {
    if (!uri || !dbName) throw new Error('Database URI and Name are required');
    this.uri = uri;
    this.dbName = dbName;
    this.client = new MongoClient(uri);
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('Connected to the database');
      this.db = this.client.db(this.dbName);
      return this.db;
    } catch (error) {
      console.error('Database connection error:', error);
      process.exit(1);
    }
  }

  async close() {
    await this.client.close();
    console.log('Database connection closed');
  }
}

module.exports = Database;
