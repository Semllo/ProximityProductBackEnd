var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin para menssaje de error por unicidad

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};

var usuarioSchema = new Schema({

    nombre: { type: String, required: [true, 'Es obligatorio introducir el nombre'] },
    edad: { type: Number, required: [true, 'Es obligatorio introducir la edad'] },
    genero: { type: Boolean, required: [true, 'Es obligatorio introducir el genero'] },
    ciudad: { type: String, required: [true, 'Es obligatorio introducir la ciudad'] },
    pais: { type: String, required: [true, 'Es obligatorio introducir el pais'] },
    email: { type: String, unique: true, required: [true, 'Es obligatorio introducir el email'] },
    password: { type: String, required: [true, 'Es obligatorio introducir la contraseña'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    catRecomendar: [{ type: Schema.Types.ObjectId, ref: 'SubCategoria' }]

});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }) // Menssaje de error uniqueValidator(linea 2)

module.exports = mongoose.model('Usuario', usuarioSchema);