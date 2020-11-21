"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conectarCliente = void 0;
const coordSchema_1 = __importDefault(require("../schemas/coordSchema"));
exports.conectarCliente = (cliente, io) => {
    cliente.on('enviarCoordServ', (payload, callback) => {
        console.log('Usuario ha enviado coordenadas');
        let fecha = new Date();
        let datos = new coordSchema_1.default({
            mat: payload.mat,
            lat: payload.lat,
            long: payload.long,
            anio: fecha.getFullYear(),
            mes: fecha.getMonth(),
            dia: fecha.getDate(),
            hora: fecha.getHours() - 5,
            minuto: fecha.getMinutes()
        });
        datos.save((err, datoBd) => {
            if (err) {
                callback(err);
            }
            io.emit('recargar', { lat: payload.lat, long: payload.long, });
            callback(datoBd);
        });
    });
};
