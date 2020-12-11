import baseDatos from '../schemas/coordSchema';
import io, {Socket} from 'socket.io';
import UltiCoor from '../schemas/ultimaCoorSchema';
import Usuarios from '../schemas/usuarios';
import UsuarioInterface from '../classes/usuario'
import ConfigMapa from '../schemas/configSchema';
import jwt from 'jsonwebtoken';
import {SEMILLA} from '../global/config';


export const enviarCoord = (cliente:Socket, io:io.Server)=>{
    cliente.on('enviarCoordServ',(payload:{mat:string,lat:number,long:number},callback:Function)=>{
        //console.log('Nueva Medicion')
        ConfigMapa.findOne({})
        .exec((err,configDb:any)=>{
            if(err){
                console.log(err);
            }
            //console.log(configDb);
            if((payload.lat>configDb.latini) && (payload.lat<configDb.latfin) && (payload.long>configDb.longini) && (payload.long<configDb.longfin)){
                //console.log('Usuario ha enviado coordenadas')
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
                        console.log(err)
                    }
                });
                Usuarios.findById(payload.mat)
                    .exec((err,usuarioDb:UsuarioInterface)=>{
                        if(err){
                            return
                        }
                        if(!usuarioDb){
                            return
                        }
                        UltiCoor.findById(payload.mat)
                        .exec((err,usuarioData)=>{
                            if(err){
                                return
                            }
                            //console.log(usuarioData);
                            if(!usuarioData){
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
                                        console.log(err);
                                    }else{
                                        console.log(datoBd);
                                    }
                                })
                            }else{
                                UltiCoor.findByIdAndUpdate(payload.mat,{img: usuarioDb.img,lat: payload.lat,long: payload.long})
                                .exec((err)=>{
                                    if(err){
                                        console.log(err);
                                    }else{
                                        console.log('Actualizado');
                                    }
                                })
                            }
                        })
                        
                    })
                io.emit('recargar',{lat: payload.lat,long: payload.long,_id: payload.mat})

            }
        })

        ConfigMapa.findOne({})
        .exec((err,configData:{peligromedio:number,peligroalto:number})=>{
            if(err){
                return
            }
            if(!configData){
                return
            }else{
                let distMin = configData.peligromedio;
                let count = 0;

                Usuarios.find({activo:true})
                .exec((err,data:{_id:string}[])=>{
                    if(err){
                        return
                    }
                    if(!data){
                        return
                    }else{
                        //console.log(data);
                        data.forEach((element)=>{
                            //console.log(element._id);
                            UltiCoor.findById(element._id)
                            .exec((err,userDb:{lat:number,long:number})=>{
                                if(err){
                                    return
                                }
                                if(!userDb){
                                    return
                                }else{
                                    let distancia = haversineDistance([payload.long,payload.lat],[userDb.long,userDb.lat])*1000
                                    if(distancia<=distMin){
                                        count++
                                    }
                                }
                            })
                        })
                    }
                })
                console.log('conteo: ',count);
                console.log('peligromed: ',configData.peligromedio);
                console.log('peligroalt: ',configData.peligroalto);
                if(count>=configData.peligroalto){
                    io.emit('avisoPeligro',{id: payload.mat, peligro:true})
                }
            }
        })
    })
}

function haversineDistance(coords1:number[], coords2:number[], isMiles?:Boolean) {
    function toRad(x:number) {
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
    var dLon = toRad(x2)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    if(isMiles) d /= 1.60934;
    return d;
}

export const conectarCliente = (cliente:Socket)=>{
    cliente.on('conectado',(payload:{token:string})=>{
        //console.log(payload.token)
        try{
            jwt.verify(payload.token, SEMILLA, (err:any, decode:any) => {
                if (err) {
                    console.log(err);
                    console.log('Token no coincide');
                }else{
                    let id:string = decode.usuarioDb._id;
                    console.log(decode.usuarioDb._id)
                    Usuarios.findByIdAndUpdate(id,{activo:true})
                    .exec((err,usuarioDb)=>{
                        if(err){
                            console.log(err);
                            return err
                        }
                        if(!usuarioDb){
                            console.log('No se encontro el usuario')
                        }else{
                            console.log('Cliente Conectado: ' + id);
                            cliente.id = id;
                        }
                    })
                }
            })
        }catch(err){
            console.log(err);
        }
        
    })

    cliente.on('disconnect',()=>{
        Usuarios.findByIdAndUpdate(cliente.id,{activo:false})
        .exec((err,usuarioDb)=>{
            if(err){
                console.log(err);
                return err
            }
            if(!usuarioDb){
                console.log('No se encontro el usuario')
            }else{
                console.log('Cliente Desconectado: ' + cliente.id);
            }
        })
    })
}