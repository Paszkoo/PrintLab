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

const authPost = (url, body) =>
  request(app).post(url).set('Authorization', `Bearer ${token}`).send(body);

const authPut = (url, body) =>
  request(app).put(url).set('Authorization', `Bearer ${token}`).send(body);

const authDelete = (url) =>
  request(app).delete(url).set('Authorization', `Bearer ${token}`);

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

const sampleFilament = {
  type: 'PLA',
  prod: 'BambuLab',
  colors: ['white', 'black', 'red'],
  priceForKg: 109
};

describe('POST /api/filaments', () => {
  it('should create a new filament', async () => {
    const res = await authPost('/api/filaments', sampleFilament);

    expect(res.statusCode).toBe(201);
    expect(res.body.type).toBe('PLA');
    expect(res.body.prod).toBe('BambuLab');
    expect(res.body.colors).toEqual(['white', 'black', 'red']);
    expect(res.body.priceForKg).toBe(109);
    expect(res.body._id).toBeDefined();
  });

  it('should reject filament without required fields', async () => {
    const res = await authPost('/api/filaments', { type: 'PLA' });

    expect(res.statusCode).toBe(400);
  });

  it('should reject request without token', async () => {
    const res = await request(app)
      .post('/api/filaments')
      .send(sampleFilament);

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/filaments', () => {
  beforeEach(async () => {
    await authPost('/api/filaments', sampleFilament);
    await authPost('/api/filaments', {
      type: 'ASA',
      prod: 'BambuLab',
      colors: ['black'],
      priceForKg: 139
    });
    await authPost('/api/filaments', {
      type: 'PLA',
      prod: 'PrintMe',
      colors: ['green', 'blue'],
      priceForKg: 85
    });
  });

  it('should return all filaments', async () => {
    const res = await authGet('/api/filaments');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('should filter by type', async () => {
    const res = await authGet('/api/filaments?type=PLA');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach(f => expect(f.type).toBe('PLA'));
  });

  it('should filter by producer', async () => {
    const res = await authGet('/api/filaments?prod=BambuLab');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach(f => expect(f.prod).toBe('BambuLab'));
  });

  it('should filter by price range', async () => {
    const res = await authGet('/api/filaments?priceMin=100&priceMax=150');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach(f => {
      expect(f.priceForKg).toBeGreaterThanOrEqual(100);
      expect(f.priceForKg).toBeLessThanOrEqual(150);
    });
  });

  it('should sort by price ascending', async () => {
    const res = await authGet('/api/filaments?sortBy=priceForKg&sortOrder=asc');

    expect(res.statusCode).toBe(200);
    expect(res.body[0].priceForKg).toBe(85);
    expect(res.body[2].priceForKg).toBe(139);
  });
});

describe('PUT /api/filaments/:id', () => {
  it('should update a filament', async () => {
    const created = await authPost('/api/filaments', sampleFilament);
    const id = created.body._id;

    const res = await authPut(`/api/filaments/${id}`, { priceForKg: 120 });

    expect(res.statusCode).toBe(200);
    expect(res.body.priceForKg).toBe(120);
    expect(res.body.type).toBe('PLA');
  });

  it('should return 404 for non-existent filament', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await authPut(`/api/filaments/${fakeId}`, { priceForKg: 120 });

    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/filaments/:id', () => {
  it('should delete a filament', async () => {
    const created = await authPost('/api/filaments', sampleFilament);
    const id = created.body._id;

    const res = await authDelete(`/api/filaments/${id}`);

    expect(res.statusCode).toBe(200);

    const getRes = await authGet('/api/filaments');
    expect(getRes.body).toHaveLength(0);
  });

  it('should cascade-remove filament variants from models', async () => {
    const filRes = await authPost('/api/filaments', sampleFilament);
    const filId = filRes.body._id;

    await authPost('/api/models', {
      name: 'Test Model',
      category: 'test',
      printTimeHours: 1,
      printTimeMinutes: 30,
      weightGrams: 50,
      margin: 20,
      packageSize: 'medium',
      filamentVariants: [{
        filament: filId,
        colorVariants: [{ color: 'white', quantity: 5 }]
      }]
    });

    await authDelete(`/api/filaments/${filId}`);

    const modelsRes = await authGet('/api/models');
    const model = modelsRes.body[0];
    expect(model.filamentVariants).toHaveLength(0);
  });

  it('should return 404 for non-existent filament', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await authDelete(`/api/filaments/${fakeId}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/filaments/filter-options', () => {
  beforeEach(async () => {
    await authPost('/api/filaments', sampleFilament);
    await authPost('/api/filaments', {
      type: 'ASA', prod: 'PrintMe', colors: ['green'], priceForKg: 95
    });
  });

  it('should return unique types, producers and colors', async () => {
    const res = await authGet('/api/filaments/filter-options');

    expect(res.statusCode).toBe(200);
    expect(res.body.types).toContain('PLA');
    expect(res.body.types).toContain('ASA');
    expect(res.body.producers).toContain('BambuLab');
    expect(res.body.producers).toContain('PrintMe');
    expect(res.body.colors).toContain('white');
    expect(res.body.colors).toContain('green');
  });
});
