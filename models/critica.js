var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin para menssaje de error por unicidad

var Schema = mongoose.Schema;


var criticasSchema = new Schema({

    nombre: { type: String, required: false },
    descripcion: { type: String, unique: true, required: false },
    nota: { type: String, required: [true, 'Es obligatorio votar el producto'] },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'Es obligatorio introducir un usuario'] },
    producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: [true, 'Es obligatorio introducir un producto'] }

});

criticasSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }) // Menssaje de error uniqueValidator(linea 2)

module.exports = mongoose.model('Criticas', criticasSchema);