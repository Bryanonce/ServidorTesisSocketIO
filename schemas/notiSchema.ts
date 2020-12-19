import mongoose,{ Schema } from 'mongoose';

const objeto = {
	type: Number,
	required: [true, "Se necesita el dato completo"]
}
const notiSchema = new Schema({
	mat: {
		type: String,
		required: [true, "Se necesita Identificación"]
	},
	lat: objeto,
	long: objeto,
	fecha: {
		type: Date,
		required: [true, "Se necesita fecha"]
	}
});

export default mongoose.model('Noticia',notiSchema);