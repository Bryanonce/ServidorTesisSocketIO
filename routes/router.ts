import {SEMILLA,CLIENTE} from '../global/config';
import { Router, Request, Response } from 'express';
import baseDatos from '../schemas/coordSchema';
import jwt from 'jsonwebtoken';
export const router = Router();
import Usuario from '../schemas/usuarios';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import {validacionToken, validarRol} from '../middlewares/mid';

const client = new OAuth2Client(CLIENTE);

router.get('/users', [validacionToken,validarRol] ,(req:Request,res:Response)=>{
    Usuario.find({})
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: err
                })
            }
            res.json({
                ok: true,
                usuarios
            })
        })
})

router.post('/user',(req:Request,res:Response)=>{
    let body = req.body;
    let usuario = new Usuario({
        email: body.email,
        pass: bcrypt.hashSync(body.pass, 10),
        tipo: body.tipo,
        nombre: body.nombre
    })
    usuario.save((err, usuarioDb) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: err
            })
        }
        res.json({
            ok: true,
            usuario: usuarioDb
        })
    })
})

router.get('/datos',(req:Request,res:Response)=>{
    let anioIni = req.query.anioIni || 2019;
	let anioFin = req.query.anioFin || 2040;
	let mesIni = req.query.mesIni || 1;
	let mesFin = req.query.mesFin || 12;
	let diaIni = req.query.diaIni || 1;
	let diaFin = req.query.diaFin || 31;
	let horaIni = req.query.horaIni || 0;
	let horaFin = req.query.horaFin || 23;
	let minutoIni = req.query.minutoIni || 0;
	let minutoFin = req.query.minutoFin || 59;
	baseDatos.find({
		$and:[
        	{'anio': {$gte:`${anioIni}`}},
        	{'anio': {$lte:`${anioFin}`}},
        	{'mes': {$gte:`${mesIni}`}},
        	{'mes': {$lte:`${mesFin}`}},
        	{'dia': {$gte:`${diaIni}`}},
        	{'dia': {$lte:`${diaFin}`}},
        	{'hora': {$gte:`${horaIni}`}},
        	{'hora': {$lte:`${horaFin}`}},
        	{'minuto': {$gte:`${minutoIni}`}},
        	{'minuto': {$lte:`${minutoFin}`}}
    	]
	},'lat long')
	.exec((err,req)=>{
		if(err){
			res.status(400).json({
				ok: false,
				mensaje: "Error en el primer excec",
				err
			});
		}
		res.json({
			ok: true,
			usuarios: req
		})
	})
})

router.post('/login',(req:Request,res:Response)=>{
    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDb:any) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                msg: 'No hay match',
                err
            });
        };
        if (!usuarioDb) {
            return res.status(401).json({
                ok: false,
                msg: 'No existe',
                err
            });
        };
        if (!bcrypt.compareSync(body.pass, usuarioDb.pass)) {
            return res.status(401).json({
                ok: false,
                msg: 'No hay match',
                err
            });
        };
        let token = jwt.sign({ usuarioDb }, SEMILLA, { expiresIn: process.env.CAD_TOKEN })
        res.json({
            ok: true,
            token: token
        });
    });
})

// Configuraciones de Google
async function verify(token:string) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENTE, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload:any = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

router.post('/google', async (req:Request,res:Response)=>{
    if(!req.body.idtoken){
        res.json({
            ok:false,
            message: 'No se encontró el token'
        });
    }
	let token = req.body.idtoken;
    let googleUser:any = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                message: 'Error Status 403',
                err: e
            });
        });
    Usuario.findOne({ email: googleUser.email })
        .exec((err, usuarioDb:any) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            };
            if (usuarioDb) {
                if (usuarioDb.google === false) {
                    return res.status(400).json({
                        ok: false,
                        message: {
                            desc: 'Debe utilizar su auth normal',
                            error: err
                        }
                    });
                } else {
                    let token = jwt.sign({ usuarioDb }, SEMILLA, { expiresIn: process.env.CAD_TOKEN });
                    return res.json({
                        ok: true,
                        usuario: usuarioDb,
                        token
                    });
                };
            } else {
                //SI EL USER NO EXISTE
                let usuario = new Usuario({
                    nombre: googleUser.nombre,
                    email: googleUser.email,
                    google: true,
                    img: googleUser.img,
                    pass: ':)'
                });
                usuario.save((err, usuarioDb) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            usuario: [],
                            token: ''
                        })
                    }
                    let token = jwt.sign({ usuarioDb }, SEMILLA, { expiresIn: process.env.CAD_TOKEN });
                    return res.json({
                        ok: true,
                        usuario: usuarioDb,
                        token
                    });
                })
            }
        })
});