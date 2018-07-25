// Busqueda asincrona mediante promesas

var express = require('express');
var app = express();

var Usuario = require('../models/usuario');
var Categoria = require('../models/categoria');
var SubCategoria = require('../models/subcategoria');
var Producto = require('../models/producto');
var ListaDeDeseos = require('../models/listadedeseos');
var Critica = require('../models/critica');

// Rutas

// =========================================================
// Obtener coincidencias en coleccion  
// =========================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var desde = req.query.desde || 0;
    desde = Number(desde);


    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex, desde);
            break;

        case 'categorias':
            promesa = buscarCategorias(busqueda, regex, desde);
            break;

        case 'criticas':
            promesa = buscarCriticas(busqueda, regex, desde);
            break;

        case 'listasdedeseos':
            promesa = buscarListasDeDeseos(busqueda, regex, desde);
            break;

        case 'productos':
            promesa = buscarProducto(busqueda, regex, desde);
            break;

        case 'subcategorias':
            promesa = buscarSubCategoria(busqueda, regex, desde);
            break;


        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Tipo incorrecto, introduce usuario, medico u hospital',
                error: { message: 'Debe introducir usuarios, medicos u hospitales' }
            });

    }

    promesa.then(data => {

        res.status(200).json({

            ok: false,
            [tabla]: data,
            registros_actuales: (Object.keys(data).length - 1)

        });

    })

});

// =========================================================
// Obtener todas las coincidencias
// =========================================================
app.get('/bd/:busqueda', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
        buscarUsuarios(busqueda, regex, desde),
        buscarCategorias(busqueda, regex, desde),
        buscarCriticas(busqueda, regex, desde),
        buscarListasDeDeseos(busqueda, regex, desde),
        buscarProducto(busqueda, regex, desde),
        buscarSubCategoria(busqueda, regex, desde)
    ]).then(respuestas => {



        res.status(200).json({

            ok: true,
            usuarios: respuestas[0],
            categorias: respuestas[1],
            criticas: respuestas[2],
            listasdedeseos: respuestas[3],
            productos: respuestas[4],
            subCategoria: respuestas[5]


        });

    })

});



// =========================================================
// Busquedas
// =========================================================


// Categoria

function buscarCategorias(busqueda, regex, desde) {

    return new Promise((resolve, reject) => {

        var registros_totales;

        Categoria.count({}, (err, conteo) => {

            registros_totales = conteo;

        })

        Categoria.find({ nombre: regex })
            .skip(desde).limit(5)
            .exec((err, categorias) => {

                if (err) {

                    reject('Error al cargar las categorias', err);

                } else {

                    categorias.push({ registros_totales: registros_totales });
                    resolve(categorias);

                }

            });

    });

}


// Criticas

function buscarCriticas(busqueda, regex, desde) {

    return new Promise((resolve, reject) => {

        var registros_totales;

        Critica.count({}, (err, conteo) => {

            registros_totales = conteo;

        })

        Critica.find({ nombre: regex })
            .skip(desde).limit(5)
            .populate('usuario', 'nombre edad genero ciudad pais email img')
            .exec((err, criticas) => {

                if (err) {

                    reject('Error al cargar las criticas', err);

                } else {

                    criticas.push({ registros_totales: registros_totales });
                    resolve(criticas);

                }

            });

    });

}


// Buscar Listas de deseos

function buscarListasDeDeseos(busqueda, regex, desde) {

    return new Promise((resolve, reject) => {

        var registros_totales;

        ListaDeDeseos.count({}, (err, conteo) => {

            registros_totales = conteo;

        })

        ListaDeDeseos.find({ nombre: regex })
            .skip(desde).limit(5)
            .populate('usuario', 'nombre edad genero ciudad pais email img').populate('producto')
            .exec((err, listaDeDeseos) => {

                if (err) {

                    reject('Error al cargar las listas de deseos', err);

                } else {

                    listaDeDeseos.push({ registros_totales: registros_totales });
                    resolve(listaDeDeseos);

                }

            });

    });

}

// Buscar productos

function buscarProducto(busqueda, regex, desde) {

    return new Promise((resolve, reject) => {

        var registros_totales;

        Producto.count({}, (err, conteo) => {

            registros_totales = conteo;

        })

        Producto.find({ nombre: regex })
            .skip(desde).limit(5)
            .populate('subcategoria')
            .exec((err, productos) => {

                if (err) {

                    reject('Error al cargar los productos', err);

                } else {

                    productos.push({ registros_totales: registros_totales });
                    resolve(productos);

                }

            });

    });

}

// Buscar subcategorias

function buscarSubCategoria(busqueda, regex, desde) {

    return new Promise((resolve, reject) => {

        var registros_totales;

        SubCategoria.count({}, (err, conteo) => {

            registros_totales = conteo;

        })

        SubCategoria.find({ nombre: regex })
            .skip(desde).limit(5)
            .populate('categoria')
            .exec((err, subCategorias) => {

                if (err) {

                    reject('Error al cargar las subCategorias', err);

                } else {

                    subCategorias.push({ registros_totales: registros_totales });
                    resolve(subCategorias);

                }

            });

    });

}



// Buscar usuarios

function buscarUsuarios(busqueda, regex, desde) {

    return new Promise((resolve, reject) => {

        var registros_totales;

        Usuario.count({}, (err, conteo) => {

            registros_totales = conteo;

        })

        Usuario.find({ nombre: regex })
            .skip(desde).limit(5)
            .populate('catRecomendar')
            .exec((err, usuarios) => {

                if (err) {

                    reject('Error al cargar los usuarios', err);

                } else {

                    usuarios.push({ registros_totales: registros_totales });
                    resolve(usuarios);

                }

            });

    });

}




















/*
function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role').or([{ 'nombre': regex }, { 'email': regex }]).exec((err, usuarios) => {

            if (err) {

                reject('Error al cargar medico', err);

            } else {

                resolve(usuarios);

            }

        })

    });

}

*/
module.exports = app;