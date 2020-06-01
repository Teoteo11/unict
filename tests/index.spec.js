const chai = require('chai');
const crypto = require('crypto');
const chaiHttp = require('chai-http');
const index = require('../routes/index')
const {expectJson, createUser} = require('./utils/index');
const expect = chai.expect;
const app = require('../app')
const User = require('../models/user');
chai.use(chaiHttp);

describe('[POST] /login', () => {
    let user = undefined;
    before('Create user in db', async () => {
        user = await createUser()
    });

    after('Remove created user', async () => {
        user ? user.remove() : console.log('User does not exist');
    });

    it('User login data not found', async () => {
        const fakeUser = {
            email: 'alessandro.ortis@gmail.com',
            password: '123456'
        }
        const result = await chai.request(app).post('/login').send(fakeUser);
        expect(result.header).to.have.property('content-type');
        expect(result.header['content-type']).contains('application/json');
        expect(result.status).to.be.equal(401);
        expect(result.body).to.have.property('message', 'Invalid email or password');
    });

    it('Login user successiful', async () => {
        const loginUser = {
            email: 'fabrizio@gmail.com',
            password: 'testUnict'
        }
        const result = await chai.request(app).post('/login').send(loginUser);
        expect(result.header).to.have.property('content-type');
        expect(result.header['content-type']).contains('application/json');
        expect(result.status).to.be.equal(200);
    });
});

