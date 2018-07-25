var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin para menssaje de error por unicidad

var Schema = mongoose.Schema;


var productoSchema = new Schema({

    nombre: { type: String, unique: true, required: [true, 'Es obligatorio introducir el nombre'] },
    precio: { type: Number, required: [true, 'Es obligatorio introducir el precio'] },
    fecha: { type: Date, default: Date.now },
    img: { type: String, required: false },
    subcategoria: [{ type: Schema.Types.ObjectId, ref: 'SubCategoria' }]

});

productoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }) // Menssaje de error uniqueValidator(linea 2)

module.exports = mongoose.model('Producto', productoSchema);