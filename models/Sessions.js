module.exports = (sequelize, DataTypes) => {
	return sequelize.define('sessions', {
		user_id: DataTypes.STRING,
		session_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.String,
			allowNull: false,
			'default': 'New chat',
		},
	}, {
	});
};