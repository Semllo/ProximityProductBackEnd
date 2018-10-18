var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin para menssaje de error por unicidad

var Schema = mongoose.Schema;


var criticasSchema = new Schema({

    nombre: { type: String, required: false },
    descripcion: { type: String, required: false },
    nota: { type: Number, required: [true, 'Es obligatorio votar el producto'] },
    __v: { type: Number, select: false },
    producto: { type: Schema.Types.ObjectId, ref: 'Producto' }

});

criticasSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }) // Menssaje de error uniqueValidator(linea 2)

module.exports = mongoose.model('Criticas', criticasSchema);