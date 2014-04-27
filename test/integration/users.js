var request = require('supertest'),
    conf = require('config'),
    should = require('should'),
    url = "http://" + conf.host + ':' + conf.port;

describe('users', function() {
    var firstToken;
    it('register', function(done){
        request(url)
            .post('/users/auth/register')
            .send({login:'test', password:'test'})
            .expect(200)
            .end(function(err, res) {
                firstToken = res.text;
                done()
            });
    });
    it('should Generate Unic Tokens for the same user', function(done) {
        request(url)
            .post('/users/auth/login')
            .send({username: 'test', password: 'test'})
            .expect(200)
            .end(function(err, res) {
                if (err) {done(err); return;}

                res.text.should.not.equal( firstToken );
                done(err);
            });
    })
});