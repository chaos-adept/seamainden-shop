var carts = {list: []};

function buyCart(cart) {
    cart.status = 'PENDING_STATUS';
    carts.list.push(cart);
}

function listCart() {
    return carts;
}

module.exports = function () {
    return {
        buy: buyCart,
        list: listCart
    }
};