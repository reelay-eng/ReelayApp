/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateMovieInput = {
  id?: string | null,
  title: string,
  description?: string | null,
  releaseDate?: string | null,
  runningTime?: number | null,
  _version?: number | null,
};

export type ModelMovieConditionInput = {
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  releaseDate?: ModelStringInput | null,
  runningTime?: ModelIntInput | null,
  and?: Array< ModelMovieConditionInput | null > | null,
  or?: Array< ModelMovieConditionInput | null > | null,
  not?: ModelMovieConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Movie = {
  __typename: "Movie",
  id?: string,
  title?: string,
  description?: string | null,
  releaseDate?: string | null,
  runningTime?: number | null,
  _version?: number,
  _deleted?: boolean | null,
  _lastChangedAt?: number,
  createdAt?: string,
  updatedAt?: string,
};

export type UpdateMovieInput = {
  id: string,
  title?: string | null,
  description?: string | null,
  releaseDate?: string | null,
  runningTime?: number | null,
  _version?: number | null,
};

export type DeleteMovieInput = {
  id?: string | null,
  _version?: number | null,
};

export type CreateUserInput = {
  id?: string | null,
  username: string,
  email?: string | null,
  phoneNumber?: string | null,
  dateOfBirth?: string | null,
  createdReelayIDs?: Array< string > | null,
  _version?: number | null,
};

export type ModelUserConditionInput = {
  username?: ModelStringInput | null,
  email?: ModelStringInput | null,
  phoneNumber?: ModelStringInput | null,
  dateOfBirth?: ModelStringInput | null,
  createdReelayIDs?: ModelIDInput | null,
  and?: Array< ModelUserConditionInput | null > | null,
  or?: Array< ModelUserConditionInput | null > | null,
  not?: ModelUserConditionInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type User = {
  __typename: "User",
  id?: string,
  username?: string,
  email?: string | null,
  phoneNumber?: string | null,
  dateOfBirth?: string | null,
  createdReelayIDs?: Array< string > | null,
  _version?: number,
  _deleted?: boolean | null,
  _lastChangedAt?: number,
  createdAt?: string,
  updatedAt?: string,
  owner?: string | null,
};

export type UpdateUserInput = {
  id: string,
  username?: string | null,
  email?: string | null,
  phoneNumber?: string | null,
  dateOfBirth?: string | null,
  createdReelayIDs?: Array< string > | null,
  _version?: number | null,
};

export type DeleteUserInput = {
  id?: string | null,
  _version?: number | null,
};

export type CreateReelayInput = {
  id?: string | null,
  creatorID: string,
  movieID: string,
  _version?: number | null,
};

export type ModelReelayConditionInput = {
  creatorID?: ModelIDInput | null,
  movieID?: ModelIDInput | null,
  and?: Array< ModelReelayConditionInput | null > | null,
  or?: Array< ModelReelayConditionInput | null > | null,
  not?: ModelReelayConditionInput | null,
};

export type Reelay = {
  __typename: "Reelay",
  id?: string,
  creatorID?: string,
  movieID?: string,
  _version?: number,
  _deleted?: boolean | null,
  _lastChangedAt?: number,
  createdAt?: string,
  updatedAt?: string,
  owner?: string | null,
};

export type UpdateReelayInput = {
  id: string,
  creatorID?: string | null,
  movieID?: string | null,
  _version?: number | null,
};

export type DeleteReelayInput = {
  id?: string | null,
  _version?: number | null,
};

export type ModelUserFilterInput = {
  id?: ModelIDInput | null,
  username?: ModelStringInput | null,
  email?: ModelStringInput | null,
  phoneNumber?: ModelStringInput | null,
  dateOfBirth?: ModelStringInput | null,
  createdReelayIDs?: ModelIDInput | null,
  and?: Array< ModelUserFilterInput | null > | null,
  or?: Array< ModelUserFilterInput | null > | null,
  not?: ModelUserFilterInput | null,
};

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items?:  Array<User | null > | null,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelReelayFilterInput = {
  id?: ModelIDInput | null,
  creatorID?: ModelIDInput | null,
  movieID?: ModelIDInput | null,
  and?: Array< ModelReelayFilterInput | null > | null,
  or?: Array< ModelReelayFilterInput | null > | null,
  not?: ModelReelayFilterInput | null,
};

export type ModelReelayConnection = {
  __typename: "ModelReelayConnection",
  items?:  Array<Reelay | null > | null,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelMovieFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  releaseDate?: ModelStringInput | null,
  runningTime?: ModelIntInput | null,
  and?: Array< ModelMovieFilterInput | null > | null,
  or?: Array< ModelMovieFilterInput | null > | null,
  not?: ModelMovieFilterInput | null,
};

export type ModelMovieConnection = {
  __typename: "ModelMovieConnection",
  items?:  Array<Movie | null > | null,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type CreateMovieMutationVariables = {
  input?: CreateMovieInput,
  condition?: ModelMovieConditionInput | null,
};

export type CreateMovieMutation = {
  createMovie?:  {
    __typename: "Movie",
    id: string,
    title: string,
    description?: string | null,
    releaseDate?: string | null,
    runningTime?: number | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateMovieMutationVariables = {
  input?: UpdateMovieInput,
  condition?: ModelMovieConditionInput | null,
};

export type UpdateMovieMutation = {
  updateMovie?:  {
    __typename: "Movie",
    id: string,
    title: string,
    description?: string | null,
    releaseDate?: string | null,
    runningTime?: number | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteMovieMutationVariables = {
  input?: DeleteMovieInput,
  condition?: ModelMovieConditionInput | null,
};

export type DeleteMovieMutation = {
  deleteMovie?:  {
    __typename: "Movie",
    id: string,
    title: string,
    description?: string | null,
    releaseDate?: string | null,
    runningTime?: number | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateUserMutationVariables = {
  input?: CreateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type CreateUserMutation = {
  createUser?:  {
    __typename: "User",
    id: string,
    username: string,
    email?: string | null,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    createdReelayIDs?: Array< string > | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateUserMutationVariables = {
  input?: UpdateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type UpdateUserMutation = {
  updateUser?:  {
    __typename: "User",
    id: string,
    username: string,
    email?: string | null,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    createdReelayIDs?: Array< string > | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteUserMutationVariables = {
  input?: DeleteUserInput,
  condition?: ModelUserConditionInput | null,
};

export type DeleteUserMutation = {
  deleteUser?:  {
    __typename: "User",
    id: string,
    username: string,
    email?: string | null,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    createdReelayIDs?: Array< string > | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreateReelayMutationVariables = {
  input?: CreateReelayInput,
  condition?: ModelReelayConditionInput | null,
};

export type CreateReelayMutation = {
  createReelay?:  {
    __typename: "Reelay",
    id: string,
    creatorID: string,
    movieID: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateReelayMutationVariables = {
  input?: UpdateReelayInput,
  condition?: ModelReelayConditionInput | null,
};

export type UpdateReelayMutation = {
  updateReelay?:  {
    __typename: "Reelay",
    id: string,
    creatorID: string,
    movieID: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteReelayMutationVariables = {
  input?: DeleteReelayInput,
  condition?: ModelReelayConditionInput | null,
};

export type DeleteReelayMutation = {
  deleteReelay?:  {
    __typename: "Reelay",
    id: string,
    creatorID: string,
    movieID: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetUserQueryVariables = {
  id?: string,
};

export type GetUserQuery = {
  getUser?:  {
    __typename: "User",
    id: string,
    username: string,
    email?: string | null,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    createdReelayIDs?: Array< string > | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListUsersQueryVariables = {
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUsersQuery = {
  listUsers?:  {
    __typename: "ModelUserConnection",
    items?:  Array< {
      __typename: "User",
      id: string,
      username: string,
      email?: string | null,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      createdReelayIDs?: Array< string > | null,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncUsersQueryVariables = {
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncUsersQuery = {
  syncUsers?:  {
    __typename: "ModelUserConnection",
    items?:  Array< {
      __typename: "User",
      id: string,
      username: string,
      email?: string | null,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      createdReelayIDs?: Array< string > | null,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetReelayQueryVariables = {
  id?: string,
};

export type GetReelayQuery = {
  getReelay?:  {
    __typename: "Reelay",
    id: string,
    creatorID: string,
    movieID: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListReelaysQueryVariables = {
  filter?: ModelReelayFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListReelaysQuery = {
  listReelays?:  {
    __typename: "ModelReelayConnection",
    items?:  Array< {
      __typename: "Reelay",
      id: string,
      creatorID: string,
      movieID: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncReelaysQueryVariables = {
  filter?: ModelReelayFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncReelaysQuery = {
  syncReelays?:  {
    __typename: "ModelReelayConnection",
    items?:  Array< {
      __typename: "Reelay",
      id: string,
      creatorID: string,
      movieID: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetMovieQueryVariables = {
  id?: string,
};

export type GetMovieQuery = {
  getMovie?:  {
    __typename: "Movie",
    id: string,
    title: string,
    description?: string | null,
    releaseDate?: string | null,
    runningTime?: number | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListMoviesQueryVariables = {
  filter?: ModelMovieFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListMoviesQuery = {
  listMovies?:  {
    __typename: "ModelMovieConnection",
    items?:  Array< {
      __typename: "Movie",
      id: string,
      title: string,
      description?: string | null,
      releaseDate?: string | null,
      runningTime?: number | null,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncMoviesQueryVariables = {
  filter?: ModelMovieFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncMoviesQuery = {
  syncMovies?:  {
    __typename: "ModelMovieConnection",
    items?:  Array< {
      __typename: "Movie",
      id: string,
      title: string,
      description?: string | null,
      releaseDate?: string | null,
      runningTime?: number | null,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type OnCreateUserSubscription = {
  onCreateUser?:  {
    __typename: "User",
    id: string,
    username: string,
    email?: string | null,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    createdReelayIDs?: Array< string > | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateUserSubscription = {
  onUpdateUser?:  {
    __typename: "User",
    id: string,
    username: string,
    email?: string | null,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    createdReelayIDs?: Array< string > | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteUserSubscription = {
  onDeleteUser?:  {
    __typename: "User",
    id: string,
    username: string,
    email?: string | null,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    createdReelayIDs?: Array< string > | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnCreateReelaySubscription = {
  onCreateReelay?:  {
    __typename: "Reelay",
    id: string,
    creatorID: string,
    movieID: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateReelaySubscription = {
  onUpdateReelay?:  {
    __typename: "Reelay",
    id: string,
    creatorID: string,
    movieID: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteReelaySubscription = {
  onDeleteReelay?:  {
    __typename: "Reelay",
    id: string,
    creatorID: string,
    movieID: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnCreateMovieSubscription = {
  onCreateMovie?:  {
    __typename: "Movie",
    id: string,
    title: string,
    description?: string | null,
    releaseDate?: string | null,
    runningTime?: number | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateMovieSubscription = {
  onUpdateMovie?:  {
    __typename: "Movie",
    id: string,
    title: string,
    description?: string | null,
    releaseDate?: string | null,
    runningTime?: number | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteMovieSubscription = {
  onDeleteMovie?:  {
    __typename: "Movie",
    id: string,
    title: string,
    description?: string | null,
    releaseDate?: string | null,
    runningTime?: number | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};
