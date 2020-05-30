let mongoose = require("mongoose");
let Tweet = require('../models/tweet');
const should = chai.should();
const chai = require('chai');
const crypto = require('crypto');
const chaiHttp = require('chai-http');
const index = require('../routes/index')
const expect = chai.expect;
const app = require('../app')
const User = require('../models/user');
chai.use(chaiHttp);

describe('Testing only negative responses for GETs of <<tweets>> route:\n', () => {
    it('GET: it should get an empty array and status 200', (done) => {
        chai.request(app)
            .get('/tweets')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(0);
                done();
            });
    });
    it('GET/:id: it should get an empty array and status 200', (done) => {
        chai.request(app)
            .get('/tweets')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(0);
                done();
            });
    });
    it('GET/:id: it should get an error json and status 200', (done) => {
        chai.request(app)
            .get('/tweets' + 'a123b')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.eql({
                    "error": {
                        "status": 404
                    },
                    "message": "Not Found"
                })
                done();
            });
    });
});

