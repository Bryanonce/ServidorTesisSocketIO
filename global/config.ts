export const SERVER_PORT:number = Number(process.env.PORT) || 5000;

//=========================
//         Entorno
//=========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//=========================
//       Base de datos
//=========================
let urlDataBase: string;
if(process.env.NODE_ENV === 'dev'){
	urlDataBase = 'mongodb://localhost:27017/tesis';
}else{
	urlDataBase = String(process.env.MONGO_URI);
}

export const URL_DATABASE:string = urlDataBase;

export const SEMILLA:string = String(process.env.SEED) || 'semilla-de-prueba';

export const CLIENTE:string = String(process.env.CLIENV);

export const CADUCIDAD:number = Number(process.env.CAD_TOKEN) || 60 * 60 * 24 * 30;