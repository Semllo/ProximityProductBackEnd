var express = require('express');
var bcrypt = require('bcryptjs'); // Encripta la contraseña
//var jwt = require('jsonwebtoken'); // Libreria para crear los token
var mdAutenticacion = require('../middlewares/autenticacion');
//var SEED = require('../config/config').SEED;


var app = express();

var subCategoria = require('../models/subcategoria');

// =========================================================
// Obtener todos los subcategorias 
// =========================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    subCategoria.find({}).populate('categoria').skip(desde).limit(5).exec((err, subcategorias) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando subcategorias en bbdd',
                errors: err
            });
        }

        subCategoria.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                subcategorias: subcategorias,
                total: conteo
            });
        })

    })


});


// =========================================================
// Crear un nuevo subcategoria
// =========================================================
app.post('/', (req, res) => {

    var body = req.body;

    var subcategoria = new subCategoria({

        nombre: body.nombre,
        categoria: body.categoria

    })

    subcategoria.save((err, subcategoriaGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear subcategoria',
                errors: err
            });
        }



        res.status(201).json({

            ok: true,
            subcategorias: subcategoriaGuardado

        });
    });
});



// =========================================================
// Actualizar subcategoria
// =========================================================
app.put('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;
    var body = req.body;

    subCategoria.findById(id, (err, subcategoria) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar subcategoria',
                errors: err
            });
        }

        if (!subcategoria) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El subcategoria con el id' + id + 'no existe',
                errors: { message: 'No exite un subcategoria con tal ID' }
            });

        }

        subcategoria.nombre = body.nombre;
        subcategoria.categoria = body.categoria;


        subcategoria.save((err, subcategoriaGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar subcategoria',
                    errors: err
                });
            }

            subcategoriaGuardado.password = ':)';


            res.status(200).json({
                ok: true,
                subcategorias: subcategoriaGuardado
            })



        })

    });


});


// =========================================================
// Borrar un subcategoria por id
// =========================================================
app.delete('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;

    subCategoria.findByIdAndRemove(id, (err, subcategoriaBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar subcategoria',
                errors: err
            });
        }

        if (!subcategoriaBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe subcategoria con dicho id',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            subcategoria: subcategoriaBorrado
        })


    })

});

module.exports = app;