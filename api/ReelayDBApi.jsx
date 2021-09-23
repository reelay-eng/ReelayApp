// import { Sequelize } from 'sequelize';
// const Sequelize = require('sequelize');

import Constants from 'expo-constants';

const DB_USERNAME = Constants.manifest.extra.dbUsername;
const DB_PASSWORD = Constants.manifest.extra.dbPassword;
const DB_ENDPOINT = Constants.manifest.extra.dbEndpoint;

const sequelize = new Sequelize({
    database: 'postgres',
    username: DB_USERNAME,
    password: DB_PASSWORD,
    options: {
        host: DB_ENDPOINT,
        dialect: 'postgres',
        typeValidation: true,
    }
});

const Comment = sequelize.define('Comment', {
    content: DataTypes.TEXT,
    creatorID: DataTypes.UUID,
    reelayID: {
        primaryKey: true,
        type: DataTypes.UUID,
    },
    userID: DataTypes.UUID,
    postedAt: DataTypes.DATE,
    visibility: DataTypes.TEXT,
});

const Like = sequelize.define('Like', {
    creatorID: DataTypes.UUID,
    reelayID: {
        primaryKey: true,
        type: DataTypes.UUID,
    },
    userID: DataTypes.UUID,
    postedAt: DataTypes.DATE,
});

const Reelay = sequelize.define('Reelay', {
    creatorID: DataTypes.UUID,
    creatorUsername: DataTypes.TEXT,
    episode: DataTypes.INTEGER,
    isMovie: DataTypes.BOOLEAN,
    isSeries: DataTypes.BOOLEAN,
    season: DataTypes.INTEGER,
    tmdbTitleID: DataTypes.INTEGER,
    uploadedAt: DataTypes.DATE,
    venue: DataTypes.TEXT,
    visibility: DataTypes.TEXT,
    videoS3Key: DataTypes.TEXT,
}, {
    indexes: [
        { fields: ['creatorUsername', 'visibility'] },
        { fields: ['tmdbTitleID', 'visibility'] },
        { fields: ['uploadedAt', 'visibility'] },
    ],
});

const User = sequelize.define('User', {
    birthdate: DataTypes.DATEONLY,
    email: DataTypes.TEXT,
    phoneNumber: DataTypes.TEXT,
    pushTokenID: DataTypes.TEXT,
    sub: DataTypes.TEXT,
    username: {
        primaryKey: true,
        type: DataTypes.TEXT,
    },
}, {
    indexes: [
        { fields: ['email'] },
    ],
});

const updateUser = async (cognitoUserObj) => {
    const userObj = {
        username: cognitoUserObj.username,
        email: cognitoUserObj.email,
        sub: cognitoUserObj.id,
    }
    try {
        await User.create(userObj);
        console.log('User successfully created');    
    } catch (e) {
        console.log(e);
    }
}

const updateUserPushToken = async (cognitoUserObj, pushToken) => {
    const userObj = {
        username: cognitoUserObj.username,
        email: cognitoUserObj.email,
        sub: cognitoUserObj.id,
        pushToken: pushToken,
    }
    try {
        await User.create(userObj);
        console.log('User successfully created');    
    } catch (e) {
        console.log(e);
    }
}

const createComment = async (commentObj) => {
    try {
        await Comment.create(commentObj);
        console.log('Comment successfully created');    
    } catch (e) {
        console.log(e);
    }
}

const createLike = async (likeObj) => {
    try {
        await Like.create(likeObj);
        console.log('Like successfully created');    
    } catch (e) {
        console.log(e);
    }
}

const createReelay = async (reelayObj) => {
    try {
        await Reelay.create(reelayObj);
        console.log('User successfully created');    
    } catch (e) {
        console.log(e);
    }
}

const createUser = async (userObj) => {
    try {
        await User.create(userObj);
        console.log('User successfully created');    
    } catch (e) {
        console.log(e);
    }
}

const getComments = async (reelayID) => {
    return await Comment.findAll({ where: { reelayID: reelayID }});
};

const getLikes = async (reelayID) => {
    return await Like.findAll({ where: { reelayID: reelayID }});
};

const getUser = async (username) => {
    return await User.findOne({ where: { username: username }});
};

export { createComment, createLike, createReelay, createUser, getUser, updateUser };