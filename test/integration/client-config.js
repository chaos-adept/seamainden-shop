var request = require('supertest'),
    conf = require('config'),
    should = require('should'),
    url = "http://" + conf.host + ':' + conf.port;

describe('client-config', function() {
    it('request config', function(done){
        request(url)
            .get('/config')
            .expect(200)
            .end(function(err, res) {
                res.body.catalog.url.should.equal( conf.catalog.url );
                res.body.images.baseUrl.should.equal( conf.images.baseUrl );
                done(err);
            });
    })

})