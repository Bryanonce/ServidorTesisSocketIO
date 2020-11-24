import { URL_DATABASE } from './global/config';
import { Server } from './classes/server';
import { router } from './routes/router';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';


mongoose.connect(URL_DATABASE, {useNewUrlParser: true, useUnifiedTopology: true},(err)=>{
    if(err){
        throw new Error('Error de Conexión')
    } 
    console.log('Base de datos Online');
})


const server = Server.instance;

//BodyParser
server.app.use( bodyParser.urlencoded({ extended: true }) );
server.app.use( bodyParser.json() );

//Acceso CORS
server.app.use(cors({origin:true,credentials:true}));

//Acceso Rutas
server.app.use(router);

//Iniciar server
server.start();