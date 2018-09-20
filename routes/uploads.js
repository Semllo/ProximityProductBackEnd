var express = require('express');
const fileUpload = require('express-fileupload');

var app = express();


var Productos = require('../models/producto');
var Usuario = require('../models/usuario');
var fs = require('fs');

// default options
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Validar tipos
    var tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Coleccion incorrecta',
            errors: { message: 'Los tipos permitidos son productos o usuarios' }
        });
    }


    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No se subio el archivo',
            errors: { message: 'Debe seleccionar una imagen' }
        });

    }


    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[Object.keys(nombreCortado).length - 1];

    // Extensiones aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'PNG'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Archivo no soportado',
            errors: { message: 'Debe subir un archivo con formato ' + extensionesValidas }

        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Path de archivos
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, path, res);

    })


});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                fs.unlinkSync(nombreArchivo);
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario inexistente',
                    errors: { message: 'Introduzca una id usuario valido' }
                });
            }

            var pathViejo = usuario.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ":)";

                return res.status(200).json({
                    ok: true,
                    pathViejo: pathViejo,
                    mensaje: 'Imagen actualizada',
                    usuario: usuarioActualizado
                });

            });

        });

    } else if (tipo === 'productos') {

        Productos.findById(id, (err, producto) => {



            if (!producto) {
                fs.unlinkSync(nombreArchivo);
                return res.status(400).json({
                    ok: false,
                    mensaje: 'productos inexistente',
                    errors: { message: 'Introduzca una id de producto valido' }
                });

            }


            var pathViejo = producto.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }



            producto.img = nombreArchivo;

            producto.save((err, productoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    pathViejo: pathViejo,
                    mensaje: 'Imagen actualizada',
                    producto: productoActualizado
                });

            });

        });

    }

}

module.exports = app;