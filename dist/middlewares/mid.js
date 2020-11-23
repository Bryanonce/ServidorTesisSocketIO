"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificaTokenImg = exports.validarRol = exports.validacionToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../global/config");
//===================
//  Validar Token
//===================
exports.validacionToken = (req, res, next) => {
    let token = req.get('token-request');
    if (!token) {
        return res.status(403).json({
            ok: false,
            message: 'token no encontrado'
        });
    }
    jsonwebtoken_1.default.verify(token, config_1.SEMILLA, (err, decode) => {
        if (err) {
            return res.status(403).json({
                ok: false,
                description: 'token muerto',
                message: err
            });
        }
        ;
        req.usuario = decode.usuarioDb;
        next();
    });
};
//===================
//  Validar Rol
//===================
exports.validarRol = (req, res, next) => {
    let role = req.usuario.tipo;
    if (!(role === 'ACCESO_RECURSOS')) {
        return res.status(401).json({
            ok: false,
            description: 'Área restringida'
        });
    }
    next();
};
//===================
// Verifica TokenImg
//===================
exports.verificaTokenImg = (req, res, next) => {
    let token = req.query.token;
    jsonwebtoken_1.default.verify(token, config_1.SEMILLA, (err, decode) => {
        if (err) {
            return res.status(403).json({
                ok: false,
                description: 'token muerto',
                message: err
            });
        }
        ;
        req.usuario = decode.usuarioDb;
        next();
    });
};
