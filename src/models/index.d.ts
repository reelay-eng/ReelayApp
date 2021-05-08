import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Artist {
  readonly id: string;
  readonly displayName?: string;
  readonly descript?: string;
  constructor(init: ModelInit<Artist>);
  static copyOf(source: Artist, mutator: (draft: MutableModel<Artist>) => MutableModel<Artist> | void): Artist;
}

export declare class Movie {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly runningTime?: number;
  readonly posterURI?: string;
  readonly trailerURI?: string;
  readonly releaseDate?: string;
  constructor(init: ModelInit<Movie>);
  static copyOf(source: Movie, mutator: (draft: MutableModel<Movie>) => MutableModel<Movie> | void): Movie;
}

export declare class Reelay {
  readonly id: string;
  readonly movieID?: string;
  readonly creatorID?: string;
  readonly videoURI?: string;
  constructor(init: ModelInit<Reelay>);
  static copyOf(source: Reelay, mutator: (draft: MutableModel<Reelay>) => MutableModel<Reelay> | void): Reelay;
}

export declare class User {
  readonly id: string;
  readonly username?: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly bio?: string;
  constructor(init: ModelInit<User>);
  static copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

export declare class Todo {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  constructor(init: ModelInit<Todo>);
  static copyOf(source: Todo, mutator: (draft: MutableModel<Todo>) => MutableModel<Todo> | void): Todo;
}