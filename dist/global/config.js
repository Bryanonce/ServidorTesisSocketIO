"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CADUCIDAD = exports.CLIENTE = exports.SEMILLA = exports.URL_DATABASE = exports.SERVER_PORT = void 0;
exports.SERVER_PORT = Number(process.env.PORT) || 5000;
//=========================
//         Entorno
//=========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
//=========================
//       Base de datos
//=========================
let urlDataBase;
if (process.env.NODE_ENV === 'dev') {
    urlDataBase = 'mongodb://localhost:27017/tesis';
}
else {
    urlDataBase = String(process.env.MONGO_URI);
}
exports.URL_DATABASE = urlDataBase;
exports.SEMILLA = String(process.env.SEED) || 'semilla-de-prueba';
exports.CLIENTE = String(process.env.CLIENV);
exports.CADUCIDAD = Number(process.env.CAD_TOKEN) || 60 * 60 * 24 * 30;
