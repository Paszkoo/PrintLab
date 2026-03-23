const request = require('supertest');
const { connect, disconnect, clearDB } = require('./setup');

let app;
let token;

const registerAndGetToken = async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'tester@test.com', password: 'pass123', name: 'Tester' });
  return res.body.token;
};

const authGet = (url) =>
  request(app).get(url).set('Authorization', `Bearer ${token}`);

const authPut = (url, body) =>
  request(app).put(url).set('Authorization', `Bearer ${token}`).send(body);

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

beforeEach(async () => {
  token = await registerAndGetToken();
});

describe('GET /api/pricing-settings', () => {
  it('should create and return default pricing settings if none exist', async () => {
    const res = await authGet('/api/pricing-settings');

    expect(res.statusCode).toBe(200);
    expect(res.body.packagingCost).toBeDefined();
    expect(res.body.shippingPrices).toBeDefined();
    expect(res.body.shippingPrices.mini).toBeDefined();
    expect(res.body.shippingPrices.small).toBeDefined();
    expect(res.body.shippingPrices.medium).toBeDefined();
    expect(res.body.shippingPrices.big).toBeDefined();
    expect(res.body.electricityPricePerKwh).toBeDefined();
    expect(res.body.marginPercent).toBeDefined();
  });

  it('should return existing pricing settings', async () => {
    await authGet('/api/pricing-settings');
    const res = await authGet('/api/pricing-settings');

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBeDefined();
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/pricing-settings');

    expect(res.statusCode).toBe(401);
  });
});

describe('PUT /api/pricing-settings', () => {
  it('should update pricing settings', async () => {
    await authGet('/api/pricing-settings');

    const res = await authPut('/api/pricing-settings', {
      packagingCost: 8,
      electricityPricePerKwh: 1.50,
      shippingPrices: {
        mini: 10,
        small: 14,
        medium: 18,
        big: 30
      },
      marginPercent: 25
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.packagingCost).toBe(8);
    expect(res.body.electricityPricePerKwh).toBe(1.50);
    expect(res.body.shippingPrices.mini).toBe(10);
    expect(res.body.shippingPrices.big).toBe(30);
    expect(res.body.marginPercent).toBe(25);
  });

  it('should persist updated settings', async () => {
    await authGet('/api/pricing-settings');

    await authPut('/api/pricing-settings', { packagingCost: 12 });

    const res = await authGet('/api/pricing-settings');
    expect(res.body.packagingCost).toBe(12);
  });
});
