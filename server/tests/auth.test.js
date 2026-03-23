const request = require('supertest');
const { connect, disconnect, clearDB } = require('./setup');

let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connect();
  app = require('../server');
});

afterAll(async () => {
  await disconnect();
});

afterEach(async () => {
  await clearDB();
});

const validUser = {
  email: 'test@example.com',
  password: 'secret123',
  name: 'Test User',
};

describe('POST /api/auth/register', () => {
  it('should register a new user and return token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.name).toBe('Test User');
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('should reject duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.statusCode).toBe(409);
  });

  it('should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com' });

    expect(res.statusCode).toBe(400);
  });

  it('should reject short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: '12', name: 'X' });

    expect(res.statusCode).toBe(500);
  });

  it('should hash the password (not store plaintext)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const User = require('../models/User');
    const user = await User.findById(res.body.user.id);
    expect(user.password).not.toBe('secret123');
    expect(user.password).toMatch(/^\$2[ab]\$/);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'secret123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });

    expect(res.statusCode).toBe(401);
  });

  it('should reject non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(res.statusCode).toBe(401);
  });

  it('should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });

    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);
    token = res.body.token;
  });

  it('should return user data with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.name).toBe('Test User');
    expect(res.body.password).toBeUndefined();
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.statusCode).toBe(401);
  });
});

describe('Data isolation between users', () => {
  it('should not see other user filaments', async () => {
    const user1 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user1@test.com', password: 'pass123', name: 'User 1' });
    const user2 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user2@test.com', password: 'pass123', name: 'User 2' });

    await request(app)
      .post('/api/filaments')
      .set('Authorization', `Bearer ${user1.body.token}`)
      .send({ type: 'PLA', prod: 'BambuLab', colors: ['white'], priceForKg: 100 });

    await request(app)
      .post('/api/filaments')
      .set('Authorization', `Bearer ${user2.body.token}`)
      .send({ type: 'ASA', prod: 'PrintMe', colors: ['black'], priceForKg: 120 });

    const res1 = await request(app)
      .get('/api/filaments')
      .set('Authorization', `Bearer ${user1.body.token}`);

    const res2 = await request(app)
      .get('/api/filaments')
      .set('Authorization', `Bearer ${user2.body.token}`);

    expect(res1.body).toHaveLength(1);
    expect(res1.body[0].type).toBe('PLA');

    expect(res2.body).toHaveLength(1);
    expect(res2.body[0].type).toBe('ASA');
  });
});
