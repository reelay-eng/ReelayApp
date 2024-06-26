/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      phoneNumber
      birthdate
      createdReelayIDs
      userFollowers
      usersFollowing
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        username
        email
        phoneNumber
        birthdate
        createdReelayIDs
        userFollowers
        usersFollowing
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
      }
      nextToken
      startedAt
    }
  }
`;
export const syncUsers = /* GraphQL */ `
  query SyncUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncUsers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        username
        email
        phoneNumber
        birthdate
        createdReelayIDs
        userFollowers
        usersFollowing
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
      }
      nextToken
      startedAt
    }
  }
`;
export const getReelay = /* GraphQL */ `
  query GetReelay($id: ID!) {
    getReelay(id: $id) {
      id
      creatorID
      isMovie
      isSeries
      movieID
      seriesSeason
      seasonEpisode
      uploadedAt
      tmdbTitleID
      videoS3Key
      visibility
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listReelays = /* GraphQL */ `
  query ListReelays(
    $filter: ModelReelayFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReelays(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        creatorID
        isMovie
        isSeries
        movieID
        seriesSeason
        seasonEpisode
        uploadedAt
        tmdbTitleID
        videoS3Key
        visibility
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
      }
      nextToken
      startedAt
    }
  }
`;
export const reelaysByUploadDate = /* GraphQL */ `
  query ReelaysByUploadDate(
    $visibility: String
    $uploadedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelReelayFilterInput
    $limit: Int
    $nextToken: String
  ) {
    reelaysByUploadDate(
      visibility: $visibility
      uploadedAt: $uploadedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        creatorID
        isMovie
        isSeries
        movieID
        seriesSeason
        seasonEpisode
        uploadedAt
        tmdbTitleID
        videoS3Key
        visibility
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
      }
      nextToken
      startedAt
    }
  }
`;
export const syncReelays = /* GraphQL */ `
  query SyncReelays(
    $filter: ModelReelayFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncReelays(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        creatorID
        isMovie
        isSeries
        movieID
        seriesSeason
        seasonEpisode
        uploadedAt
        tmdbTitleID
        videoS3Key
        visibility
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
      }
      nextToken
      startedAt
    }
  }
`;
export const getMovie = /* GraphQL */ `
  query GetMovie($id: ID!) {
    getMovie(id: $id) {
      id
      title
      description
      releaseDate
      runningTime
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const listMovies = /* GraphQL */ `
  query ListMovies(
    $filter: ModelMovieFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMovies(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        releaseDate
        runningTime
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncMovies = /* GraphQL */ `
  query SyncMovies(
    $filter: ModelMovieFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncMovies(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        title
        description
        releaseDate
        runningTime
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
