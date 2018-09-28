var express = require('express');
var bcrypt = require('bcryptjs'); // Encripta la contraseña
//var jwt = require('jsonwebtoken'); // Libreria para crear los token
var mdAutenticacion = require('../middlewares/autenticacion');
//var SEED = require('../config/config').SEED;


var app = express();

var Usuario = require('../models/usuario');
var ListaDeDeseos = require('../models/listadedeseos');

// =========================================================
// Obtener todos las Lista de deseos 
// =========================================================

// Se pueden ver en usuarios, esto se podria borrar
app.get('/:id', (req, res, next) => {

    var id = req.params.id;
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.findById(id).populate('usuario', 'nombre edad genero ciudad pais email img').populate('producto').skip(desde).limit(5).exec((err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando Listadedeseos en bd',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el usuario en la BD',
                errors: err
            });
        }

        Usuario.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                listadedeseos: usuario.listasDeDeseos,
                total: conteo
            });
        })

    })


});


// =========================================================
// Crear una nuevo lista de deseos
// =========================================================

app.post('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

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

        var listadedeseos = new ListaDeDeseos({

            nombre: body.nombre,
            producto: body.producto,


        })

        usuario.listasDeDeseos[usuario.listasDeDeseos.length] = listadedeseos;

        usuario.save((err, listadedeseosGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar listadedeseos',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                listadedeseos: listadedeseosGuardado
            })



        })

    });


});



// =========================================================
// Actualizr una  lista de deseos
// =========================================================

app.put('/:idUser/:idLista' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var idUser = req.params.idUser;
    var idLista = req.params.idLista;
    var body = req.body;

    Usuario.findById({ _id: idUser }).populate({ path: 'criticas.producto' }).populate({ path: 'listasDeDeseos', populate: { path: 'producto' } }).populate({ path: 'listasDeDeseos.producto' }).exec((err, usuarios) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarios) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe',
                errors: { message: 'No exite un usuario con tal ID' }
            });

        }






        var posicion = 0;
        for (var i = 0; i < usuarios.listasDeDeseos.length; i++) {

            if (usuarios.listasDeDeseos[i]._id == idLista)
                posicion = i;

        }


        var listadedeseos = new ListaDeDeseos({


            nombre: body.nombre,
            producto: body.producto,


        })

        usuarios.listasDeDeseos[posicion] = listadedeseos;




        usuarios.save((err, listadedeseosGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar listadedeseos',
                    errors: err
                });
            }


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
app.delete('/:idUser/:idLista' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var idUser = req.params.idUser;
    var idLista = req.params.idLista;

    Usuario.findById(idUser, (err, listadedeseosBorrado) => {

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

        listadedeseosBorrado.listasDeDeseos.id(idLista).remove();

        listadedeseosBorrado.save((req, borrado) => {

            res.status(200).json({
                ok: true,
                listadedeseos: borrado
            })
        });


    })

});


module.exports = app;