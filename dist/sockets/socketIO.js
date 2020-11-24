"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conectarCliente = void 0;
const coordSchema_1 = __importDefault(require("../schemas/coordSchema"));
const ultimaCoorSchema_1 = __importDefault(require("../schemas/ultimaCoorSchema"));
const usuarios_1 = __importDefault(require("../schemas/usuarios"));
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
            minuto: fecha.getMinutes(),
            segundo: fecha.getSeconds()
        });
        datos.save((err, datoBd) => {
            if (err) {
                callback(err);
            }
            io.emit('recargar', { lat: payload.lat, long: payload.long, });
            callback(datoBd);
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
                        io.emit('sonsoPer', datoBd);
                    });
                    return;
                }
                coorDb.update({
                    img: usuarioDb.img,
                    lat: payload.lat,
                    long: payload.long
                });
                io.emit('sonsoPer', coorDb);
            });
        });
    });
};
/*export const noticiasAdmin = (admin:Socket, io:io.Server)=>{
    admin.on('envioNoti',(payload:{fecha:string,copete:string,titulo:string,foto:string,cuerpo:string,epigrafe:string})=>{

    })
}

export const sensarPersonal = (cliente:Socket,io:io.Server)=>{
    cliente.on('sensoPer',(payload:{})=>{
        
    })
}*/ 
