// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Artist, Movie, Reelay, User, Todo } = initSchema(schema);

export {
  Artist,
  Movie,
  Reelay,
  User,
  Todo
};