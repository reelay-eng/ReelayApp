// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Comment, Like, User, Reelay } = initSchema(schema);

export {
  Comment,
  Like,
  User,
  Reelay
};