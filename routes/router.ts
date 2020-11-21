import { Router, Request, Response } from 'express';
import baseDatos from '../schemas/coordSchema';

export const router = Router();

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

router.post('/',(req:Request,res:Response)=>{
    
})