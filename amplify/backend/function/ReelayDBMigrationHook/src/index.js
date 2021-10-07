const https = require('https');

const REELAYDB_BASE_URL = 'https://data.reelay.app';

const postObjectToReelayAPI = async (obj, endpoint) => {
    
    const params = {
        method: "POST",
        mode: "cors",
        headers: {"Content-Type":"application/json"}, 
        body: obj,
    };
    const url = REELAYDB_BASE_URL + endpoint;
    console.log(url, params);

    try {
        const result = await doPostRequest(endpoint, obj);
        console.log(`Status code: ${result}`);
        return result;
    } catch (error) {
        console.error(`Error doing the request for the event: ${error}`);
        return { error };
    }
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

const doPostRequest = (path, data) => {

    return new Promise((resolve, reject) => {
        console.log('Creating promise');
        const options = {
            host: 'data.reelay.app',
            path: path,
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        //create the request object with the callback with the result
        console.log('Creating request');

        const req = https.request(options, (res) => {
            console.log('On response: ', res);
            resolve(JSON.stringify(res.statusCode));
        });
        
        console.log('Request created');
        
        req.on('data', d => {
            console.log('on data');
            console.log(d);
        });
        
        // handle the possible errors
        req.on('error', (e) => {
            console.log('on error');
            reject(e.message);
        });
        
        console.log('About to write request ', JSON.stringify(data));
        
        //do the request
        req.write(JSON.stringify(data));
        console.log('Request written ', JSON.stringify(data));
        
        //finish the request
        req.end();
    });
};

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.handler = async event => {
    console.log(event);    
    await asyncForEach(event.Records, async record => {
        await migrateRecord(record);
    });
    return Promise.resolve('Successfully processed DynamoDB record');
}
