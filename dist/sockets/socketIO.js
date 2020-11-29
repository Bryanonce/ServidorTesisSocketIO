"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conectarCliente = void 0;
const coordSchema_1 = __importDefault(require("../schemas/coordSchema"));
const ultimaCoorSchema_1 = __importDefault(require("../schemas/ultimaCoorSchema"));
const usuarios_1 = __importDefault(require("../schemas/usuarios"));
const configSchema_1 = __importDefault(require("../schemas/configSchema"));
exports.conectarCliente = (cliente, io) => {
    cliente.on('enviarCoordServ', (payload, callback) => {
        configSchema_1.default.findOne({})
            .exec((err, configDb) => {
            if (err) {
                return;
            }
            if ((payload.lat > configDb.latini) && (payload.lat < configDb.latfin) && (payload.long > configDb.longini) && (payload.long < configDb.longfin)) {
                console.log('Usuario ha enviado coordenadas');
                let fecha = new Date();
                let hora = Number(fecha.getHours()) - 5;
                if (hora < 0) {
                    hora += 24;
                }
                //let coordenada:any;
                let datos = new coordSchema_1.default({
                    mat: payload.mat,
                    lat: payload.lat,
                    long: payload.long,
                    anio: fecha.getFullYear(),
                    mes: fecha.getMonth(),
                    dia: fecha.getDate(),
                    hora: hora,
                    minuto: fecha.getMinutes(),
                    segundo: fecha.getSeconds()
                });
                datos.save((err, datoBd) => {
                    if (err) {
                        return;
                    }
                    //io.emit('recargar',{lat: payload.lat,long: payload.long,})
                    //callback(datoBd)            
                });
                usuarios_1.default.findById(payload.mat)
                    .exec((err, usuarioDb) => {
                    if (err) {
                        return;
                    }
                    if (!usuarioDb) {
                        return;
                    }
                    ultimaCoorSchema_1.default.findByIdAndUpdate(payload.mat, { img: usuarioDb.img, lat: payload.lat, long: payload.long })
                        .exec((err, coorDb) => {
                        if (err) {
                            return;
                        }
                        if (!coorDb) {
                            let ultiCoor = new ultimaCoorSchema_1.default({
                                _id: payload.mat,
                                nombre: usuarioDb.nombre,
                                img: usuarioDb.img,
                                lat: payload.lat,
                                long: payload.long,
                                color: '#' + Math.floor(Math.random() * 16777215).toString(16)
                            });
                            ultiCoor.save((err, datoBd) => {
                                if (err) {
                                    return;
                                }
                                //io.emit('actualCoor',datoBd)
                                //coordenada = datoBd
                            });
                        }
                    });
                });
                io.emit('recargar', { lat: payload.lat, long: payload.long, _id: payload.mat });
            }
        });
    });
};
