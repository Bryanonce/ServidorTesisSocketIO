"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CADUCIDAD = exports.CLIENTE = exports.SEMILLA = exports.URL_DATABASE = exports.SERVER_PORT = void 0;
exports.SERVER_PORT = Number(process.env.PORT) || 5000;
exports.URL_DATABASE = String(process.env.MONGO_URI); // || 'mongodb://localhost:27017/tesis'
exports.SEMILLA = String(process.env.SEED) || 'semilla-de-prueba';
exports.CLIENTE = String(process.env.CLIENV);
exports.CADUCIDAD = Number(process.env.CAD_TOKEN) || 60 * 60 * 24 * 30;
