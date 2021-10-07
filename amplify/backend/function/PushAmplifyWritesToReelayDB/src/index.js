const axios = require('axios');

const REELAYDB_BASE_URL = 'https://data.reelay.app';

const postObjectToReelayAPI = async (obj, endpoint) => {
    const params = {
        method: "POST",
        mode: "cors",
        headers: {"Content-Type":"application/json"}, 
        body: obj,
    };
    const url = REELAYDB_BASE_URL + endpoint;
    console.log('About to send post request');
    console.log(url, params);
    
    const result = await axios.post(url, params);
    
    console.log('Post result: ', result);
    return result;
}

// if reelay create: register it
// if reelay delete: delete it
// if like create/delete: ditto
// if comment create/delete: ditto

const migrateRecord = async (record) => {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
    
    if (record.eventName === 'INSERT') { // INSERT
        const newImage = record.dynamodb.NewImage;
        const dataType = newImage?.__typename?.S;
        
        if (dataType === 'Reelay') {
            await postObjectToReelayAPI({
                // ...newImage,
                creatorSub: newImage.creatorID.S,
                creatorName: newImage.owner.S,
                datastoreSub: newImage.id.S,
                isMovie: newImage.isMovie.BOOL,
                isSeries: newImage.isSeries.BOOL,
                postedAt: newImage.uploadedAt.S,
                tmdbTitleID: newImage.tmdbTitleID.S,
                venue: newImage.venue.S,
                videoS3Key: newImage.videoS3Key.S,
                visibility: newImage.visibility.S,
            }, '/reelays/sub');
        } else if (dataType === 'Like') {
            await postObjectToReelayAPI({
                // ...newImage,
                creatorName: newImage.creatorID.S,
                username: newImage.userID.S,
                reelaySub: newImage.reelayID.S,
                postedAt: newImage.postedAt.S,
                datastoreSub: newImage.id.S,
            }, '/reelays/sub/' + newImage.reelayID.S + '/likes');
        } else if (dataType === 'Comment') {
            await postObjectToReelayAPI({
                // ...newImage,
                creatorName: newImage.creatorID.S,
                content: newImage.content.S,
                authorName: newImage.userID.S,
                reelaySub: newImage.reelayID.S,
                postedAt: newImage.postedAt.S,
                datastoreSub: newImage.id.S,
                visibility: newImage.visibility.S,
            }, '/reelays/sub/' + newImage.reelayID.S + '/comments');
        } else {
            // do nothing
            console.log('Did not recognize data type: ', dataType);
        }
    } else {
        console.log('Did not recognize event name: ', record.eventName);
    }
}

// export function handler(event) {
exports.handler = event => {
    console.log(event);
    //eslint-disable-line
    console.log(JSON.stringify(event, null, 2));
    event.Records.forEach(async record => {
        await migrateRecord(record);
        console.log('DynamoDB record: ', record.dynamodb);
    });
    return Promise.resolve('Successfully processed DynamoDB record');
}
