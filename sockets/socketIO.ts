import baseDatos from '../schemas/coordSchema';
import io, {Socket} from 'socket.io';
import UltiCoor from '../schemas/ultimaCoorSchema';
import Usuarios from '../schemas/usuarios';
import UsuarioInterface from '../classes/usuario'
import ConfigMapa from '../schemas/configSchema';

export const conectarCliente = (cliente:Socket, io:io.Server)=>{
    cliente.on('enviarCoordServ',(payload:{mat:string,lat:number,long:number},callback:Function)=>{
        ConfigMapa.findOne({})
        .exec((err,configDb:any)=>{
            if(err){
                return
            }
            if((payload.lat>configDb.latini) && (payload.lat<configDb.latfin) && (payload.long>configDb.longini) && (payload.long<configDb.longfin)){
                console.log('Usuario ha enviado coordenadas')
                let fecha = new Date()
                let hora:number = Number(fecha.getHours())-5;
                if(hora<0){
                    hora+=24
                }
                //let coordenada:any;
                let datos = new baseDatos({
                    mat: payload.mat,
                    lat: payload.lat,
                    long: payload.long,
                    anio: fecha.getFullYear(),
                    mes: fecha.getMonth(),
                    dia: fecha.getDate(),
                    hora: hora,
                    minuto: fecha.getMinutes(),
                    segundo: fecha.getSeconds()
                })
                datos.save((err,datoBd)=>{
                    if(err){
                        return
                    }
                    //io.emit('recargar',{lat: payload.lat,long: payload.long,})
                    //callback(datoBd)            
                });
                Usuarios.findById(payload.mat)
                    .exec((err,usuarioDb:UsuarioInterface)=>{
                        if(err){
                            return
                        }
                        if(!usuarioDb){
                            return
                        }
                        UltiCoor.findByIdAndUpdate(payload.mat,{img: usuarioDb.img,lat: payload.lat,long: payload.long})
                            .exec((err,coorDb)=>{
                                if(err){
                                    return
                                }
                                if(!coorDb){
                                    let ultiCoor = new UltiCoor({
                                        _id: payload.mat,
                                        nombre: usuarioDb.nombre,
                                        img: usuarioDb.img,
                                        lat: payload.lat,
                                        long: payload.long,
                                        color: '#' + Math.floor(Math.random()*16777215).toString(16)
                                    })
                                    ultiCoor.save((err,datoBd)=>{
                                        if(err){
                                            return
                                        }
                                        //io.emit('actualCoor',datoBd)
                                        //coordenada = datoBd
                                    })
                                }
                            })
                    })
                    
                    
                io.emit('recargar',{lat: payload.lat,long: payload.long,_id: payload.mat})
            }
        })
        
    })
}
