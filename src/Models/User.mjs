import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const Schema = mongoose.Schema;

const User = new Schema({
	displayName: {
		type: String,
		required: false
	}
});

User.plugin(passportLocalMongoose, {
	missingPasswordError: 'Wrong password'
});

export default mongoose.model('User', User);