var express = require('express');
var bcrypt = require('bcryptjs'); // Encripta la contraseña
var jwt = require('jsonwebtoken'); // Libreria para crear los token
var SEED = require('../config/config').SEED;

var app = express();


var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }


        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                usuarios: 'Credenciales incorrectas - mail',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password))
            return res.status(400).json({
                ok: true,
                usuarios: 'Credenciales incorrectas - password',
                errors: err
            });

        // Crear token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });


        res.status(200).json({

            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id

        });

    })

})


module.exports = app;