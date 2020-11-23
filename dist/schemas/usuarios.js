"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
//Interfaces
const tiposValidos = {
    values: ['ACCESO_RECURSOS', 'ESTUDIANTES'],
    message: '{VALUE} no es un rol válido'
};
//Cuerpo
const usuarioSchema = new mongoose_1.Schema({
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
usuarioSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.pass;
    return userObject;
};
usuarioSchema.plugin(mongoose_unique_validator_1.default, {
    message: '{PATH} ya se encuentra registrado'
});
//Exports
exports.default = mongoose_1.default.model('Users', usuarioSchema);
