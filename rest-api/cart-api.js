var carts = {list: []};

function buyCart(cart) {
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