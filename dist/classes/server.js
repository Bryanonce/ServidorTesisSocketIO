"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const config_1 = require("../global/config");
const socket_io_1 = __importDefault(require("socket.io"));
const socket = __importStar(require("../sockets/socketIO"));
class Server {
    constructor(app = express_1.default(), httpServer = new http_1.default.Server(app), port = config_1.SERVER_PORT) {
        this.app = app;
        this.httpServer = httpServer;
        this.port = port;
        this.io = socket_io_1.default(this.httpServer);
        this.escucharSockets();
    }
    static get instance() {
        return this._instance || (this._instance = new this());
    }
    start() {
        this.httpServer.listen(this.port, () => {
            console.log(`Servidor Online en puerto ${this.port}`);
        });
    }
    escucharSockets() {
        console.log('Escuchando conexión');
        this.io.on('connection', (cliente) => {
            socket.enviarCoord(cliente, this.io);
            socket.conectarCliente(cliente, this.io);
        });
    }
}
exports.Server = Server;
