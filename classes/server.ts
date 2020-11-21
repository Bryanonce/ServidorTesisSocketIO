import express from 'express';
import http from 'http';
import { SERVER_PORT } from '../global/config';
import io from 'socket.io';
import * as socket from '../sockets/socketIO';

export class Server{

    private static _instance: Server;
    public io: io.Server;
    private constructor(
        public app: express.Application = express(),
        public httpServer: http.Server = new http.Server(app),
        public port:number = SERVER_PORT,
        
    ){
        this.io = io(this.httpServer);
        this.escucharSockets();
    }

    public static get instance(){
        return this._instance || (this._instance = new this())
    }

    start(){
        this.httpServer.listen(this.port,()=>{
            console.log(`Servidor Online en puerto ${this.port}`);
        })
    }


    escucharSockets(){
        console.log('Escuchando conexión')
        this.io.on('connection',(cliente)=>{
            console.log('Cliente Conectado');
            socket.conectarCliente(cliente,this.io);
        })
    }

}