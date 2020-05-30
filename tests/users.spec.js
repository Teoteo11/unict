const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/user');

const mongoose = require('mongoose');
chai.use(chaiHttp);

const {expectJson, createUser} = require('./utils/index');

const expectedNotFoundError = {
  error: {
    'status':404
  },
  message: 'Not Found'
};

describe.only('[INDEX] GET /users/', () => {
  it('If users not found,then array is empty', async () => {
    const result = await chai.request(app).get('/users');
    expect(result.header).to.have.property('content-type');
    expect(result.header).to.have.property('content-type').contains('application/json');
    expect(result.status).to.equal(200);
    expect(result.body).to.be.instanceof(Array);
    expect(result.body).to.have.lengthOf(0);
  });
  describe('User inside DB', () => {
    const newUser = {
      name: 'Roberto',
      surname: 'Bianchi',
      email: 'roberto.bianchi@gmail.com',
      password: 'robertotheking'
    };
    let createdUser = undefined;
    before('Create user in db', async () => {
      createdUser = await User.create(newUser);
    });
    after('Remove created user', async () => {
      await User.deleteMany();
    });

    it('Return expected user from DB ', async () => {
      const result = await chai.request(app).get('/users/');
      expect(result.header).to.have.property('content-type').contains('application/json')
      expect(result.status).to.equal(200);
      expect(result.body).to.be.instanceof(Array);
      expect(result.body).to.have.lengthOf(1);
    });
    it('Return expected user from db', async () => {
      const result = await chai.request(app).get(`/users/${createdUser.id.toString()}`);
      expect(result.header).to.have.property('content-type');
      expect(result.header['content-type']).contains('application/json');
    });
  });
});

describe.only('[SHOW] GET: /users/:id', () => {
  it('Return status 404 id user is missing', async () => {
    const newObjectId = mongoose.Types.ObjectId();
    const result = await chai.request(app).get(`/users/${newObjectId}`);
    expect(result.header).to.have.property('content-type');
    expect(result.header['content-type']).contains('application/json');
    expect(result.status).to.be.equal(404);
  });
});

describe('[DELETE] DELETE: /:id', () => {
  it.skip('should return 404 status if user don\'t exists', async () => {
    const newObjectId = mongoose.Types.ObjectId();
    const result = await chai.request(app)
        .delete(`/${newObjectId}`);
    expect(result.status).to.be.equal(404);
    expectJson(result);
    expect(result).to.have.property('body');
    expect(result.body).to.be.deep.equals(expectedNotFoundError);
  });
  describe('With an existing user', () => {
    let createdUser = undefined;
    beforeEach('create user', async () => {
      createdUser = await createUser();
    });
    afterEach('delete user', () => {
      createdUser ? createdUser.remove() : console.log('missing user');
    });
    it('Delete existing user', async () => {
      const result = await chai.request(app)
          .delete(`/${createdUser._id.toString()}`);
      expect(result).to.have.property('status', 200);
      expect(result).to.have.property('body');
      expect(result.body).to.be.deep.equals({message: 'User successfully deleted'})
    });
  })
});
