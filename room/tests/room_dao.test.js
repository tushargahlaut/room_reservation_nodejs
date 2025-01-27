const { MongoClient, ObjectId } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const RoomDAO = require('../room_dao');

describe('RoomDAO', () => {
  let mongoServer;
  let client;
  let db;
  let roomDAO;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db('testdb');
    roomDAO = new RoomDAO(db);
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await db.collection('rooms').deleteMany({});
  });

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      const roomData = { name: 'Conference Room', capacity: 10 };
      const roomId = await roomDAO.createRoom(roomData);

      expect(roomId).toBeDefined();
      const room = await db.collection('rooms').findOne({ _id: new ObjectId(roomId) });
      expect(room).toMatchObject(roomData);
    });

    it('should throw an error if room creation fails', async () => {
      jest.spyOn(db.collection('rooms'), 'insertOne').mockImplementation(() => {
        throw new Error('Insert failed');
      });

      await expect(roomDAO.createRoom({ name: 'Conference Room' })).rejects.toThrow('Error creating room: Insert failed');
    });
  });

  describe('getRoomById', () => {
    it('should fetch a room by ID successfully', async () => {
      const roomData = { name: 'Conference Room', capacity: 10 };
      const { insertedId } = await db.collection('rooms').insertOne(roomData);

      const room = await roomDAO.getRoomById(insertedId.toString());

      expect(room).toMatchObject(roomData);
    });

    it('should throw an error if fetching room by ID fails', async () => {
      jest.spyOn(db.collection('rooms'), 'findOne').mockImplementation(() => {
        throw new Error('Find failed');
      });

      await expect(roomDAO.getRoomById('invalidId')).rejects.toThrow('Error fetching room by ID: Find failed');
    });
  });

  describe('updateRoom', () => {
    it('should update a room successfully', async () => {
      const roomData = { name: 'Conference Room', capacity: 10 };
      const { insertedId } = await db.collection('rooms').insertOne(roomData);

      const updatedData = { name: 'Updated Room', capacity: 20 };
      const result = await roomDAO.updateRoom(insertedId.toString(), updatedData);

      expect(result.modifiedCount).toBe(1);
      const updatedRoom = await db.collection('rooms').findOne({ _id: insertedId });
      expect(updatedRoom).toMatchObject(updatedData);
    });

    it('should throw an error if room update fails', async () => {
      jest.spyOn(db.collection('rooms'), 'updateOne').mockImplementation(() => {
        throw new Error('Update failed');
      });

      await expect(roomDAO.updateRoom('invalidId', { name: 'Updated Room' })).rejects.toThrow('Error updating room: Update failed');
    });
  });
});