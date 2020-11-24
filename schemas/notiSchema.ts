import mongoose,{ Schema } from 'mongoose';

const objeto = {
	type: String
}
const notiSchema = new Schema({
	fecha: objeto,
	titulo: objeto,
	copete: objeto,
	foto: objeto,
	cuerpo: objeto,
	epigrafe: objeto
});

export default mongoose.model('Noticia',notiSchema);