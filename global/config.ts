export const SERVER_PORT:number = Number(process.env.PORT) || 5000;

export const URL_DATABASE:string = String(process.env.MONGO_URI) || 'mongodb://localhost:27017/tesis'

export const SEMILLA:string = String(process.env.SEED) || 'semilla-de-prueba';

export const CLIENTE:string = String(process.env.CLIENV)