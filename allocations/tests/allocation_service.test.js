const Joi = require('joi');
const RoomAllocationService = require('../allocation_service');
const RoomAllocationDAO = require('../allocation_dao');

jest.mock('../allocation_dao');

describe('RoomAllocationService', () => {
  let roomAllocationDAO;
  let roomAllocationService;

  beforeEach(() => {
    roomAllocationDAO = new RoomAllocationDAO();
    roomAllocationService = new RoomAllocationService(roomAllocationDAO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('allocateRoom', () => {
    it('should allocate a room successfully', async () => {
      const roomAllocationData = { userId: '60d0fe4f5311236168a109ca', roomId: '60d0fe4f5311236168a109cb' };
      roomAllocationDAO.allocateRoom.mockResolvedValue('allocationId123');

      const result = await roomAllocationService.allocateRoom(roomAllocationData);

      expect(roomAllocationDAO.allocateRoom).toHaveBeenCalledWith('60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb');
      expect(result).toBe('allocationId123');
    });

    it('should throw a validation error for invalid data', async () => {
      const roomAllocationData = { userId: 'invalidUserId', roomId: '60d0fe4f5311236168a109cb' };

      await expect(roomAllocationService.allocateRoom(roomAllocationData)).rejects.toThrow('Validation error: "userId" length must be 24 characters long');
    });
  });

  describe('getAllocationsByUser', () => {
    it('should get allocations for a specific user', async () => {
      const userId = '60d0fe4f5311236168a109ca';
      roomAllocationDAO.getAllocationsByUser.mockResolvedValue([{ roomId: '60d0fe4f5311236168a109cb' }]);

      const result = await roomAllocationService.getAllocationsByUser(userId);

      expect(roomAllocationDAO.getAllocationsByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([{ roomId: '60d0fe4f5311236168a109cb' }]);
    });

    it('should throw an error if user ID is missing', async () => {
      await expect(roomAllocationService.getAllocationsByUser()).rejects.toThrow('User ID is required');
    });
  });

  describe('getAllocationsByRoom', () => {
    it('should get allocations for a specific room', async () => {
      const roomId = '60d0fe4f5311236168a109cb';
      roomAllocationDAO.getAllocationsByRoom.mockResolvedValue([{ userId: '60d0fe4f5311236168a109ca' }]);

      const result = await roomAllocationService.getAllocationsByRoom(roomId);

      expect(roomAllocationDAO.getAllocationsByRoom).toHaveBeenCalledWith(roomId);
      expect(result).toEqual([{ userId: '60d0fe4f5311236168a109ca' }]);
    });

    it('should throw an error if room ID is missing', async () => {
      await expect(roomAllocationService.getAllocationsByRoom()).rejects.toThrow('Room ID is required');
    });
  });

  describe('deallocateRoom', () => {
    it('should deallocate a room successfully', async () => {
      const roomId = '60d0fe4f5311236168a109cb';
      roomAllocationDAO.deallocateRoom.mockResolvedValue(true);

      const result = await roomAllocationService.deallocateRoom(roomId);

      expect(roomAllocationDAO.deallocateRoom).toHaveBeenCalledWith(roomId);
      expect(result).toBe(true);
    });

    it('should throw an error if room ID is missing', async () => {
      await expect(roomAllocationService.deallocateRoom()).rejects.toThrow('Room ID is required');
    });
  });
});