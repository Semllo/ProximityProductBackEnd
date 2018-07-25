var express = require('express');
var bcrypt = require('bcryptjs'); // Encripta la contraseña
//var jwt = require('jsonwebtoken'); // Libreria para crear los token
var mdAutenticacion = require('../middlewares/autenticacion');
//var SEED = require('../config/config').SEED;


var app = express();

var Categoria = require('../models/categoria');

// =========================================================
// Obtener todos los categorias 
// =========================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Categoria.find({}).skip(desde).limit(5).exec((err, categorias) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando categorias en bbdd',
                errors: err
            });
        }

        Categoria.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                categorias: categorias,
                total: conteo
            });
        })

    })


});


// =========================================================
// Crear un nuevo categoria
// =========================================================
app.post('/', (req, res) => {

    var body = req.body;

    var categoria = new Categoria({

        nombre: body.nombre

    })

    categoria.save((err, categoriaGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear categoria',
                errors: err
            });
        }



        res.status(201).json({

            ok: true,
            categoria: categoriaGuardado

        });
    });
});



// =========================================================
// Actualizar categoria
// =========================================================
app.put('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Categoria.findById(id, (err, categoria) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar categoria',
                errors: err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El categoria con el id' + id + 'no existe',
                errors: { message: 'No exite un categoria con tal ID' }
            });

        }

        categoria.nombre = body.nombre;

        categoria.save((err, categoriaGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar categoria',
                    errors: err
                });
            }

            categoriaGuardado.password = ':)';


            res.status(200).json({
                ok: true,
                categoria: categoriaGuardado
            })



        })

    });


});


// =========================================================
// Borrar un categoria por id
// =========================================================
app.delete('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar categoria',
                errors: err
            });
        }

        if (!categoriaBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe categoria con dicho id',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            categoria: categoriaBorrado
        })


    })

});

module.exports = app;