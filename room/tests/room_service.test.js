const Joi = require('joi');
const RoomService = require('../room_service');
const RoomDAO = require('../room_dao');

jest.mock('../room_dao');

describe('RoomService', () => {
  let roomDAO;
  let roomService;

  beforeEach(() => {
    roomDAO = new RoomDAO();
    roomService = new RoomService(roomDAO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRoomData', () => {
    it('should validate room data successfully', () => {
      const roomData = {
        name: 'Conference Room',
        description: 'A large conference room',
        capacity: 10,
        services: ['WiFi', 'Projector'],
        pricePerNight: 100,
        availableFrom: '2023-01-01',
        availableTo: '2023-12-31',
      };

      const { error } = roomService.validateRoomData(roomData);

      expect(error).toBeUndefined();
    });

    it('should return validation error for invalid room data', () => {
        const roomData = {
          name: 'CR', // Invalid: too short
          capacity: 0, // Invalid: must be greater than 0
          pricePerNight: -100, // Invalid: must be non-negative
          availableFrom: 'invalid-date', // Invalid: not a date
          availableTo: '2023-12-31',
        };
    
        const { error } = roomService.validateRoomData(roomData);
    
        expect(error).toBeDefined();
        expect(error.details).toHaveLength(4); // Adjust this number based on the actual number of validation errors expected
      });
  });

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      const roomData = {
        name: 'Conference Room',
        description: 'A large conference room',
        capacity: 10,
        services: ['WiFi', 'Projector'],
        pricePerNight: 100,
        availableFrom: '2023-01-01',
        availableTo: '2023-12-31',
      };
      roomDAO.createRoom.mockResolvedValue('roomId123');

      const result = await roomService.createRoom(roomData);

      expect(roomDAO.createRoom).toHaveBeenCalledWith(roomData);
      expect(result).toBe('roomId123');
    });

    it('should throw a validation error for invalid room data', async () => {
      const roomData = {
        name: 'CR',
        capacity: 0,
        pricePerNight: -100,
        availableFrom: 'invalid-date',
        availableTo: '2023-12-31',
      };

      await expect(roomService.createRoom(roomData)).rejects.toThrow('Validation error:');
    });
  });
});