import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Score = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	leaderboard: String,
	score: Number,
});

class ScoreClass {
	static getLeaderboard(leaderboardName) {
		return this.aggregate([
			{
				$match: {
					leaderboard: leaderboardName
				}
			},
			{
				$group: {
					_id: '$user',
					score: {
						$max: '$score'
					},
				}
			}
		]);
	}
}

Score.loadClass(ScoreClass);

export default mongoose.model('Score', Score);