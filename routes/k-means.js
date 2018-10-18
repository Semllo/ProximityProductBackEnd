var express = require('express');
var bcrypt = require('bcryptjs'); // Encripta la contraseña
//var jwt = require('jsonwebtoken'); // Libreria para crear los token
var mdAutenticacion = require('../middlewares/autenticacion');
//var SEED = require('../config/config').SEED;


var app = express();

var Usuario = require('../models/usuario');


// =========================================================
// Obtener todos los usuarios 
// =========================================================
// Se pueden ver en usuarios, esto se podria borrar
app.get('/:id', (req, res, next) => {

    var id = req.params.id;


    Usuario.findById(id).exec((err, usuario) => {

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

        Usuario.find({}).populate({ path: 'criticas.producto' }).exec((err, usuarios) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios en bbdd',
                    errors: err
                });
            }


            //////////////////////////////////////////////////////////
            // CALCULO DE LA SIMILARIDAD ENTRE USUARIOS
            //////////////////////////////////////////////////////////

            // var coincidencias = [0];
            // var min = [0];
            // var max = [0];

            var numeradores = 0;
            var denominador1 = 0;
            var denominador2 = 0;
            similitudes = [0];


            //console.log('El usuario a predecir es: ' + usuario);
            //console.log('\n\n\n');
            //console.log('Los usuario totales son: ' + usuarios);
            //console.log('\n\n\n');




            for (var i = 0; i < usuarios.length; i++) {

                if (usuarios[i].criticas.length > 0 && usuarios[i]._id + '' != usuario._id + '') {
                    for (var j = 0; j < usuarios[i].criticas.length; j++) {

                        for (var k = 0; k < usuario.criticas.length; k++) {

                            if ((usuarios[i].criticas[j].producto._id + "") == (usuario.criticas[k].producto + "")) {

                                numeradores = numeradores + usuario.criticas[k].nota * usuarios[i].criticas[j].nota;
                                denominador1 = denominador1 + usuario.criticas[k].nota * usuario.criticas[k].nota;
                                denominador2 = denominador2 + usuarios[i].criticas[j].nota * usuarios[i].criticas[j].nota;

                            }

                        }

                    }

                    if (denominador1 * denominador2 * numeradores > 0) {
                        similitudes[i] = numeradores / (Math.sqrt(denominador1) * Math.sqrt(denominador2));
                        console.log(similitudes[i] + '=' + numeradores + '/' + Math.sqrt(denominador1) + '*' + Math.sqrt(denominador2));
                    } else {
                        similitudes[i] = 0;
                    }

                } else {
                    similitudes[i] = 0;
                }

                numeradores = 0;
                denominador1 = 0;
                denominador2 = 0;

            }

            console.log(similitudes);

            var posiciones = [0];

            for (let i = 0; i < similitudes.length; i++) {

                posiciones[i] = { similitud: similitudes[i], posicion: i }

            }


            //////////////////////////////////////////////////////////
            // CALCULO DE LOS K-VECINOS
            //////////////////////////////////////////////////////////



            // Ordenamos de mas afines a menos afines
            var maximos = [0];
            contador = 0;

            posiciones.sort((a, b) => {
                return b.similitud - a.similitud;
            });

            console.log(posiciones);

            //////////////////////////////////////////////////////////
            // CALCULO DE TODAS LAS PREDICCIONES
            //////////////////////////////////////////////////////////

            vecinos = 4;
            productos = [];
            entrar = true;
            contar = [];



            for (let i = 0; i < usuarios[posiciones[0].posicion].criticas.length; i++) {

                productos[i] = { media: usuarios[posiciones[0].posicion].criticas[i].nota * posiciones[0].similitud, producto: usuarios[posiciones[0].posicion].criticas[i].producto };
                contar[i] = posiciones[0].similitud;
            }

            for (let i = 1; i < posiciones.length; i++) {

                for (let j = 0; j < usuarios[posiciones[i].posicion].criticas.length; j++) {

                    // console.log('Nueva critica');
                    for (let k = 0; k < productos.length; k++) {

                        // console.log(usuarios[posiciones[i].posicion].criticas[j].producto.nombre + '==' + productos[k].producto.nombre);
                        if (usuarios[posiciones[i].posicion].criticas[j].producto._id + '' == productos[k].producto._id + '') {

                            // console.log('Actualizar media');

                            productos[k].media = productos[k].media + usuarios[posiciones[i].posicion].criticas[j].nota * posiciones[i].similitud;
                            // console.log('Soy la critica:' + j);
                            // console.log(usuarios[posiciones[i].posicion].criticas[j].nota);
                            // console.log(productos[k].media);
                            // console.log(contar);
                            // console.log('La k: ' + k);

                            contar[k] = contar[k] + posiciones[i].similitud;
                            // console.log(contar[k])
                            entrar = false;
                        } else if (k == (productos.length - 1) && entrar == true) {

                            // console.log('Producto nuevo');
                            productos[productos.length] = { media: usuarios[posiciones[i].posicion].criticas[j].nota * posiciones[i].similitud, producto: usuarios[posiciones[i].posicion].criticas[j].producto };
                            contar[productos.length - 1] = posiciones[i].similitud;
                            // console.log(contar[productos.length])
                            k = 9999999;
                        }

                    }
                    entrar = true;
                }
            }

            for (let i = 0; i < contar.length; i++) {

                console.log(productos[i].media + ' / ' + contar[i]);
                if (contar[i] != undefined) {
                    productos[i].media = productos[i].media / contar[i];
                }

            }

            // console.log(productos);

            //////////////////////////////////////////////////////////
            // MOSTRAR LAS M MEJORES RECOMENDACIONES
            //////////////////////////////////////////////////////////

            productos.sort((a, b) => {
                return b.media - a.media;
            });

            final = []
            index = 0;
            pasa = true;
            for (let i = 0; i < productos.length; i++) {

                // console.log('Soy el producto: ' + productos[i].producto._id);
                for (var k = 0; k < usuario.criticas.length; k++) {

                    // console.log('Soy el producto de usuario: ' + usuario.criticas[k].producto);
                    // console.log('Posible final:' + pasa + ' ' + k + '==' + (usuario.criticas.length));
                    if (productos[i].producto._id + '' == usuario.criticas[k].producto + '') {
                        // console.log('No pasa')
                        pasa = false;
                        k = 1000;
                    } else if (pasa = true && (k + 1) == usuario.criticas.length) {
                        // console.log('Producto guardado en final')
                        final[index] = productos[i];
                        index++;
                    }

                }
                pasa = true;
            }

            // console.log(final);

            /*for (let i = 0; i < productos.length; i++) {

                console.log(productos[i].media);

            }

            // console.log(productos);


            // Busqueda de los k usuarios mas afines
            /*
                for (var i = 1; i < similitudes.length; i++) {
                    for (var j = 0; j < maximos.length; j++) {

                       if ( maximos[j] < similitudes[i] ){}

                    }
                }
            

            /*
            maxU = 0;
            minU = 11;
            for (var k = 0; k < usuario.criticas.length; k++) {

                if (max[i] < usuario.criticas[k].nota)
                    maxU = usuario.criticas[k].nota;
                if (min[i] > usuario.criticas[k].nota)
                    minU = usuario.criticas[k].nota;

            }



            //  Calculo de minimos, maximos, numero de votos
            for (var i = 0; i < usuarios.length; i++) { // Recorremos todos los usuarios  
                coincidencias[i] = 0;
                max[i] = maxU;
                min[i] = minU;
                numeradores[i] = [0];
                // console.log('\nSOY EL USUARIO ' + i + '\n');
                if (usuarios[i].criticas.length > 0) {

                    for (var j = 0; j < usuarios[i].criticas.length; j++) { //Recorremos las criticas de cada usuario
                        numeradores[i][j] = 0;

                        for (var k = 0; k < usuario.criticas.length; k++) { // Calculos de maximos y minimos de cada usuario + el usuario 

                            if (max[i] < usuarios[i].criticas[j].nota)
                                max[i] = usuarios[i].criticas[j].nota;
                            if (min[i] > usuarios[i].criticas[j].nota)
                                min[i] = usuarios[i].criticas[j].nota;

                            if ((usuarios[i].criticas[j].producto + "") == (usuario.criticas[k].producto + "")) { //Calculo de coincidencias entre usuario y cada usuario
                                coincidencias[i] = coincidencias[i] + 1;
                                numeradores[i][j] = usuario.criticas[k].nota - usuarios[i].criticas[j].nota;
                                // console.log('Calculo de numeradores ' + numeradores[i][j] + ' = ' + usuario.criticas[k].nota + ' - ' + usuarios[i].criticas[j].nota);

                            }

                        }
                    }
                }
            }

            //console.log(" ");
            // console.log(coincidencias);
            // console.log(max);
            // console.log(min);
            // console.log(" ");
            // console.log(numeradores);

            similitudes = [0];
            suma = 0.0;
            i = 0;

            // Desplazamiento al cuadratico medio
            for (var j = 0; j < numeradores.length; j++) {
                similitudes[i] = 0;
                console.log('\nSOY EL USUARIO ' + j + '\n');
                if (coincidencias[i] != 0 && (max[i] - min[i]) > 0) {
                    for (var k = 0; k < numeradores[j].length; k++) {

                        if (numeradores[j][k] != 0) {
                            suma = suma + (numeradores[j][k] / (max[i] - min[i])) * (numeradores[j][k] / (max[i] - min[i]));
                            console.log('\n' + suma + " = " + ' ( ' + numeradores[j][k] + "/( " + max[i] + " - " + min[i] + " )" + ')^2 \n');
                        }

                        //console.log(suma);
                    }

                    similitudes[i] = 1 - (1 / coincidencias[i]) * suma;
                    // console.log(similitudes[i] + ' = ' + 1 + '-' + '(' + 1 + '/' + coincidencias[i] + ')' + '*' + suma);
                    // console.log(similitudes[i]);
                }
                i++;
                suma = 0.0;
            }


            console.log('\nLas similitud del usuario seleccionado son: ' + similitudes + '\n');

            // console.log("Usuarios afines: " + similitudes);

            //console.log(similitudes.sort().reverse());


            //////////////////////////////////////////////////////////
            // CALCULO DE LOS K-VECINOS
            //////////////////////////////////////////////////////////

            var kmeans = 4;
            var posiciones = [kmeans];
            var maximos = [kmeans];

            // Busqueda de los k usuarios mas afines
            for (var k = 0; k < kmeans; k++) {
                maximos[k] = 0
                for (var i = 0; i < similitudes.length; i++) {

                    if (similitudes[i] > maximos[k] && similitudes[i] != 1 && similitudes[i] > 0) {

                        if (maximos[k - 1] == undefined) {
                            maximos[k] = similitudes[i];
                            posiciones[k] = i;
                        } else if (maximos[k - 1] > similitudes[i]) {

                            maximos[k] = similitudes[i];
                            posiciones[k] = i;

                        }

                    }


                }
            }



            // console.log("--");
            // console.log("Los k usuarios mas afines son: " + maximos);
            // console.log("--");
            // console.log("Estos se encuentran en las posiciones: " + posiciones);
            // console.log("--");
            // console.log("Estos usuarios son: " + usuarios[posiciones[0]].nombre + " " + usuarios[posiciones[1]].nombre);

            //console.log(maximos);
            //console.log(posiciones);

            //console.log(usuarios);

            /*
            //////////////////////////////////////////////////////////
            // CALCULO DE TODAS LAS PREDICCIONES
            //////////////////////////////////////////////////////////

            var mediadenotas = [];
            var idcriticas = [];
            var incrementa;
            var valida = false;
            var coincide = [];



            for (var j = 0; j < usuarios[posiciones[0]].criticas.length; j++) {
                mediadenotas[j] = usuarios[posiciones[0]].criticas[j].nota;
                idcriticas[j] = usuarios[posiciones[0]].criticas[j].producto;
                coincide[j] = 1;
            }


            // Calculo de media
            for (var k = 1; k < kmeans; k++) {
                incrementa = mediadenotas.length;
                for (var j = 0; j < usuarios[posiciones[k]].criticas.length; j++) { // Recorre criticas de usuarios mas afines

                    var tamaño = idcriticas.length;
                    for (var i = 0; i < tamaño; i++) {

                        //console.log(idcriticas[i] + " == " + usuarios[posiciones[k]].criticas[j].producto);
                        if ((idcriticas[i] + "") == (usuarios[posiciones[k]].criticas[j].producto + "")) {



                            //console.log("Ronda2.0: " + mediadenotas[i] + " + " + usuarios[posiciones[k]].criticas[j].nota)
                            mediadenotas[i] = mediadenotas[i] + usuarios[posiciones[k]].criticas[j].nota;
                            //console.log("COINCIDENCIA: " + mediadenotas[i]);
                            coincide[i] = coincide[i] + 1;
                            valida = true;

                        } else if (valida == false && i == (idcriticas.length - 1) && usuarios[posiciones[k]].criticas[j].producto != null) {


                            mediadenotas[incrementa] = usuarios[posiciones[k]].criticas[j].nota;
                            idcriticas[incrementa] = usuarios[posiciones[k]].criticas[j].producto;
                            coincide[incrementa] = 1;
                            console.log('El id es: ' + idcriticas[incrementa] + ' en la posicion ' + incrementa);
                            incrementa = incrementa + 1;
                            valida = true;


                        }


                    }

                    valida = false;

                }
            }

            //////////////////////////////////////////////////////////
            // MOSTRAR LAS M MEJORES RECOMENDACIONES
            //////////////////////////////////////////////////////////

            // console.log('Los productos predichos son: ' + idcriticas);
            // console.log('En cada producto hay ' + coincide + '  coincidencias');
            // // console.log('La nota media es: ' + mediadenotas);

            for (var i = 0; i < mediadenotas.length; i++) {
                mediadenotas[i] = mediadenotas[i] / coincide[i];
            }

            var salidasfinales = 4;
            var maxf = [];
            var maxID = [];
            var guardar = 0;

            for (var i = 0; i < salidasfinales; i++) {
                maxf[i] = 0;
                maxID[i] = "";
                for (var j = 0; j < mediadenotas.length; j++) {

                    if (mediadenotas[j] > maxf[i]) {
                        maxf[i] = mediadenotas[j];
                        maxID[i] = idcriticas[j];
                        guardar = j;


                    }


                }

                mediadenotas[guardar] = 0;
                idcriticas[guardar] = 0;
            }



            // SOLUCION
            // console.log("MAXIMOS FINALES: " + maxf);
            // console.log("ID FINALES:      " + maxID)

            */
            Usuario.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    recomendaciones: final,
                    total: conteo
                });
            })

        })




    })


});


module.exports = app; //