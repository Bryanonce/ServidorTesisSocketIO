"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const coordSchema_1 = __importDefault(require("../schemas/coordSchema"));
exports.router = express_1.Router();
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
exports.router.post('/', (req, res) => {
});
