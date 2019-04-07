import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI_TEST, {
	useNewUrlParser: true
});