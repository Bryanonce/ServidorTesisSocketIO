import mongoose,{Schema} from 'mongoose';
import uniqueVal from 'mongoose-unique-validator';

//Interfaces
let tiposValidos = {
    values: ['ACCESO_RECURSOS', 'ESTUDIANTES'],
    message: '{VALUE} no es un rol válido'
}

//Cuerpo
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Se necesita el nombre']
    },
    email: {
        type: String,
        required: [true, 'Se necesita el email'],
        unique: true
    },
    pass: {
        type: String,
        required: [true, 'Se necesita el pass']
    },
    tipo: {
        type: String,
        default: 'ESTUDIANTES',
        enum: tiposValidos
    },
    activo: {
        type: Boolean,
        default: false
    },
    google: {
        type: Boolean,
        default: false
    },
    img: {
        type: String,
        default: ''
    }
});

usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.pass;
    return userObject;
}

usuarioSchema.plugin(uniqueVal, {
    message: '{PATH} ya se encuentra registrado'
})

//Exports
export default mongoose.model('Users', usuarioSchema);