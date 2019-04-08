import mongoose from 'mongoose';

export default mongoose.connect(process.env.MONGO_URI_TEST, {
	useNewUrlParser: true
});