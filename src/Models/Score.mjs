import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Score = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
	leaderboard: String,
	score: Number,
	createdAt: {
		type: Date,
		default: Date.now
	}
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
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'user',
				}
			},
			{
				$project: {
					'_id': 0,
					'username': {
						$arrayElemAt: ['$user.username', 0],
					},
					'displayName': {
						$arrayElemAt: ['$user.displayName', 0],
					},
					'score': 1,
				}
			}
		]);
	}
	static getUsers(leaderboardName, startTime = 0, endTime = Date.now()) {
		return this.aggregate([
			{
				$match: {
					leaderboard: leaderboardName,
					createdAt: {
						$gt: new Date(startTime * 1),
						$lt: new Date(endTime * 1),
					}
				}
			},
			{
				$group: {
					_id: '$user',
				}
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'user',
				}
			},
			{
				$project: {
					'_id': 0,
					'username': {
						$arrayElemAt: ['$user.username', 0],
					},
					'displayName': {
						$arrayElemAt: ['$user.displayName', 0],
					}
				}
			}
		]);
	}
}

Score.loadClass(ScoreClass);

export default mongoose.model('Score', Score);