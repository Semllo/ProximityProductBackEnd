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

        Usuario.find({}).exec((err, usuarios) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios en bbdd',
                    errors: err
                });
            }



            var coincidencias = [0];
            var min = [0];
            var max = [0];
            var numeradores = [0];


            for (var i = 0; i < usuarios.length; i++) { //Usuarios  
                coincidencias[i] = 0;
                max[i] = 0;
                min[i] = 11;
                numeradores[i] = [0];

                for (var j = 0; j < usuarios[i].criticas.length; j++) { //Criticas usuarios
                    numeradores[i][j] = 0;
                    for (var k = 0; k < usuario.criticas.length; k++) { //Mis criticas 

                        if (max[i] < usuarios[i].criticas[j].nota)
                            max[i] = usuarios[i].criticas[j].nota;
                        if (max[i] < usuario.criticas[k].nota)
                            max[i] = usuario.criticas[k].nota;
                        if (min[i] > usuarios[i].criticas[j].nota)
                            min[i] = usuarios[i].criticas[j].nota;
                        if (min[i] > usuario.criticas[k].nota)
                            min[i] = usuario.criticas[k].nota;

                        if ((usuarios[i].criticas[j].producto + "") == (usuario.criticas[k].producto + "")) { //Calculo de coincidencias
                            coincidencias[i] = coincidencias[i] + 1;
                            numeradores[i][j] = usuario.criticas[k].nota - usuarios[i].criticas[j].nota;

                        }

                    }
                }

            }

            //console.log(" ");
            //console.log(coincidencias);
            //console.log(max);
            //console.log(min);
            //console.log(" ");
            //console.log(numeradores);



            similitudes = [0];
            suma = 0.0;
            i = 0;

            for (var j = 0; j < numeradores.length; j++) {
                similitudes[i] = 0;
                //console.log(numeradores[j].length + "tamaño!!!!!!!!!!!!!!!!!!!!!!!!");
                for (var k = 0; k < numeradores[j].length; k++) {

                    suma = suma + (numeradores[j][k] / (max[i] - min[i])) * (numeradores[j][k] / (max[i] - min[i]));

                    //console.log(suma + "=" + numeradores[j][k] + "/( " + max[i] + " - " + min[i] + " )");
                    //console.log(suma);
                }

                similitudes[i] = 1 - (1 / coincidencias[i]) * suma;
                i++;
                suma = 0.0;
            }


            //console.log(similitudes);

            console.log("Usuarios afines: " + similitudes);

            //console.log(similitudes.sort().reverse());

            var kmeans = 2;
            var posiciones = [kmeans];
            var maximos = [kmeans];

            for (var k = 0; k < kmeans; k++) {
                maximos[k] = 0
                for (var i = 0; i < similitudes.length; i++) {

                    if (similitudes[i] > maximos[k] && similitudes[i] != 1) {

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
            console.log("--");
            console.log("Los k usuarios mas afines son: " + maximos);
            console.log("--");
            console.log("Estos se encuentran en las posiciones: " + posiciones);
            console.log("--");
            console.log("Estos usuarios son: " + usuarios[posiciones[0]].nombre + " " + usuarios[posiciones[1]].nombre);

            //console.log(maximos);
            //console.log(posiciones);

            //console.log(usuarios);



            /* for (var i = 0; i < usuarios[posiciones[0]].criticas.length; i++) {

                 // console.log("Las notas del primer usuario son: " + usuarios[posiciones[0]].criticas[i].nota);
                 //console.log("Las notas del segundo usuario son: " + usuarios[posiciones[1]].criticas[i].nota);


             }*/




            var mediadenotas = [];
            var idcriticas = [];
            var incrementa;
            var valida = false;

            for (var k = 0; k < kmeans; k++) {

                for (var j = 0; j < usuarios[posiciones[k]].criticas.length; j++) {
                    mediadenotas[j] = 0;
                    idcriticas[j] = "";
                }
            }

            for (var k = 0; k < kmeans; k++) {
                incrementa = mediadenotas.length;
                for (var j = 0; j < usuarios[posiciones[k]].criticas.length; j++) { //Criticas usuarios

                    console.log("LA J: " + j)
                    if (idcriticas[j] == "") {

                        mediadenotas[j] = mediadenotas[j] + usuarios[posiciones[k]].criticas[j].nota;
                        //console.log(usuarios[posiciones[k]].criticas[j].producto);
                        idcriticas[j] = usuarios[posiciones[k]].criticas[j].producto;

                        //console.log("Ronda1: " + usuarios[posiciones[k]].criticas[j].nota);

                    } else {

                        var tamaño = idcriticas.length;
                        for (var i = 0; i < tamaño; i++) {

                            //console.log(idcriticas[i] + " == " + usuarios[posiciones[k]].criticas[j].producto);
                            if ((idcriticas[i] + "") == (usuarios[posiciones[k]].criticas[j].producto + "")) {



                                //console.log("Ronda2.0: " + mediadenotas[i] + " + " + usuarios[posiciones[k]].criticas[j].nota)
                                mediadenotas[i] = mediadenotas[i] + usuarios[posiciones[k]].criticas[j].nota;
                                //console.log("COINCIDENCIA: " + mediadenotas[i]);
                                valida = true;

                            } else if (valida == false && i == (idcriticas.length - 1)) {


                                mediadenotas[incrementa] = usuarios[posiciones[k]].criticas[j].nota;
                                idcriticas[incrementa] = usuarios[posiciones[k]].criticas[j].producto;
                                //console.log(mediadenotas[incrementa]);
                                incrementa = incrementa + 1;
                                valida = true;


                            }

                        }

                        valida = false;
                    }
                }
            }

            console.log(mediadenotas);

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
            console.log("MAXIMOS FINALES: " + maxf);
            console.log("ID FINALES:      " + maxID)

            Usuario.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    recomendaciones: maxID,
                    total: conteo
                });
            })

        })




    })


});


module.exports = app;