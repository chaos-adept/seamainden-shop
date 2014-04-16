var request = require('supertest'),
    conf = require('config');

describe('GET /users', function(){
    it('respond with json', function(done){
        request("http://" + conf.host + ':' + conf.port)
            .get('/app/index.html')
            .expect('Content-Type', /html/)
            .expect(200, done);
    })
})