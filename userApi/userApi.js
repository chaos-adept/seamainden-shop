/*
    Получаем идентификатор пользователя в нашей БД для
    поиска. В реальности необходим свой собственный идентификатор.

    Поля provider и id — свойства структуры профиля, которую возвращает
    PasssportJS — http://passportjs.org/guide/profile/
 */

var Guid = require('guid');


function prepareId(profile) {
    return ['user', profile.provider, profile.id].join('-');
}

function tokenToTokenId(token) {
    return ["token", token].join("-");
}

function generateTokenForUser(db, profile, callback) {
    var userId = prepareId(profile);
    var token = Guid.raw();
    var tokenId = tokenToTokenId(token);
    db.set(tokenId, userId,
         function (error) {
            if (error) {
                callback(error);
            }
            else {
                callback(null, token);
            }
        });
    db.expire(tokenId, Date.now() + 60*1000); //todo to config
}

function findByToken(db, token, callback) {
    var tokenId = db.get(tokenToTokenId(token), function (err, userId) {
        //fixme should be one request to db
        if (err) {
            callback(err);
        }

        if (userId) {
            getUser(db, userId, callback);
        } else {
            callback({name : 'NotFoundError'});
        }
    });
}

/*
    Найти существующего, или создать запись пользователя
    по данным из PassportJS.
 */
function findOrCreateUser(db, profile, callback) {
    var id = prepareId(profile);

    getUser(db, id, onFetchedUser);

    function onFetchedUser(error, user) {
        if (error) { return callback(error); }
        if (user) {
            // Нашли пользователя, можем возвращать
            return callback(null, user);
        } else {
            // Пользователь не найден, необходимо создать новую запись и вернуть ее
            return storeUser(db, profile, callback);
        }
    }
}
/*
    Вернуть учетную запись пользователя
 */
function getUser(db, id, callback) {
    console.log('load user with id', id);
    db.get(id, function (error, doc) {
        if (error) {
            if (error.name == 'NotFoundError') {
                callback();
            } else {
                callback(error);
            }
        } else {
            if (doc) {
                callback(null, JSON.parse(doc));
            } else {
                callback();
            }

        }
    });
}
/*
    Сохранить запись о пользователе в БД
 */
function storeUser(db, user, callback) {
    var id = prepareId(user);
    console.log('storeUser with id', id);
    db.set(id, JSON.stringify(user), function (error) {
        if (error) { callback(error); }
        else { callback(null, user); }
    });
}

/*
    Функция проверки пароля
 */
function checkPassword(user, password) {
    return password == user.password;
}

function serializeUser(user, callback) {
    callback(null, prepareId(user));
}

module.exports = function (db) {
    return {
        findOrCreateUser: findOrCreateUser.bind(null, db),
        serializeUser: serializeUser,
        deserializeUser: getUser.bind(null, db),
        getUser: getUser.bind(null, db),
        storeUser: storeUser.bind(null, db),
        checkPassword: checkPassword,
        generateTokenForUser: generateTokenForUser.bind(null, db),
        findByToken: findByToken.bind(null, db),
        prepareId: prepareId.bind(null)
    }
};