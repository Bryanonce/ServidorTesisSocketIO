import baseDatos from '../schemas/coordSchema';
import io, {Socket} from 'socket.io';

export const conectarCliente = (cliente:Socket, io:io.Server)=>{
    cliente.on('enviarCoordServ',(payload:{mat:number,lat:number,long:number},callback:Function)=>{
        console.log('Usuario ha enviado coordenadas')
        let fecha = new Date()
        let datos = new baseDatos({
            mat: payload.mat,
            lat: payload.lat,
            long: payload.long,
            anio: fecha.getFullYear(),
            mes: fecha.getMonth(),
            dia: fecha.getDate(),
            hora: fecha.getHours()-5,
            minuto: fecha.getMinutes()
        })
        datos.save((err,datoBd)=>{
            if(err){
                callback(err)
            }
            io.emit('recargar',{lat: payload.lat,long: payload.long,})
            callback(datoBd)            
        });

        
    })
}