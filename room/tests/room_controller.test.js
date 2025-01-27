const request = require('supertest');
const express = require('express');
const RoomController = require('../room_controller');
const RoomService = require('../room_service');
const { verifyToken } = require('../../middlewares/auth_middleware');
const { checkAdminRole } = require('../../middlewares/check_admin_middleware');

jest.mock('../room_service');
jest.mock('../../middlewares/auth_middleware');
jest.mock('../../middlewares/check_admin_middleware');

describe('RoomController', () => {
  let app;
  let roomService;
  let roomController;

  beforeEach(() => {
    roomService = new RoomService();
    roomController = new RoomController(roomService);
    app = express();
    app.use(express.json());
    app.use('/rooms', roomController.router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /rooms/create', () => {
    it('should create a room successfully', async () => {
      verifyToken.mockImplementation((req, res, next) => next());
      checkAdminRole.mockImplementation((req, res, next) => next());
      roomService.createRoom.mockResolvedValue('roomId123');

      const response = await request(app)
        .post('/rooms/create')
        .send({ name: 'Conference Room' })
        .expect(200);

      expect(response.body).toEqual({ roomId: 'roomId123' });
      expect(roomService.createRoom).toHaveBeenCalledWith({ name: 'Conference Room' });
    });

    it('should return 401 if not authorized', async () => {
      verifyToken.mockImplementation((req, res, next) => res.status(401).send('Unauthorized'));

      await request(app)
        .post('/rooms/create')
        .send({ name: 'Conference Room' })
        .expect(401);
    });
  });

  describe('PUT /rooms/:id', () => {
    it('should update a room successfully', async () => {
      verifyToken.mockImplementation((req, res, next) => next());
      checkAdminRole.mockImplementation((req, res, next) => next());
      roomService.updateRoom.mockResolvedValue(true);

      const response = await request(app)
        .put('/rooms/roomId123')
        .send({ name: 'Updated Room' })
        .expect(200);

      expect(response.body).toEqual({ success: true });
      expect(roomService.updateRoom).toHaveBeenCalledWith('roomId123', { name: 'Updated Room' });
    });
  });

  describe('DELETE /rooms/:id', () => {
    it('should delete a room successfully', async () => {
      verifyToken.mockImplementation((req, res, next) => next());
      checkAdminRole.mockImplementation((req, res, next) => next());
      roomService.deleteRoom.mockResolvedValue(true);

      const response = await request(app)
        .delete('/rooms/roomId123')
        .expect(200);

      expect(response.body).toEqual({ success: true });
      expect(roomService.deleteRoom).toHaveBeenCalledWith('roomId123');
    });
  });

  describe('GET /rooms/:id', () => {
    it('should get a room by ID', async () => {
      roomService.getRoomById.mockResolvedValue({ id: 'roomId123', name: 'Conference Room' });

      const response = await request(app)
        .get('/rooms/roomId123')
        .expect(200);

      expect(response.body).toEqual({ id: 'roomId123', name: 'Conference Room' });
      expect(roomService.getRoomById).toHaveBeenCalledWith('roomId123');
    });
  });

  describe('GET /rooms', () => {
    it('should get all rooms', async () => {
      roomService.getRooms.mockResolvedValue([{ id: 'roomId123', name: 'Conference Room' }]);

      const response = await request(app)
        .get('/rooms')
        .expect(200);

      expect(response.body).toEqual([{ id: 'roomId123', name: 'Conference Room' }]);
      expect(roomService.getRooms).toHaveBeenCalled();
    });
  });
});