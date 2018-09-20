var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin para menssaje de error por unicidad

var Schema = mongoose.Schema;


var listaDeDeseosSchema = new Schema({

    nombre: { type: String, required: [true, 'Es obligatorio introducir el nombre'] },
    __v: { type: Number, select: false },
    producto: [{ type: Schema.Types.ObjectId, ref: 'Producto' }]

});

listaDeDeseosSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }) // Menssaje de error uniqueValidator(linea 2)

module.exports = mongoose.model('ListaDeDeseos', listaDeDeseosSchema);