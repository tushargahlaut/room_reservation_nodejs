const { ObjectId } = require('mongodb');
const RoomAllocationDAO = require('../allocation_dao');

describe('RoomAllocationDAO', () => {
  let db;
  let roomAllocationDAO;

  beforeEach(() => {
    db = {
      collection: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };
    roomAllocationDAO = new RoomAllocationDAO(db);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('allocateRoom', () => {
    it('should allocate a room successfully', async () => {
      db.collection('users').findOne.mockResolvedValue({ _id: new ObjectId('user123'), role: 'user' });
      db.collection('rooms').findOne.mockResolvedValue({ _id: new ObjectId('room123'), allocated: false });
      db.collection('rooms').updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await roomAllocationDAO.allocateRoom('user123', 'room123');

      expect(db.collection('users').findOne).toHaveBeenCalledWith({ _id: new ObjectId('user123') });
      expect(db.collection('rooms').findOne).toHaveBeenCalledWith({ _id: new ObjectId('room123') });
      expect(db.collection('rooms').updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId('room123') },
        { $set: { allocated: true, allocatedTo: 'user123' } }
      );
      expect(result).toBeUndefined();
    });

    it('should throw an error if user is not found', async () => {
      db.collection('users').findOne.mockResolvedValue(null);

      await expect(roomAllocationDAO.allocateRoom('user123', 'room123')).rejects.toThrow('User not found');
    });

    it('should throw an error if user is an admin', async () => {
      db.collection('users').findOne.mockResolvedValue({ _id: new ObjectId('user123'), role: 'admin' });

      await expect(roomAllocationDAO.allocateRoom('user123', 'room123')).rejects.toThrow('Admin users cannot be allocated rooms');
    });

    it('should throw an error if room is not found', async () => {
      db.collection('users').findOne.mockResolvedValue({ _id: new ObjectId('user123'), role: 'user' });
      db.collection('rooms').findOne.mockResolvedValue(null);

      await expect(roomAllocationDAO.allocateRoom('user123', 'room123')).rejects.toThrow('Room not found');
    });

    it('should throw an error if room is already allocated', async () => {
      db.collection('users').findOne.mockResolvedValue({ _id: new ObjectId('user123'), role: 'user' });
      db.collection('rooms').findOne.mockResolvedValue({ _id: new ObjectId('room123'), allocated: true });

      await expect(roomAllocationDAO.allocateRoom('user123', 'room123')).rejects.toThrow('Room is already allocated');
    });
  });
});