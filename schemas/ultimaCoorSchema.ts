import mongoose,{ Schema } from 'mongoose';

const objeto = {
	type: Number,
	required: [true, "Se necesita el dato completo"]
}
const UltCoordSchem = new Schema({
    nombre: {
        type: String,
        required: [true, 'Se necesita el nombre']
    },
    img: {
        type: String,
        default: ''
    },
    lat: objeto,
    long: objeto,
    color: {
        type: String,
        required: [true, "Se necesita Color"]
    }

});
export default mongoose.model('UltCoor',UltCoordSchem);