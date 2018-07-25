var express = require('express');
var bcrypt = require('bcryptjs'); // Encripta la contraseña
//var jwt = require('jsonwebtoken'); // Libreria para crear los token
var mdAutenticacion = require('../middlewares/autenticacion');
//var SEED = require('../config/config').SEED;


var app = express();

var Criticas = require('../models/critica');

// =========================================================
// Obtener todos los criticas 
// =========================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Criticas.find({}).populate('usuario', 'nombre edad genero ciudad pais email img').populate('producto').skip(desde).limit(5).exec((err, criticas) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando criticas en bbdd',
                errors: err
            });
        }

        Criticas.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                criticas: criticas,
                total: conteo
            });
        })

    })


});


// =========================================================
// Crear un nuevo criticas
// =========================================================
app.post('/', (req, res) => {

    var body = req.body;

    var criticas = new Criticas({

        nombre: body.nombre,
        descripcion: body.descripcion,
        nota: body.nota,
        usuario: body.usuario,
        producto: body.producto,


    })

    criticas.save((err, criticasGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear criticas',
                errors: err
            });
        }



        res.status(201).json({

            ok: true,
            criticas: criticasGuardado

        });
    });
});



// =========================================================
// Actualizar criticas
// =========================================================
app.put('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Criticas.findById(id, (err, criticas) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar criticas',
                errors: err
            });
        }

        if (!criticas) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El criticas con el id' + id + 'no existe',
                errors: { message: 'No exite un criticas con tal ID' }
            });

        }

        criticas.nombre = body.nombre;
        criticas.descripcion = body.descripcion;
        criticas.nota = body.nota;
        criticas.usuario = body.usuario;
        criticas.producto = body.producto;



        criticas.save((err, criticasGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar criticas',
                    errors: err
                });
            }

            criticasGuardado.password = ':)';


            res.status(200).json({
                ok: true,
                criticas: criticasGuardado
            })



        })

    });


});


// =========================================================
// Borrar un criticas por id
// =========================================================
app.delete('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;

    Criticas.findByIdAndRemove(id, (err, criticasBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar criticas',
                errors: err
            });
        }

        if (!criticasBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe criticas con dicho id',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            criticas: criticasBorrado
        })


    })

});

module.exports = app;