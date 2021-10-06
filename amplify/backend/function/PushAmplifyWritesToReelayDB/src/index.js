// const AWS = require('aws-sdk');
import fetch from 'node-fetch';

const REELAYDB_BASE_URL = 'https://data.reelay.app';

const postObjectToReelayAPI = async (obj, endpoint) => {
    const params = {
        method: "POST",
        mode: "cors",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(obj),
    };
    return await fetch(REELAYDB_BASE_URL + endpoint, params);
}

// if reelay create: register it
// if reelay delete: delete it
// if like create/delete: ditto
// if comment create/delete: ditto

const migrateRecord = async (record) => {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
    
    // console.log('Old record: ', AWS.DynamoDB.Converter.unmarshall(record.dynamodb.Old));
    // console.log('New record: ', AWS.DynamoDB.Converter.unmarshall(record.dynamodb.New));
    
    if (record.eventName === 'INSERT') { // INSERT
        const dataType = record.dynamodb.__typename;
        if (dataType === 'Reelay') {
            await postObjectToReelayAPI({
                ...record.dynamodb,
                creatorSub: record.dynamodb.creatorID,
                creatorName: record.dynamodb.owner,
                postedAt: record.dynamodb.uploadedAt,
            }, '/reelays');
        } else if (dataType === 'Like') {
            await postObjectToReelayAPI({
                ...record.dynamodb,
                creatorName: record.dynamodb.owner,
                userSub: record.dynamodb.userID,
            }, '/reelays/' + record.dynamodb.reelayID + '/likes');
        } else if (dataType === 'Comment') {
            await postObjectToReelayAPI({
                ...record.dynamodb,
                creatorName: record.dynamodb.owner,
                userSub: record.dynamodb.userID,
            }, '/reelays/' + record.dynamodb.reelayID + '/comments');
        } else {
            // do nothing
            console.log('Did not recognize event type: ', dataType);
        }
    }
}

export function handler(event) {
    //eslint-disable-line
    console.log(JSON.stringify(event, null, 2));
    event.Records.forEach(async record => {
        // await migrateRecord(record);
        console.log(record.dynamodb);
    });
    return Promise.resolve('Successfully processed DynamoDB record');
}
