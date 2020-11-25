import baseDatos from '../schemas/coordSchema';
import io, {Socket} from 'socket.io';
import UltiCoor from '../schemas/ultimaCoorSchema';
import Usuarios from '../schemas/usuarios';
import UsuarioInterface from '../classes/usuario'

export const conectarCliente = (cliente:Socket, io:io.Server)=>{
    cliente.on('enviarCoordServ',(payload:{mat:string,lat:number,long:number},callback:Function)=>{
        console.log('Usuario ha enviado coordenadas')
        let fecha = new Date()
        let datos = new baseDatos({
            mat: payload.mat,
            lat: payload.lat,
            long: payload.long,
            anio: fecha.getFullYear(),
            mes: fecha.getMonth(),
            dia: fecha.getDate(),
            hora: Number(fecha.getHours())-5,
            minuto: fecha.getMinutes(),
            segundo: fecha.getSeconds()
        })
        datos.save((err,datoBd)=>{
            if(err){
                return
            }
            io.emit('recargar',{lat: payload.lat,long: payload.long,})
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
                UltiCoor.findById(payload.mat)
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
                                io.emit('actualCoor',datoBd)
                            })
                        }else{
                            coorDb.update({
                                img: usuarioDb.img,
                                lat: payload.lat,
                                long: payload.long
                            })
                            io.emit('actualCoor',coorDb)
                        }
                    })
            })
        
    })
}

/*export const noticiasAdmin = (admin:Socket, io:io.Server)=>{
    admin.on('envioNoti',(payload:{fecha:string,copete:string,titulo:string,foto:string,cuerpo:string,epigrafe:string})=>{

    })
}

export const sensarPersonal = (cliente:Socket,io:io.Server)=>{
    cliente.on('sensoPer',(payload:{})=>{
        
    })
}*/