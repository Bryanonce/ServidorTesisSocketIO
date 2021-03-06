"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./global/config");
const server_1 = require("./classes/server");
const router_1 = require("./routes/router");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
mongoose_1.default.connect(config_1.URL_DATABASE, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        throw err;
    }
    console.log('Base de datos Online');
});
const server = server_1.Server.instance;
//BodyParser
server.app.use(body_parser_1.default.urlencoded({ extended: true }));
server.app.use(body_parser_1.default.json());
//Acceso CORS
server.app.use(cors_1.default({ origin: true, credentials: true }));
//Acceso File
server.app.use(express_fileupload_1.default());
//Acceso Rutas
server.app.use(router_1.router);
//Iniciar server
server.start();
