var express = require('express');
var bcrypt = require('bcryptjs'); // Encripta la contraseña
//var jwt = require('jsonwebtoken'); // Libreria para crear los token
var mdAutenticacion = require('../middlewares/autenticacion');
//var SEED = require('../config/config').SEED;


var app = express();

var ListaDeDeseos = require('../models/listadedeseos');

// =========================================================
// Obtener todos los Listadedeseos 
// =========================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    ListaDeDeseos.find({}).populate('usuario', 'nombre edad genero ciudad pais email img').populate('producto').skip(desde).limit(5).exec((err, listadedeseos) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando Listadedeseos en bbdd',
                errors: err
            });
        }

        ListaDeDeseos.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                listadedeseos: listadedeseos,
                total: conteo
            });
        })

    })


});


// =========================================================
// Crear un nuevo listadedeseos
// =========================================================
app.post('/', (req, res) => {

    var body = req.body;

    var listadedeseos = new ListaDeDeseos({

        nombre: body.nombre,
        usuario: body.usuario,
        producto: body.producto,


    })

    listadedeseos.save((err, listadedeseosGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear listadedeseos',
                errors: err
            });
        }



        res.status(201).json({

            ok: true,
            listadedeseos: listadedeseosGuardado

        });
    });
});



// =========================================================
// Actualizar listadedeseos
// =========================================================
app.put('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;
    var body = req.body;

    ListaDeDeseos.findById(id, (err, listadedeseos) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar listadedeseos',
                errors: err
            });
        }

        if (!listadedeseos) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El listadedeseos con el id' + id + 'no existe',
                errors: { message: 'No exite un listadedeseos con tal ID' }
            });

        }

        listadedeseos.nombre = body.nombre;
        listadedeseos.usuario = body.usuario;
        listadedeseos.producto = body.producto;



        listadedeseos.save((err, listadedeseosGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar listadedeseos',
                    errors: err
                });
            }

            listadedeseosGuardado.password = ':)';


            res.status(200).json({
                ok: true,
                listadedeseos: listadedeseosGuardado
            })



        })

    });


});


// =========================================================
// Borrar un listadedeseos por id
// =========================================================
app.delete('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;

    ListaDeDeseos.findByIdAndRemove(id, (err, listadedeseosBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar listadedeseos',
                errors: err
            });
        }

        if (!listadedeseosBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe listadedeseos con dicho id',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            listadedeseos: listadedeseosBorrado
        })


    })

});

module.exports = app;