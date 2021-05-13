// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Reelay, Movie } = initSchema(schema);

export {
  User,
  Reelay,
  Movie
};