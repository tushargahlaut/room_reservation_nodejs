const request = require('supertest');
const express = require('express');
const RoomAllocationController = require('../allocation_controller');
const RoomAllocationService = require('../allocation_service');
const { verifyToken } = require('../../middlewares/auth_middleware');

jest.mock('../allocation_service');
jest.mock('../../middlewares/auth_middleware');

describe('RoomAllocationController', () => {
  let app;
  let roomAllocationService;
  let controller;

  beforeEach(() => {
    roomAllocationService = new RoomAllocationService();
    controller = new RoomAllocationController(roomAllocationService);
    app = express();
    app.use(express.json());
    app.use(controller.router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /allocate', () => {
    it('should allocate a room successfully', async () => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { role: 'user' };
        next();
      });
      roomAllocationService.allocateRoom.mockResolvedValue('allocationId123');

      const response = await request(app)
        .post('/allocate')
        .send({ userId: 'user123', roomId: 'room123' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ allocationId: 'allocationId123' });
    });

    it('should return 403 if admin tries to allocate a room', async () => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { role: 'admin' };
        next();
      });

      const response = await request(app)
        .post('/allocate')
        .send({ userId: 'user123', roomId: 'room123' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Admin users cannot allocate rooms' });
    });
  });

  describe('GET /allocations/user/:userId', () => {
    it('should get allocations for a specific user', async () => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { role: 'user' };
        next();
      });
      roomAllocationService.getAllocationsByUser.mockResolvedValue([{ roomId: 'room123' }]);

      const response = await request(app).get('/allocations/user/user123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ roomId: 'room123' }]);
    });
  });

  describe('GET /allocations/room/:roomId', () => {
    it('should get allocations for a specific room', async () => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { role: 'user' };
        next();
      });
      roomAllocationService.getAllocationsByRoom.mockResolvedValue([{ userId: 'user123' }]);

      const response = await request(app).get('/allocations/room/room123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ userId: 'user123' }]);
    });
  });

  describe('DELETE /deallocate/:roomId', () => {
    it('should deallocate a room successfully', async () => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { role: 'user' };
        next();
      });
      roomAllocationService.deallocateRoom.mockResolvedValue(true);

      const response = await request(app).delete('/deallocate/room123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Room deallocated successfully' });
    });

    it('should return 403 if admin tries to deallocate a room', async () => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { role: 'admin' };
        next();
      });

      const response = await request(app).delete('/deallocate/room123');

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Admin users cannot deallocate rooms' });
    });
  });
});