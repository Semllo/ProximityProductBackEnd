// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// Importar rutas
var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var usuarioRoutes = require('./routes/usuarios');
var categoriaRoutes = require('./routes/categorias');
var subcategoriaRoutes = require('./routes/subcategorias');
var productosRoutes = require('./routes/productos');
var listaDeDeseosRoutes = require('./routes/listadedeseos');
var criticasRoutes = require('./routes/criticas');
var busquedaRoutes = require('./routes/busquedas');
//var imagenesRoutes = require('./routes/imagenes');

// Conexión BBDD
mongoose.connection.openUri('mongodb://localhost:27017/ProximityProduct', { useNewUrlParser: true }, (err, res) => {

        if (err) throw err;

        console.log('Base datos Mongo puerto 27017: \x1b[32m%s\x1b[0m', 'online');

    })
    //
    // Rutas

//app.use('/img', imagenesRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/listadedeseos', listaDeDeseosRoutes);
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/categoria', categoriaRoutes);
app.use('/subcategoria', subcategoriaRoutes);
app.use('/producto', productosRoutes);
app.use('/critica', criticasRoutes);

app.use('/', appRoutes);

// Escuchar peticiones 
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})