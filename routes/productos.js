var express = require('express');
var bcrypt = require('bcryptjs'); // Encripta la contraseña
//var jwt = require('jsonwebtoken'); // Libreria para crear los token
var mdAutenticacion = require('../middlewares/autenticacion');
//var SEED = require('../config/config').SEED;


var app = express();

var Producto = require('../models/producto');

// =========================================================
// Obtener todos los productos 
// =========================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);

    Producto.find({}).populate('subcategoria').populate({ path: 'subcategoria', populate: { path: 'categoria' } }).skip(desde).limit(hasta).exec((err, productos) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando productos en bbdd',
                errors: err
            });
        }

        Producto.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                productos: productos,
                total: conteo
            });
        })

    })


});


// =========================================================
// Obtener producto por id 
// =========================================================
app.get('/:id', (req, res, next) => {

    var id = req.params.id;

    Producto.findById(id).populate('subcategoria').populate({ path: 'subcategoria', populate: { path: 'categoria' } }).exec((err, productos) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando productos en bbdd',
                errors: err
            });
        }

        if (!productos) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El producto con el id' + id + 'no existe',
                errors: { message: 'No exite un producto con tal ID' }
            });

        }

        Producto.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                productos: productos,
                total: conteo
            });
        })

    })


});

// =========================================================
// Crear un nuevo producto
// =========================================================
app.post('/', (req, res) => {

    var body = req.body;

    var producto = new Producto({

        nombre: body.nombre,
        precio: body.precio,
        descripcion: body.descripcion,
        imagen: body.imagen,
        subcategoria: body.subcategoria,

    })

    producto.save((err, productoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear producto',
                errors: err
            });
        }



        res.status(201).json({

            ok: true,
            producto: productoGuardado

        });
    });
});



// =========================================================
// Actualizar producto
// =========================================================
app.put('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Producto.findById(id, (err, producto) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar producto',
                errors: err
            });
        }

        if (!producto) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El producto con el id' + id + 'no existe',
                errors: { message: 'No exite un producto con tal ID' }
            });

        }

        producto.nombre = body.nombre;
        producto.precio = body.precio;
        producto.imagen = body.imagen;
        producto.descripcion = body.descripcion;
        producto.subcategoria = body.subcategoria;


        producto.save((err, productoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar producto',
                    errors: err
                });
            }

            productoGuardado.password = ':)';


            res.status(200).json({
                ok: true,
                producto: productoGuardado
            })



        })

    });


});


// =========================================================
// Borrar un producto por id
// =========================================================
app.delete('/:id' /*, mdAutenticacion.verificaToken*/ , (req, res) => {

    var id = req.params.id;

    Producto.findByIdAndRemove(id, (err, productoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar producto',
                errors: err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe producto con dicho id',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            producto: productoBorrado
        })


    })

});



// =========================================================
// Mostrar productos por categoria
// =========================================================

app.get('/:subcategoria', (req, res, next) => {

    var subcategorias = req.params.subcategoria;

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Producto.find({ subcategoria: subcategorias }).populate('subcategoria').skip(desde).limit(5).exec((err, productos) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando productos en bbdd',
                errors: err
            });
        }


        Producto.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                productos: productos,
                total: conteo
            });
        })

    })


});

module.exports = app;