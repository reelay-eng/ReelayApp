import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Comment {
  readonly id: string;
  readonly userID?: string;
  readonly reelayID?: string;
  readonly creatorI?: string;
  readonly content?: string;
  readonly postedAt?: string;
  constructor(init: ModelInit<Comment>);
  static copyOf(source: Comment, mutator: (draft: MutableModel<Comment>) => MutableModel<Comment> | void): Comment;
}

export declare class Like {
  readonly id: string;
  readonly reelayID?: string;
  readonly creatorID?: string;
  readonly userID?: string;
  readonly postedAt?: string;
  constructor(init: ModelInit<Like>);
  static copyOf(source: Like, mutator: (draft: MutableModel<Like>) => MutableModel<Like> | void): Like;
}

export declare class User {
  readonly id: string;
  readonly username: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly birthdate?: string;
  readonly createdReelayIDs?: string[];
  readonly userFollowers?: (string | null)[];
  readonly usersFollowing?: (string | null)[];
  constructor(init: ModelInit<User>);
  static copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

export declare class Reelay {
  readonly id: string;
  readonly creatorID: string;
  readonly isMovie?: boolean;
  readonly isSeries?: boolean;
  readonly movieID: string;
  readonly seriesSeason?: number;
  readonly seasonEpisode?: number;
  readonly uploadedAt?: string;
  readonly tmdbTitleID?: string;
  readonly venue?: string;
  readonly visibility?: string;
  readonly videoS3Key?: string;
  constructor(init: ModelInit<Reelay>);
  static copyOf(source: Reelay, mutator: (draft: MutableModel<Reelay>) => MutableModel<Reelay> | void): Reelay;
}