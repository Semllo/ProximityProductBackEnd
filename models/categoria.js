var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin para menssaje de error por unicidad

var Schema = mongoose.Schema;

var categoriaSchema = new Schema({

    __v: { type: Number, select: false },
    nombre: { type: String, unique: true, required: [true, 'Es obligatorio introducir el nombre'] }

});

categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }) // Menssaje de error uniqueValidator(linea 2)

module.exports = mongoose.model('Categoria', categoriaSchema);