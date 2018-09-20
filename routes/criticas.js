var express = require('express');
var bcrypt = require('bcryptjs'); // Encripta la contraseña
//var jwt = require('jsonwebtoken'); // Libreria para crear los token
var mdAutenticacion = require('../middlewares/autenticacion');
//var SEED = require('../config/config').SEED;


var app = express();

var Usuario = require('../models/usuario');
var Criticas = require('../models/critica');
var Producto = require('../models/producto');

// =========================================================
// Obtener todos las Lista de deseos 
// =========================================================

// Se pueden ver en usuarios, esto se podria borrar
app.get('/:id', (req, res, next) => {

    var id = req.params.id;
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.findById(id).populate('producto').skip(desde).limit(5).exec((err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando Listadedeseos en bbdd',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No exite un usuario con tal ID' }
            });

        }

        Usuario.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                listadedeseos: usuario.criticas,
                total: conteo
            });
        })

    })


});


// =========================================================
// Crear una nueva critica 
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

        var criticas = new Criticas({

            nombre: body.nombre,
            descripcion: body.descripcion,
            nota: body.nota,
            producto: body.producto,


        })

        usuario.criticas[usuario.criticas.length] = criticas;

        usuario.save((err, criticasGuardadas) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar criticas',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                criticasGuardadas: criticasGuardadas
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

    Usuario.findById({ _id: idUser }, (err, usuario) => {

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

        var posicion = 0;
        for (var i = 0; i < usuario.criticas.length; i++) {

            if (usuario.criticas[i]._id == idLista)
                posicion = i;

        }


        var criticas = new Criticas({


            nombre: body.nombre,
            descripcion: body.descripcion,
            nota: body.nota,
            producto: body.producto,


        })

        usuario.criticas[posicion] = criticas;




        usuario.save((err, criticasGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar criticas',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                criticas: criticas
            })



        })

    });


});



// =========================================================
// Borrar un criticas por id
// =========================================================
app.delete('/:idUser/:idLista' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var idUser = req.params.idUser;
    var idLista = req.params.idLista;

    Usuario.findById(idUser, (err, criticasBorrado) => {

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
                mensaje: 'No existen criticas con dicho id',
                errors: err
            });
        }

        criticasBorrado.criticas.id(idLista).remove();

        criticasBorrado.save((req, borrado) => {

            res.status(200).json({
                ok: true,
                criticas: borrado
            })
        });


    })

});



// =========================================================
// Actualizar nota media y popularidad por id del producto
// =========================================================
app.put('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;

    Usuario.find({ 'criticas.producto': id }).exec((err, usuarios) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarios) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La critica con el id' + id + 'no existe',
                errors: { message: 'No exite un usuarios con tal ID' }
            });

        }

        var sum = 0;


        for (var i = 0; i < usuarios.length; i++) {
            for (var j = 0; j < usuarios[i].criticas.length; j++) {



                if (usuarios[i].criticas[j].producto == id) {
                    sum += parseInt(usuarios[i].criticas[j].nota, 10);


                }

            }
        }

        var avg = sum / usuarios.length;
        var popularidad = usuarios.length;

        Producto.findById(id, (err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar productos',
                    errors: err
                });
            }

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El productos con el id' + id + 'no existe',
                    errors: { message: 'No exite un productos con tal ID' }
                });

            }


            productos.notamedia = avg;
            productos.popularidad = popularidad;

            productos.save((err, productosGuardado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar productos',
                        errors: err
                    });
                }


                res.status(200).json({
                    ok: true,
                    productos: productosGuardado
                })



            })



        })

    });


});

module.exports = app;

/*
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
app.put('/:id' /*, mdAutenticacion.verificaToken*/
/* , (req, res) => {

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
app.delete('/:id' /*, mdAutenticacion.verificaToken*/
/* , (req, res) => {

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


// =========================================================
// Mostrar media
// =========================================================
app.get('/media/:id', (req, res, next) => {

    var id = req.params.id;

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Criticas.find({ producto: id }).exec((err, criticas) => {

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
                mensaje: 'La critica con el id' + id + 'no existe',
                errors: { message: 'No exite un criticas con tal ID' }
            });

        }


        var sum = 0;
        for (var i = 0; i < criticas.length; i++) {
            sum += parseInt(criticas[i].nota, 10);
        }

        var avg = sum / criticas.length;


        res.status(200).json({

            ok: true,
            NotaMedia: avg

        });


    })


});

// =========================================================
// Actualizar nota media y popularidad por id de producto 
// =========================================================
app.put('/ActualizarMedia/:id' /*, mdAutenticacion.verificaToken*/
/* , (req, res) => {

    var id = req.params.id;

    Criticas.find({ producto: id }).exec((err, criticas) => {

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
                mensaje: 'La critica con el id' + id + 'no existe',
                errors: { message: 'No exite un criticas con tal ID' }
            });

        }

        var sum = 0;
        for (var i = 0; i < criticas.length; i++) {
            sum += parseInt(criticas[i].nota, 10);
        }

        var avg = sum / criticas.length;
        var popularidad = criticas.length;

        Producto.findById(id, (err, productos) => {

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


            productos.notamedia = avg;
            productos.popularidad = popularidad;

            productos.save((err, productosGuardado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar productos',
                        errors: err
                    });
                }


                res.status(200).json({
                    ok: true,
                    productos: productosGuardado
                })



            })



        })
















    });


});

*/