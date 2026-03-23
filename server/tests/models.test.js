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

const createTestFilament = async () => {
  const res = await authPost('/api/filaments', {
    type: 'PLA',
    prod: 'BambuLab',
    colors: ['white', 'black'],
    priceForKg: 109
  });
  return res.body._id;
};

const sampleModel = (filamentId) => ({
  name: 'Xbox Controller Stand',
  category: 'gaming',
  printTimeHours: 2,
  printTimeMinutes: 30,
  weightGrams: 45,
  margin: 20,
  packageSize: 'medium',
  filamentVariants: [{
    filament: filamentId,
    colorVariants: [
      { color: 'white', quantity: 5 },
      { color: 'black', quantity: 3 }
    ]
  }],
  infill: {
    infillRate: 15,
    infillType: 'siatka'
  },
  supports: {
    enable: false,
    angle: 30,
    type: 'normal'
  },
  printMode: {
    vaseMode: false,
    fuzzyMode: false
  }
});

describe('POST /api/models', () => {
  it('should create a model with filament ObjectId reference', async () => {
    const filId = await createTestFilament();
    const res = await authPost('/api/models', sampleModel(filId));

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Xbox Controller Stand');
    expect(res.body.category).toBe('gaming');
    expect(res.body.weightGrams).toBe(45);
    expect(res.body.margin).toBe(20);
    expect(res.body._id).toBeDefined();
  });

  it('should return populated filament data', async () => {
    const filId = await createTestFilament();
    const res = await authPost('/api/models', sampleModel(filId));

    expect(res.statusCode).toBe(201);
    const fv = res.body.filamentVariants[0];
    expect(fv.filament).toBeDefined();
    expect(fv.filament.type).toBe('PLA');
    expect(fv.filament.prod).toBe('BambuLab');
    expect(fv.filament.priceForKg).toBe(109);
  });

  it('should reject model without required fields', async () => {
    const res = await authPost('/api/models', { name: 'Incomplete' });

    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/models', () => {
  let filId;

  beforeEach(async () => {
    filId = await createTestFilament();
    await authPost('/api/models', sampleModel(filId));
    await authPost('/api/models', {
      ...sampleModel(filId),
      name: 'Vase Planter',
      category: 'home',
      printMode: { vaseMode: true, fuzzyMode: false }
    });
    await authPost('/api/models', {
      ...sampleModel(filId),
      name: 'Textured Box',
      category: 'home',
      printMode: { vaseMode: false, fuzzyMode: true }
    });
  });

  it('should return all models with populated filaments', async () => {
    const res = await authGet('/api/models');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);

    const fv = res.body[0].filamentVariants[0];
    expect(fv.filament.type).toBe('PLA');
    expect(fv.filament.prod).toBe('BambuLab');
  });

  it('should filter by vaseMode', async () => {
    const res = await authGet('/api/models?vaseMode=true');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Vase Planter');
  });

  it('should filter by fuzzyMode', async () => {
    const res = await authGet('/api/models?fuzzyMode=true');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Textured Box');
  });

  it('should filter by filament_type', async () => {
    const res = await authGet('/api/models?filament_type=PLA');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('should return empty for non-matching filament_type', async () => {
    const res = await authGet('/api/models?filament_type=ASA');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('PUT /api/models/:id', () => {
  it('should update model fields', async () => {
    const filId = await createTestFilament();
    const created = await authPost('/api/models', sampleModel(filId));
    const id = created.body._id;

    const res = await authPut(`/api/models/${id}`, { name: 'Updated Stand', margin: 30 });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Stand');
    expect(res.body.margin).toBe(30);
    expect(res.body.category).toBe('gaming');
  });

  it('should update filament variant quantities', async () => {
    const filId = await createTestFilament();
    const created = await authPost('/api/models', sampleModel(filId));
    const id = created.body._id;

    const res = await authPut(`/api/models/${id}`, {
      filamentVariants: [{
        filament: filId,
        colorVariants: [
          { color: 'white', quantity: 10 },
          { color: 'black', quantity: 7 }
        ]
      }]
    });

    expect(res.statusCode).toBe(200);
    const cv = res.body.filamentVariants[0].colorVariants;
    expect(cv.find(c => c.color === 'white').quantity).toBe(10);
    expect(cv.find(c => c.color === 'black').quantity).toBe(7);
  });

  it('should return 404 for non-existent model', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await authPut(`/api/models/${fakeId}`, { name: 'Ghost' });

    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/models/:id', () => {
  it('should delete a model', async () => {
    const filId = await createTestFilament();
    const created = await authPost('/api/models', sampleModel(filId));
    const id = created.body._id;

    const res = await authDelete(`/api/models/${id}`);
    expect(res.statusCode).toBe(200);

    const getRes = await authGet('/api/models');
    expect(getRes.body).toHaveLength(0);
  });

  it('should return 404 for non-existent model', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await authDelete(`/api/models/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/filter-options', () => {
  it('should return categories and filament types from existing models', async () => {
    const filId = await createTestFilament();
    await authPost('/api/models', sampleModel(filId));
    await authPost('/api/models', {
      ...sampleModel(filId),
      name: 'Planter',
      category: 'home'
    });

    const res = await authGet('/api/filter-options');

    expect(res.statusCode).toBe(200);
    expect(res.body.categories).toContain('gaming');
    expect(res.body.categories).toContain('home');
    expect(res.body.filamentTypes).toContain('PLA');
  });
});
