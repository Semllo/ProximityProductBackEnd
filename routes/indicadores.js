// Indicadores

var express = require('express');
var app = express();


var Producto = require('../models/producto');


// =========================================================
// Mostrar productos más nuevos
// ========================================================= 

app.get('/:orden/:propiedad', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);


    var propiedad = req.params.propiedad;
    var orden = req.params.orden;

    Producto.find({}).populate('subcategoria') /*.skip(desde).limit(5)*/ .exec((err, productos) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando productos en bbdd',
                errors: err
            });
        }

        var oJSON = sortJSON1(productos, propiedad, orden);

        Producto.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                productos: oJSON,
                total: conteo
            });
        })

    })


});




// =========================================================
// Tendencias
// =========================================================

app.get('/tendencias', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    var propiedad1 = 'fecha';
    var propiedad2 = 'popularidad';
    var propiedad3 = 'notamedia';
    var orden = 'desc';



    Producto.find({}).populate('subcategoria'). /*skip(desde).limit(5).*/ exec((err, productos) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando productos en bbdd',
                errors: err
            });
        }

        var oJSON = sortJSON2(productos, propiedad1, propiedad2, propiedad3, orden);

        Producto.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                productos: oJSON,
                total: conteo

            });
        })

    })

});




// =========================================================
// Ordenar JSON
// =========================================================

function sortJSON1(data, key, orden) {
    return data.sort((a, b) => {
        var x = a[key],
            y = b[key];

        if (x == undefined) { x = 0 }
        if (y == undefined) { y = 0 }

        if (orden === 'asc') {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }

        if (orden === 'desc') {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}


function sortJSON2(data, key1, key2, key3, orden) {
    return data.sort((a, b) => {
        var x = a[key1],
            y = b[key1],
            z = a[key2],
            w = b[key2],
            l = a[key3],
            k = b[key3]

        indice1 = z + l;
        indice2 = w + k;


        if (orden === 'asc') {
            return ((x <= y) && (z <= w) && (l <= k) ? -1 : ((x >= y) && (z >= w) && (l >= k) ? 1 : (indice1 <= indice2) && (x <= y) ? -1 : (indice1 >= indice2) && (x >= y) ? 1 : 0));
        }

        if (orden === 'desc') {
            return ((x >= y) && (z >= w) && (l >= k) ? -1 : ((x <= y) && (z <= w) && (l <= k) ? 1 : (indice1 >= indice2) && (x >= y) ? -1 : (indice1 <= indice2) && (x <= y) ? 1 : 0));
        }
    });
}







module.exports = app;