var request = require('supertest'),
    conf = require('config'),
    should = require('should'),
    extend = require('util')._extend,
    url = "http://" + conf.host + ':' + conf.port;


describe('cart-api', function() {

    it('authz required', function(done){
        request(url)
            .post('/cart/buy')
            .expect(401)
            .end(function(err, res) {
                done(err);
            });
    });

    describe("work with auth user", function () {
        var accces_token;

        var cart = {
            items:[
                {id:"id1", count:123},
                {id:"id2", count:124}
            ]
        };

        var pending_cart = extend({}, cart);
        pending_cart.status = 'PENDING_STATUS';

        beforeEach(function(done){
            request(url)
                .post('/users/auth/login')
                .send({username: 'test', password: 'test'})
                .expect(200)
                .end(function(err, res) {
                    if (err) {done(err); return;}

                    accces_token = res.text;
                    done(err);
                });
        });

        it('should move cart to "pending status"', function (done) {
            request(url)
                .post('/cart/buy')
                .set('Authorization', "Bearer " + accces_token)
                .send(cart)
                .expect(200)
                .end(function(err, res) {
                    res.body.status.should.equal( 'PENDING_STATUS' );
                    done(err);
                });
        });

        it('should list carts with status', function (done) {
            request(url)
                .get('/cart/list')
                .set('Authorization', "Bearer " + accces_token)
                .expect(200)
                .end(function (err, res){
                    var expected = {list:[pending_cart]};
                    res.body.should.eql(expected);
                    done(err);
                });
        });
    });



});