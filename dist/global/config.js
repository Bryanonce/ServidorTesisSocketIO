"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIENTE = exports.SEMILLA = exports.URL_DATABASE = exports.SERVER_PORT = void 0;
exports.SERVER_PORT = Number(process.env.PORT) || 5000;
exports.URL_DATABASE = process.env.MONGO_URI || 'mongodb://localhost:27017/tesis';
exports.SEMILLA = process.env.SEED || 'semilla-de-prueba';
exports.CLIENTE = '1003353693226-qb903v62a9dvivgeh2qn6q2hk6d804ha.apps.googleusercontent.com';
