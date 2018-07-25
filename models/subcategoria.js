var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin para menssaje de error por unicidad

var Schema = mongoose.Schema;

var subcategoriaSchema = new Schema({

    nombre: { type: String, unique: true, required: [true, 'Es obligatorio introducir el nombre'] },
    categoria: [{ type: Schema.Types.ObjectId, ref: 'Categoria', required: [true, 'Es obligatorio introducir una categoria'] }]

});

subcategoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }) // Menssaje de error uniqueValidator(linea 2)

module.exports = mongoose.model('SubCategoria', subcategoriaSchema);