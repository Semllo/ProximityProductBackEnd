var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin para menssaje de error por unicidad

var Schema = mongoose.Schema;


var productoSchema = new Schema({

    nombre: { type: String },
    descripcion: { type: String },
    precio: { type: Number },
    notamedia: { type: Number, required: false },
    popularidad: { type: Number, required: false },
    fecha: { type: Date, default: Date.now },
    img: { type: String, required: false },
    __v: { type: Number, select: false },
    subcategoria: { type: Schema.Types.ObjectId, ref: 'SubCategoria', required: [true, 'Es obligatorio introducir la categoria'] }

});

productoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }) // Menssaje de error uniqueValidator(linea 2)

module.exports = mongoose.model('Producto', productoSchema);