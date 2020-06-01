const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const crypto = require('crypto');
const app = require('../app');
const User = require('../models/user');

const mongoose = require('mongoose');
chai.use(chaiHttp);
const {expectJson, createUser} = require('./utils/index');

const expectedNotFoundError = {
  message: 'User not found'
};

describe('[INDEX] GET /users/', () => {
  it('If users not found,then array is empty', async () => {
    const result = await chai.request(app).get('/users');
    expect(result.header).to.have.property('content-type');
    expect(result.header).to.have.property('content-type').contains('application/json');
    expect(result.status).to.equal(200);
    expect(result.body).to.be.instanceof(Array);
    expect(result.body).to.have.lengthOf(0);
  });
  describe('User inside DB', () => {
    let user = undefined;
    before('Create user in db', async () => {
      user = await createUser()
    });
    after('Remove created user', async () => {
      user ? user.remove() : console.log('User does not exist');
    });

    it('Return expected user from DB ', async () => {
      const result = await chai.request(app).get('/users/');
      expect(result.header).to.have.property('content-type').contains('application/json')
      expect(result.status).to.equal(200);
      expect(result.body).to.be.instanceof(Array);
      expect(result.body).to.have.lengthOf(1);
    });
    it('Return expected user from db', async () => {
      const result = await chai.request(app).get(`/users/${user.id.toString()}`);
      expect(result.header).to.have.property('content-type');
      expect(result.header['content-type']).contains('application/json');
    });
  });
});

describe('[SHOW] GET: /users/:id', () => {
  it('Return status 404 id user is missing', async () => {
    const newObjectId = mongoose.Types.ObjectId();
    const result = await chai.request(app).get(`/users/${newObjectId}`);
    expect(result.header).to.have.property('content-type');
    expect(result.header['content-type']).contains('application/json');
    expect(result.status).to.be.equal(404);
  });
});

describe('[UPDATE] PUT: /users', () => {
  let user = undefined;
  before('Create user', async() => {
    user = await createUser();
  })
  after('Delete user', async () => {
    user ? await user.remove() : console.log('Missing document');
  });
  it('Update an exist user inside database and return it', async () => {
    const updateUser = {
      name: 'Rosario',
      surname: 'Rossi',
      email: 'rosario@gmail.com',
      password: 'testUnictNew'
    };
    const result = await chai.request(app).put(`/users/${user._id.toString()}`).send(updateUser);
    expectJson(result);
    expect(user).to.be.not.undefined;
    expect(result.status).to.be.equal(200);

    const updatedUser = await User.findById(result.body._id);
    expect(updatedUser).to.has.property('name', updateUser.name.toString());
    expect(updatedUser).to.has.property('surname', updateUser.surname.toString());
    expect(updatedUser).to.has.property('password', updateUser.password);
    expect(updatedUser).to.has.property('email', updateUser.email.toString());
  });
  it('should return 404 status if user don\'t exists', async () => {
    const newObjectId = mongoose.Types.ObjectId();
    const result = await chai.request(app)
        .put(`/users/${newObjectId}`);
    expect(result.status).to.be.equal(404);
    expectJson(result);
    expect(result).to.have.property('body');
    expect(result.body).to.be.deep.equals(expectedNotFoundError);
  });
});

describe('[DELETE] DELETE: /:id', () => {
  it('should return 404 status if user don\'t exists', async () => {
    const newObjectId = mongoose.Types.ObjectId();
    const result = await chai.request(app)
        .delete(`/users/${newObjectId}`);
    expect(result.status).to.be.equal(404);
    expectJson(result);
    expect(result).to.have.property('body');
    expect(result.body).to.be.deep.equals(expectedNotFoundError);
  });
  describe('With an existing user', () => {
    let user = undefined;
    beforeEach('create user', async () => {
      user = await createUser();
    });
    it('Delete existing user', async () => {
      const result = await chai.request(app).delete(`/users/${user._id}`);
      expect(result).to.have.property('status', 200);
      expect(result).to.have.property('body');
      expect(result.body).to.be.deep.equals({message: 'User successfully deleted'})
    });
  })
});
describe('[CREATE] POST: /users/', () => {
  const newUser = {
    name: 'Giuseppe',
    surname: 'Grasso',
    email: 'peppe.grasso@gmail.com',
    password: 'giuseppeunict'
  }
  let userId = undefined;
  after('delete user', async () => {
    userId ? await User.findByIdAndDelete(userId) : console.log('Missing user id');
  });
  it('Create a new user inside database', async () => {
    const result = await chai.request(app).post('/users/').send(newUser);
    expect(result.header).to.have.property('content-type');
    expect(result.header['content-type']).contains('application/json');
    expect(result.body).to.have.property('_id');
    userId = result.body._id;
    expect(result).to.have.status(201);
    expect(userId).to.not.equal(undefined);
    expect(result.body).to.have.property('name', newUser.name);
    expect(result.body).to.have.property('surname', newUser.surname);
    expect(result.body).to.have.property('email', newUser.email);
    expect(result.body).to.have.property('password', new Buffer(
      crypto.createHash('sha256').update(newUser.password, 'utf8').digest()
      ).toString('base64'));
  });
});

