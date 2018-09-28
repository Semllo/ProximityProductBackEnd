var express = require('express');
var bcrypt = require('bcryptjs'); // Encripta la contraseña
//var jwt = require('jsonwebtoken'); // Libreria para crear los token
var mdAutenticacion = require('../middlewares/autenticacion');
//var SEED = require('../config/config').SEED;


var app = express();

var Usuario = require('../models/usuario');

// =========================================================
// Obtener 5 usuarios 
// =========================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}).populate({ path: 'criticas.producto' }).populate({ path: 'listasDeDeseos.producto' }).skip(desde).limit(5).exec((err, usuarios) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios en bbdd',
                errors: err
            });
        }

        Usuario.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });
        })

    })


});

// =========================================================
// Obtener todos los usuarios 
// =========================================================
app.get('/usuarios', (req, res, next) => {


    Usuario.find({}).populate({ path: 'criticas.producto' }).populate({ path: 'listasDeDeseos.producto' }).exec((err, usuarios) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios en bbdd',
                errors: err
            });
        }

        Usuario.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });
        })

    })


});



// =========================================================
// Obtener todos los usuarios 
// =========================================================
app.get('/:id', (req, res, next) => {


    var id = req.params.id;
    Usuario.findById(id).populate({ path: 'criticas.producto' }).populate({ path: 'listasDeDeseos.producto' }).exec((err, usuarios) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios en bbdd',
                errors: err
            });
        }

        Usuario.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });
        })

    })


});
// =========================================================
// Crear un nuevo usuario
// =========================================================
app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({

        nombre: body.nombre,
        edad: body.edad,
        genero: body.genero,
        ciudad: body.ciudad,
        pais: body.pais,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // Contraseña encriptada 
        img: body.img,
        role: body.role,
        catRecomendar: body.catRecomendar,


    })

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }



        res.status(201).json({

            ok: true,
            usuario: usuarioGuardado

        });
    });
});



// =========================================================
// Actualizar usuario
// =========================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id).populate({ path: 'criticas.producto' }).populate({ path: 'listasDeDeseos.producto' }).exec((err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe',
                errors: { message: 'No exite un usuario con tal ID' }
            });

        }

        usuario.nombre = body.nombre;
        usuario.edad = body.edad;
        usuario.genero = body.genero;
        usuario.ciudad = body.ciudad;
        usuario.pais = body.pais;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.img = body.img;
        usuario.catRecomendar = body.catRecomendar;
        usuario.criticas = body.criticas;
        usuario.listasDeDeseos = body.listasDeDeseos;

        // console.log(usuario);

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario ' + usuarioGuardado,
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';


            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            })



        })

    });


});


// =========================================================
// Borrar un usuario por id
// =========================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con dicho id',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        })


    })

});

module.exports = app;