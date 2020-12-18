"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const config_1 = require("../global/config");
const express_1 = require("express");
const coordSchema_1 = __importDefault(require("../schemas/coordSchema"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.router = express_1.Router();
const usuarios_1 = __importDefault(require("../schemas/usuarios"));
const configSchema_1 = __importDefault(require("../schemas/configSchema"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const mid_1 = require("../middlewares/mid");
const ultimaCoorSchema_1 = __importDefault(require("../schemas/ultimaCoorSchema"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client = new google_auth_library_1.OAuth2Client(config_1.CLIENTE);
exports.router.get('/users', [mid_1.validacionToken, mid_1.validarRol], (req, res) => {
    let buscar = {};
    if (req.query.id) {
        const id = req.query.id;
        buscar = { _id: id };
    }
    usuarios_1.default.find(buscar)
        .exec((err, usuarios) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: err
            });
        }
        res.json({
            ok: true,
            usuarios
        });
    });
});
exports.router.post('/user', (req, res) => {
    let body = req.body;
    let usuario = new usuarios_1.default({
        email: body.email,
        pass: bcrypt_1.default.hashSync(body.pass, 10),
        nombre: body.nombre
    });
    usuario.save((err, usuarioDb) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDb
        });
    });
});
exports.router.put('/users/:id', [mid_1.validacionToken, mid_1.validarRol], (req, res) => {
    let id = req.params.id;
    let body = req.body;
    console.log(body);
    if (!body.pass) {
        usuarios_1.default.findByIdAndUpdate(id, {
            email: body.email,
            nombre: body.nombre,
        })
            .exec((err) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: "Error al actualizar"
                });
            }
            return res.json({
                ok: true,
                message: "Actualizado con éxito"
            });
        });
    }
    else {
        usuarios_1.default.findByIdAndUpdate(id, {
            email: body.email,
            pass: bcrypt_1.default.hashSync(body.pass, 10),
            nombre: body.nombre,
        })
            .exec((err) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: "Error al actualizar"
                });
            }
            return res.json({
                ok: true,
                message: "Actualizado con éxito"
            });
        });
    }
});
exports.router.get('/real', (req, res) => {
    coordSchema_1.default.aggregate([
        { $group: {
                _id: "$mat",
                lat: { $last: "$lat" },
                long: { $last: "$long" }
            } }
    ])
        .exec((err, dataDb) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al encontrar los datos'
            });
        }
        if (!dataDb) {
            return res.status(400).json({
                ok: false,
                message: 'Base de datos vacìa'
            });
        }
        return res.json({
            ok: true,
            datos: dataDb
        });
    });
});
exports.router.get('/datos', (req, res) => {
    let anioIni = req.query.anioIni || 2019;
    let anioFin = req.query.anioFin || 2040;
    let mesIni = req.query.mesIni || 1;
    let mesFin = req.query.mesFin || 12;
    let diaIni = req.query.diaIni || 1;
    let diaFin = req.query.diaFin || 31;
    let horaIni = req.query.horaIni || 0;
    let horaFin = req.query.horaFin || 23;
    let minutoIni = req.query.minutoIni || 0;
    let minutoFin = req.query.minutoFin || 59;
    coordSchema_1.default.find({
        $and: [
            { 'anio': { $gte: `${anioIni}` } },
            { 'anio': { $lte: `${anioFin}` } },
            { 'mes': { $gte: `${mesIni}` } },
            { 'mes': { $lte: `${mesFin}` } },
            { 'dia': { $gte: `${diaIni}` } },
            { 'dia': { $lte: `${diaFin}` } },
            { 'hora': { $gte: `${horaIni}` } },
            { 'hora': { $lte: `${horaFin}` } },
            { 'minuto': { $gte: `${minutoIni}` } },
            { 'minuto': { $lte: `${minutoFin}` } }
        ]
    }, 'lat long')
        .exec((err, req) => {
        if (err) {
            res.status(400).json({
                ok: false,
                message: "Error en el primer excec",
                err
            });
        }
        res.json({
            ok: true,
            usuarios: req
        });
    });
});
exports.router.post('/login', (req, res) => {
    let body = req.body;
    usuarios_1.default.findOne({ email: body.email })
        .exec((err, usuarioDb) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                msg: 'Error',
                err
            });
        }
        if (!usuarioDb) {
            return res.status(401).json({
                ok: false,
                msg: 'No existe',
                err
            });
        }
        ;
        if (usuarioDb.tipo === 'ACCESO_RECURSOS') {
            if (!bcrypt_1.default.compareSync(body.pass, usuarioDb.pass)) {
                return res.status(401).json({
                    ok: false,
                    msg: 'No hay match',
                    err
                });
            }
            ;
            let token = jsonwebtoken_1.default.sign({ usuarioDb }, config_1.SEMILLA, { expiresIn: config_1.CADUCIDAD });
            res.json({
                ok: true,
                token: token
            });
        }
        else {
            return res.status(401).json({
                ok: false,
                msg: "Área solo para administradores"
            });
        }
    });
});
// Configuraciones de Google
function verify(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const ticket = yield client.verifyIdToken({
            idToken: token,
            audience: config_1.CLIENTE,
        });
        const payload = ticket.getPayload();
        return {
            nombre: payload.name,
            email: payload.email,
            img: payload.picture,
            google: true
        };
    });
}
exports.router.post('/google', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.idtoken) {
        return res.json({
            ok: false,
            message: 'No se encontró el token'
        });
    }
    let token = req.body.idtoken;
    let googleUser = yield verify(token)
        .catch(e => {
        return res.status(403).json({
            ok: false,
            message: 'Error Status 403',
            err: e
        });
    });
    usuarios_1.default.findOne({ email: googleUser.email })
        .exec((err, usuarioDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        ;
        if (usuarioDb) {
            if (usuarioDb.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: {
                        desc: 'Debe utilizar su auth normal',
                        error: err
                    }
                });
            }
            else {
                let token = jsonwebtoken_1.default.sign({ usuarioDb }, config_1.SEMILLA, { expiresIn: config_1.CADUCIDAD });
                return res.json({
                    ok: true,
                    usuario: usuarioDb,
                    token
                });
            }
            ;
        }
        else {
            //SI EL USER NO EXISTE
            let usuario = new usuarios_1.default({
                nombre: googleUser.nombre,
                email: googleUser.email,
                google: true,
                img: googleUser.img,
                pass: ':)'
            });
            usuario.save((err, usuarioDb) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        usuario: [],
                        token: ''
                    });
                }
                let token = jsonwebtoken_1.default.sign({ usuarioDb }, config_1.SEMILLA, { expiresIn: config_1.CADUCIDAD });
                return res.json({
                    ok: true,
                    usuario: usuarioDb,
                    token
                });
            });
        }
    });
}));
exports.router.get('/ultidatos', [mid_1.validacionToken, mid_1.validarRol], (req, res) => {
    let id = req.query.id;
    ultimaCoorSchema_1.default.findById(id)
        .exec((err, usuarioDb) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                datos: []
            });
        }
        return res.json({
            ok: true,
            datos: usuarioDb
        });
    });
});
exports.router.get('/config', (req, res) => {
    configSchema_1.default.findOne({})
        .exec((err, configDb) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Error en la Petición"
            });
        }
        if (!configDb) {
            return res.json({
                ok: true,
                message: "Éxito en la conexión",
                existe: false
            });
        }
        return res.json({
            ok: true,
            message: "Éxito en la conexión",
            existe: true,
            id: configDb._id,
            config: configDb
        });
    });
});
exports.router.post('/config', [mid_1.validacionToken, mid_1.validarRol], (req, res) => {
    let body = req.body;
    let config = new configSchema_1.default({
        latcentro: body.latcentro,
        longcentro: body.longcentro,
        latini: body.latini,
        latfin: body.latfin,
        longini: body.longini,
        longfin: body.longfin,
        escala: body.escala,
        peligromedio: body.peligromedio,
        peligroalto: body.peligroalto
    });
    config.save((err, configDb) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Error al guardar en la Db"
            });
        }
        return res.json({
            ok: true,
            message: "Guardado con éxito",
            id: configDb._id
        });
    });
});
exports.router.put('/config', [mid_1.validacionToken, mid_1.validarRol], (req, res) => {
    let body = req.body.config;
    let id = req.body.id;
    configSchema_1.default.findByIdAndUpdate(id, {
        latcentro: body.latcentro,
        longcentro: body.longcentro,
        latini: body.latini,
        latfin: body.latfin,
        longini: body.longini,
        longfin: body.longfin,
        escala: body.escala,
        peligromedio: body.peligromedio,
        peligroalto: body.peligroalto
    })
        .exec((err) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Error al actualizar"
            });
        }
        return res.json({
            ok: true,
            message: "Actualización Completada"
        });
    });
});
exports.router.delete('/users/:id', [mid_1.validacionToken, mid_1.validarRol], (req, res) => {
    console.log('Eliminando Usuario...');
    let id = req.params.id;
    usuarios_1.default.findByIdAndDelete(id)
        .exec((err) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al eliminar usuario'
            });
        }
        return res.json({
            ok: true,
            message: "Usuario eliminado"
        });
    });
});
//Subida de Archivos
exports.router.put('/upload/:id', [mid_1.validacionToken, mid_1.validarRol], (req, res) => {
    let id = req.params.id;
    usuarios_1.default.findById(id)
        .exec((err, usuarioDb) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error en la conexión',
                err
            });
        }
        ;
        if (!usuarioDb) {
            return res.status(400).json({
                ok: false,
                message: 'No se encontró el usuario',
                err
            });
        }
        ;
        //Path de la img
        borrArchivo(usuarioDb.img);
        //Guardar en Server
        if (!req.files) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            });
        }
        //console.log('........')
        let archivo = req.files.archivo;
        //console.log(req.files['']);
        let nombreCortado = archivo.name.split('.');
        let extension = nombreCortado[nombreCortado.length - 1];
        //console.log(extension);
        //Extensiones permitidas
        let extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
        if (extencionesValidas.indexOf(extension) < 0) {
            return res.status(400).json({
                ok: false,
                err: {
                    extencion: extension,
                    message: `Las extensiones permitidas son: ${extencionesValidas}`,
                }
            });
        }
        //Cambiar nombre al archivo
        let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
        //console.log(nombreArchivo);
        archivo.mv(`dist/uploads/img/${nombreArchivo}`, (err) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
        });
        usuarioDb.img = nombreArchivo;
        usuarioDb.save((err) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: err
                });
            }
        });
        return res.json({
            ok: true,
            message: 'Subida con éxito'
        });
    });
});
let borrArchivo = (nombreImagen) => {
    try {
        let pathImg = path_1.default.resolve(__dirname, `../uploads/img/${nombreImagen}`);
        if (fs_1.default.existsSync(pathImg)) {
            fs_1.default.unlinkSync(pathImg);
        }
    }
    catch (_a) {
    }
};
exports.router.get('/imagen/:img', (req, res) => {
    try {
        let img = req.params.img;
        let pathImg = path_1.default.resolve(__dirname, `../uploads/img/${img}`);
        return res.sendFile(pathImg);
    }
    catch (err) {
        return res.status(500).json({
            ok: false,
            message: "No se pudo optener la imagen",
            err
        });
    }
});
