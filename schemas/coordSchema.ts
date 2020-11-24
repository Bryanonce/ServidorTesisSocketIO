import mongoose,{ Schema } from 'mongoose';

const objeto = {
	type: Number,
	required: [true, "Se necesita el dato completo"]
}
const datoSchema = new Schema({
	mat: {
		type: String,
		required: [true, "Se necesita Identificación"]
	},
	lat: objeto,
	long: objeto,
	anio: objeto,
	mes: objeto,
	dia: objeto,
	hora: objeto,
	minuto: objeto,
	segundo: objeto
});
export default mongoose.model('Datos',datoSchema);