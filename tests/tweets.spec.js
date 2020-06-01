let mongoose = require("mongoose");
let Tweet = require('../models/tweet');
const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret";
const create = require('./utils/index')
const app = require('../app')
const User = require('../models/user');
const crypto = require('crypto');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

// describe('Testing only negative responses for GETs of <<tweets>> route:\n', () => {
//     it('GET: it should get an empty array and status 200', (done) => {
//         chai.request(app)
//             .get('/tweets')
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 res.body.should.be.a('array');
//                 res.body.length.should.be.eql(0);
//                 done();
//             });
//     });
//     it('GET/:id: it should get an empty array and status 200', (done) => {
//         chai.request(app)
//             .get('/tweets')
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 res.body.should.be.a('array');
//                 res.body.length.should.be.eql(0);
//                 done();
//             });
//     });
//     it('GET/:id: it should get an error json and status 200', (done) => {
//         chai.request(app)
//             .get('/tweets' + 'a123b')
//             .end((err, res) => {
//                 res.should.have.status(404);
//                 res.body.should.be.eql({
//                     "error": {
//                         "status": 404
//                     },
//                     "message": "Not Found"
//                 })
//                 done();
//             });
//     });
// });


describe('[CREATE] POST: /', () => {
    let user = undefined;
    let accessToken = undefined;
    let tweet = undefined;
    before('Set access token on local storage and create user', async () => {
        user = await create.createUser();
        const messagePayload = {
            _author: user._id,
            tweet: 'Hello world'
        }
        tweet = await Tweet.create(messagePayload);
        accessToken = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: "1 hour"});
    });
    after('Remove created user', async () => {
        user ? user.remove() : console.log('User does not exist');
        tweet ? tweet.remove() : console.log('Tweet not found');
    });
    it('Should create a new tweet', async () => {
        const result = await chai.request(app).post('/tweets/').set("Authorization", `Bearer ${accessToken}`).send(tweet);
        expect(result.status).to.equal(201);
    });
});

