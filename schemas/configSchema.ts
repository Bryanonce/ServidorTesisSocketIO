import mongoose,{ Schema } from 'mongoose';

const objeto = {
	type: Number,
	required: [true, "Se necesita el dato completo"]
}
const configSchema = new Schema({
	latcentro: objeto,
	longcentro: objeto,
	latini: objeto,
	latfin: objeto,
	longini: objeto,
	longfin: objeto,
	escala: objeto
});
export default mongoose.model('ConfigMapa',configSchema);