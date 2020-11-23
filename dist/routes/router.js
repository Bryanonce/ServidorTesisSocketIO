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
const bcrypt_1 = __importDefault(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const mid_1 = require("../middlewares/mid");
const client = new google_auth_library_1.OAuth2Client(config_1.CLIENTE);
exports.router.get('/users', [mid_1.validacionToken, mid_1.validarRol], (req, res) => {
    usuarios_1.default.find({})
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
        tipo: body.tipo,
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
                mensaje: "Error en el primer excec",
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
    usuarios_1.default.findOne({ email: body.email }, (err, usuarioDb) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                msg: 'No hay match',
                err
            });
        }
        ;
        if (!usuarioDb) {
            return res.status(401).json({
                ok: false,
                msg: 'No existe',
                err
            });
        }
        ;
        if (!bcrypt_1.default.compareSync(body.pass, usuarioDb.pass)) {
            return res.status(401).json({
                ok: false,
                msg: 'No hay match',
                err
            });
        }
        ;
        let token = jsonwebtoken_1.default.sign({ usuarioDb }, config_1.SEMILLA, { expiresIn: process.env.CAD_TOKEN });
        res.json({
            ok: true,
            token: token
        });
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
    let token = req.body.idtoken;
    let googleUser = yield verify(token)
        .catch(e => {
        return res.status(403).json({
            ok: false,
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
                let token = jsonwebtoken_1.default.sign({ usuarioDb }, config_1.SEMILLA, { expiresIn: process.env.CAD_TOKEN });
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
                let token = jsonwebtoken_1.default.sign({ usuarioDb }, config_1.SEMILLA, { expiresIn: process.env.CAD_TOKEN });
                return res.json({
                    ok: true,
                    usuario: usuarioDb,
                    token
                });
            });
        }
    });
}));
