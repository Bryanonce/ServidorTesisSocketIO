//Imports
import {Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {SEMILLA} from '../global/config';

//===================
//  Validar Token
//===================
export let validacionToken = (req:any, res:Response, next:NextFunction) => {
    let token = req.get('token-request')
    if (!token) {
        return res.status(403).json({
            ok: false,
            message: 'token no encontrado'
        })
    }
    jwt.verify(token, SEMILLA, (err:any, decode:any) => {
        if (err) {
            return res.status(403).json({
                ok: false,
                description: 'token muerto',
                message: err
            });
        };
        req.usuario = decode.usuarioDb;
        next()
    })
}


//===================
//  Validar Rol
//===================
export let validarRol = (req:any, res:Response, next:NextFunction) => {
    let role = req.usuario.tipo;
    if (!(role === 'ACCESO_RECURSOS')) {
        return res.status(401).json({
            ok: false,
            description: 'Área restringida'
        })
    }
    next();
}


//===================
// Verifica TokenImg
//===================
export let verificaTokenImg = (req:any, res:Response, next:NextFunction) => {
    let token = req.query.token;
    jwt.verify(token, SEMILLA, (err:any, decode:any) => {
        if (err) {
            return res.status(403).json({
                ok: false,
                description: 'token muerto',
                message: err
            });
        };
        req.usuario = decode.usuarioDb;
        next()
    })
}

