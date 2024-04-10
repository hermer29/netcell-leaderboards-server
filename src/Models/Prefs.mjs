import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Prefs = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
	values: String
});

class PrefsClass {
    static getValues(userId) {
        return this.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId)
                }
            }
        ])
    }
}

Prefs.loadClass(PrefsClass);

export default mongoose.model('Prefs', Prefs);