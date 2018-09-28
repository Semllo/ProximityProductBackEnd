// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

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
var indicadoresRoutes = require('./routes/indicadores');
var imagenesRoutes = require('./routes/imagenes');
var uploadsRoutes = require('./routes/uploads');
var kmeansRoutes = require('./routes/k-means');

// Conexión BBDD
mongoose.connection.openUri('mongodb://marsemll:pa$$w0rdPrimento1992@ds215633.mlab.com:15633/proximityproduct', { useNewUrlParser: true }, (err, res) => { // mongodb://localhost:27017/ProximityProduct 

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
app.use('/indicadores', indicadoresRoutes);
app.use('/img', imagenesRoutes);
app.use('/upload', uploadsRoutes);
app.use('/kmeans', kmeansRoutes);

app.use('/', appRoutes);

// Escuchar peticiones 
app.listen(process.env.PORT || 3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})