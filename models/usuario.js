var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin para menssaje de error por unicidad

var Schema = mongoose.Schema;


var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};


var listaDeDeseosSchema = new Schema({

    nombre: { type: String, required: [true, 'Es obligatorio introducir el nombre'] },
    __v: { type: Number, select: false },
    producto: [{ type: Schema.Types.ObjectId, ref: 'Producto' }]

});


var criticasSchema = new Schema({

    nombre: { type: String, required: false },
    descripcion: { type: String, required: false },
    nota: { type: Number, required: [true, 'Es obligatorio votar el producto'] },
    __v: { type: Number, select: false },
    producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: [true, 'Es obligatorio introducir un producto'] }

});

var usuarioSchema = new Schema({

    nombre: { type: String, required: [true, 'Es obligatorio introducir el nombre'] },
    edad: { type: String },
    genero: { type: Boolean },
    ciudad: { type: String },
    pais: { type: String },
    email: { type: String, unique: true, required: [true, 'Es obligatorio introducir el email'] },
    password: { type: String, required: [true, 'Es obligatorio introducir la contraseña'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    catRecomendar: [{ type: Schema.Types.ObjectId, ref: 'SubCategoria' }],
    listasDeDeseos: [listaDeDeseosSchema],
    criticas: [criticasSchema],
    __v: { type: Number, select: false },
    google: { type: Boolean, default: false }

});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }) // Menssaje de error uniqueValidator(linea 2)

module.exports = mongoose.model('Usuario', usuarioSchema);