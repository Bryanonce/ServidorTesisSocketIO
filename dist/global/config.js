"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL_DATABASE = exports.SERVER_PORT = void 0;
exports.SERVER_PORT = Number(process.env.PORT) || 5000;
exports.URL_DATABASE = process.env.MONGO_URI || 'mongodb://localhost:27017/tesis';
