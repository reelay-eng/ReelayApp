import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class User {
  readonly id: string;
  readonly username: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly dateOfBirth?: string;
  readonly createdReelayIDs?: string[];
  constructor(init: ModelInit<User>);
  static copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

export declare class Reelay {
  readonly id: string;
  readonly creatorID: string;
  readonly movieID: string;
  readonly videoS3Key?: string;
  readonly uploadedAt?: string;
  constructor(init: ModelInit<Reelay>);
  static copyOf(source: Reelay, mutator: (draft: MutableModel<Reelay>) => MutableModel<Reelay> | void): Reelay;
}

export declare class Movie {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly releaseDate?: string;
  readonly runningTime?: number;
  constructor(init: ModelInit<Movie>);
  static copyOf(source: Movie, mutator: (draft: MutableModel<Movie>) => MutableModel<Movie> | void): Movie;
}