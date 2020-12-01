import {SEMILLA,CLIENTE, CADUCIDAD} from '../global/config';
import { Router, Request, Response } from 'express';
import baseDatos from '../schemas/coordSchema';
import jwt from 'jsonwebtoken';
export const router = Router();
import Usuario from '../schemas/usuarios';
import Config from '../schemas/configSchema';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import {validacionToken, validarRol} from '../middlewares/mid';
import UltiDato from '../schemas/ultimaCoorSchema';
import path from 'path';
import fs from 'fs';


const client = new OAuth2Client(CLIENTE);

router.get('/users',[validacionToken,validarRol], (req:Request,res:Response)=>{
    let buscar = {}
    if(req.query.id){
        const id = req.query.id;
        buscar = {_id: id}
    }    
    Usuario.find(buscar)
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

router.put('/users/:id',[validacionToken,validarRol],(req:Request,res:Response)=>{
    let id = req.params.id;
    let body = req.body;
    console.log(body);
    if(!body.pass){
        Usuario.findByIdAndUpdate(id,{
            email: body.email,
            nombre: body.nombre,
            //tipo: body.tipo
        })
        .exec((err)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    message: "Error al actualizar"
                })
            }
            return res.json({
                ok:true,
                message: "Actualizado con éxito"
            })
        })
    }else{
        Usuario.findByIdAndUpdate(id,{
            email: body.email,
            pass: bcrypt.hashSync(body.pass, 10),
            nombre: body.nombre,
            //tipo: body.tipo
        })
        .exec((err)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    message: "Error al actualizar"
                })
            }
            return res.json({
                ok:true,
                message: "Actualizado con éxito"
            })
        })
    }
    
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
    Usuario.findOne({ email: body.email })
    .exec((err,usuarioDb:any)=>{
        if(err){
            return res.status(401).json({
                ok: false,
                msg: 'Error',
                err
            });
        }
        if (!usuarioDb) {
            return res.status(401).json({
                ok: false,
                msg: 'No existe',
                err
            });
        };
        if(usuarioDb.tipo === 'ACCESO_RECURSOS'){
            if (!bcrypt.compareSync(body.pass, usuarioDb.pass)) {
                return res.status(401).json({
                    ok: false,
                    msg: 'No hay match',
                    err
                });
            };
            let token = jwt.sign({ usuarioDb }, SEMILLA, { expiresIn: CADUCIDAD })
            res.json({
                ok: true,
                token: token
            });
        }else{
            return res.status(401).json({
                ok:false,
                msg: "Área solo para administradores"
            })
        }
    })
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
        return res.json({
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
                    let token = jwt.sign({ usuarioDb }, SEMILLA, { expiresIn: CADUCIDAD });
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
                    let token = jwt.sign({ usuarioDb }, SEMILLA, { expiresIn: CADUCIDAD });
                    return res.json({
                        ok: true,
                        usuario: usuarioDb,
                        token
                    });
                })
            }
        })
});

router.get('/ultidatos', (req:Request,res:Response)=>{
    UltiDato.find({})
    .exec((err,usuarioDb)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                datos: []
            })
        }
        return res.json({
            ok:true,
            datos: usuarioDb
        })
    })
})

router.get('/config',(req:Request,res:Response)=>{
    Config.findOne({})
    .exec((err,configDb)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                message: "Error en la Petición"
            })
        }
        if(!configDb){
            return res.json({
                ok:true,
                message: "Éxito en la conexión",
                existe: false
            })
        }
        return res.json({
            ok: true,
            message: "Éxito en la conexión",
            existe: true,
            id: configDb._id,
            config: configDb
        })
    })
})

router.post('/config',[validacionToken,validarRol],(req:Request,res:Response)=>{
    let body = req.body;
    let config = new Config({
        latcentro: body.latcentro,
        longcentro: body.longcentro,
        latini: body.latini,
        latfin: body.latfin,
        longini: body.longini,
        longfin: body.longfin,
        escala: body.escala
    })
    config.save((err,configDb)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                message: "Error al guardar en la Db"
            })
        }
        return res.json({
            ok:true,
            message: "Guardado con éxito",
            id: configDb._id
        })
    })
})

router.put('/config', [validacionToken,validarRol],(req:Request,res:Response)=>{
    let body = req.body.config;
    let id = req.body.id;
    Config.findByIdAndUpdate(id,
        {
            latcentro: body.latcentro,
            longcentro: body.longcentro,
            latini: body.latini,
            latfin: body.latfin,
            longini: body.longini,
            longfin: body.longfin,
            escala: body.escala
        })
    .exec((err)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                message: "Error al actualizar"
            })
        }
        return res.json({
            ok:true,
            message: "Actualización Completada"
        })
    })
})

router.delete('/users',[validacionToken,validarRol],(req:Request,res:Response)=>{
    console.log('Eliminando Usuario...')
    let id = req.params.id;
    Usuario.findByIdAndDelete(id)
    .exec((err)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                message: 'Error al eliminar usuario'
            })
        }
        return res.json({
            ok:true,
            message: "Usuario eliminado"
        })
    })
})

//Subida de Archivos

router.put('/upload/:id',[validacionToken,validarRol], (req:Request, res:Response) => {
    let id = req.params.id;
    Usuario.findById(id)
        .exec((err, usuarioDb:any) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error en la conexión',
                    err
                });
            };
            if (!usuarioDb) {
                return res.status(400).json({
                    ok: false,
                    message: 'No se encontró el usuario',
                    err
                });
            };
            //Path de la img
            borrArchivo(usuarioDb.img);
            //Guardar en Server
            if (!req.files) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se ha seleccionado ningún archivo'
                    }
                })
            }
            //console.log('........')
            let archivo = req.files.archivo;
            //console.log(req.files['']);
            let nombreCortado = archivo.name.split('.');
            let extension = nombreCortado[nombreCortado.length - 1];
            //console.log(extension);
            //Extensiones permitidas
            let extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

            if (extencionesValidas.indexOf(extension) < 0) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        extencion: extension,
                        message: `Las extensiones permitidas son: ${extencionesValidas}`,
                    }
                })
            }

            //Cambiar nombre al archivo
            let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`
            //console.log(nombreArchivo);
            archivo.mv(`dist/uploads/img/${nombreArchivo}`, (err) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
            });
            usuarioDb.img = nombreArchivo
            usuarioDb.save((err:any) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: err
                    })
                }
            })
            return res.json({
                ok: true,
                message: 'Subida con éxito'
            })
        });
});

let borrArchivo = (nombreImagen:string) => {
    try{
        let pathImg = path.resolve(__dirname, `../uploads/img/${nombreImagen}`);
        if (fs.existsSync(pathImg)) {
            fs.unlinkSync(pathImg);
        }
    }catch{
    }
    
};

router.get('/imagen/:img',(req:Request,res:Response)=>{
    try{
        let img = req.params.img;
        let pathImg = path.resolve(__dirname, `../uploads/img/${img}`);
        return res.sendFile(pathImg)
    }catch(err){
        return res.status(500).json({
            ok:false,
            message: "No se pudo optener la imagen",
            err
        })
    }

    
})