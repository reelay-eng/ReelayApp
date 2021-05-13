import { DataStore } from 'aws-amplify';
import { User } from '/src/models';

exports.handler = event => {
  //eslint-disable-line
  console.log(JSON.stringify(event, null, 2));
  event.Records.forEach(record => {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
  });

  const newUser = new User({
    id: event.request.userAttributes.sub,
    email: event.request.userAttributes.email,
    username: event.request.userAttributes.username,
  });

  try {
    const savedUser = await DataStore.save(newUser);
    const successMessage = 'Successfully added DynamoDB record for ' + savedUser.username;
    return Promise.resolve(successMessage);
  } catch (error) {
    const errorMessage = 'Error, failed to process DynamoDB record' + error
    return Promise.resolve(errorMessage);
  }
};
