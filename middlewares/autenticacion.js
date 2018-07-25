var jwt = require('jsonwebtoken'); // Libreria para crear los token
var SEED = require('../config/config').SEED;


// =========================================================
// Verificar tokens
// =========================================================
exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

}