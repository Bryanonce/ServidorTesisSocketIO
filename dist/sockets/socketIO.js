"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conectarCliente = exports.enviarCoord = void 0;
const coordSchema_1 = __importDefault(require("../schemas/coordSchema"));
const ultimaCoorSchema_1 = __importDefault(require("../schemas/ultimaCoorSchema"));
const usuarios_1 = __importDefault(require("../schemas/usuarios"));
const configSchema_1 = __importDefault(require("../schemas/configSchema"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../global/config");
exports.enviarCoord = (cliente, io) => {
    cliente.on('enviarCoordServ', (payload, callback) => {
        //console.log('Nueva Medicion')
        configSchema_1.default.findOne({})
            .exec((err, configDb) => {
            if (err) {
                console.log(err);
            }
            //console.log(configDb);
            if ((payload.lat > configDb.latini) && (payload.lat < configDb.latfin) && (payload.long > configDb.longini) && (payload.long < configDb.longfin)) {
                //console.log('Usuario ha enviado coordenadas')
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
                        console.log(err);
                    }
                });
                usuarios_1.default.findById(payload.mat)
                    .exec((err, usuarioDb) => {
                    if (err) {
                        return;
                    }
                    if (!usuarioDb) {
                        return;
                    }
                    ultimaCoorSchema_1.default.findById(payload.mat)
                        .exec((err, usuarioData) => {
                        if (err) {
                            return;
                        }
                        //console.log(usuarioData);
                        if (!usuarioData) {
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
                                    console.log(err);
                                }
                                else {
                                    console.log(datoBd);
                                }
                            });
                        }
                        else {
                            ultimaCoorSchema_1.default.findByIdAndUpdate(payload.mat, { img: usuarioDb.img, lat: payload.lat, long: payload.long })
                                .exec((err) => {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log('Actualizado');
                                }
                            });
                        }
                    });
                });
                io.emit('recargar', { lat: payload.lat, long: payload.long, _id: payload.mat });
            }
        });
        configSchema_1.default.findOne({})
            .exec((err, configData) => {
            if (err) {
                return;
            }
            if (!configData) {
                return;
            }
            else {
                let distMin = configData.peligromedio;
                let count = 0;
                usuarios_1.default.find({ activo: true })
                    .exec((err, data) => {
                    if (err) {
                        return;
                    }
                    if (!data) {
                        return;
                    }
                    else {
                        //console.log(data);
                        data.forEach((element) => {
                            //console.log(element._id);
                            ultimaCoorSchema_1.default.findById(element._id)
                                .exec((err, userDb) => {
                                if (err) {
                                    return;
                                }
                                if (!userDb) {
                                    return;
                                }
                                else {
                                    let distancia = haversineDistance([payload.long, payload.lat], [userDb.long, userDb.lat]) * 1000;
                                    if (distancia <= distMin) {
                                        count++;
                                    }
                                }
                            });
                        });
                    }
                });
                if (count >= configData.peligroalto) {
                    io.emit('avisoPeligro', { id: payload.mat, peligro: true });
                }
            }
        });
    });
};
function haversineDistance(coords1, coords2, isMiles) {
    function toRad(x) {
        return x * Math.PI / 180;
    }
    var lon1 = coords1[0];
    var lat1 = coords1[1];
    var lon2 = coords2[0];
    var lat2 = coords2[1];
    var R = 6371; // km
    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    if (isMiles)
        d /= 1.60934;
    return d;
}
exports.conectarCliente = (cliente) => {
    cliente.on('conectado', (payload) => {
        //console.log(payload.token)
        try {
            jsonwebtoken_1.default.verify(payload.token, config_1.SEMILLA, (err, decode) => {
                if (err) {
                    console.log(err);
                    console.log('Token no coincide');
                }
                else {
                    let id = decode.usuarioDb._id;
                    console.log(decode.usuarioDb._id);
                    usuarios_1.default.findByIdAndUpdate(id, { activo: true })
                        .exec((err, usuarioDb) => {
                        if (err) {
                            console.log(err);
                            return err;
                        }
                        if (!usuarioDb) {
                            console.log('No se encontro el usuario');
                        }
                        else {
                            console.log('Cliente Conectado: ' + id);
                            cliente.id = id;
                        }
                    });
                }
            });
        }
        catch (err) {
            console.log(err);
        }
    });
    cliente.on('disconnect', () => {
        usuarios_1.default.findByIdAndUpdate(cliente.id, { activo: false })
            .exec((err, usuarioDb) => {
            if (err) {
                console.log(err);
                return err;
            }
            if (!usuarioDb) {
                console.log('No se encontro el usuario');
            }
            else {
                console.log('Cliente Desconectado: ' + cliente.id);
            }
        });
    });
};
