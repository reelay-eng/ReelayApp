/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      username
      email
      phoneNumber
      dateOfBirth
      createdReelayIDs
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      username
      email
      phoneNumber
      dateOfBirth
      createdReelayIDs
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      id
      username
      email
      phoneNumber
      dateOfBirth
      createdReelayIDs
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
export const createReelay = /* GraphQL */ `
  mutation CreateReelay(
    $input: CreateReelayInput!
    $condition: ModelReelayConditionInput
  ) {
    createReelay(input: $input, condition: $condition) {
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
export const updateReelay = /* GraphQL */ `
  mutation UpdateReelay(
    $input: UpdateReelayInput!
    $condition: ModelReelayConditionInput
  ) {
    updateReelay(input: $input, condition: $condition) {
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
export const deleteReelay = /* GraphQL */ `
  mutation DeleteReelay(
    $input: DeleteReelayInput!
    $condition: ModelReelayConditionInput
  ) {
    deleteReelay(input: $input, condition: $condition) {
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
export const createMovie = /* GraphQL */ `
  mutation CreateMovie(
    $input: CreateMovieInput!
    $condition: ModelMovieConditionInput
  ) {
    createMovie(input: $input, condition: $condition) {
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
export const updateMovie = /* GraphQL */ `
  mutation UpdateMovie(
    $input: UpdateMovieInput!
    $condition: ModelMovieConditionInput
  ) {
    updateMovie(input: $input, condition: $condition) {
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
export const deleteMovie = /* GraphQL */ `
  mutation DeleteMovie(
    $input: DeleteMovieInput!
    $condition: ModelMovieConditionInput
  ) {
    deleteMovie(input: $input, condition: $condition) {
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
export const createVodAsset = /* GraphQL */ `
  mutation CreateVodAsset(
    $input: CreateVodAssetInput!
    $condition: ModelVodAssetConditionInput
  ) {
    createVodAsset(input: $input, condition: $condition) {
      id
      title
      description
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
      video {
        id
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
      }
    }
  }
`;
export const updateVodAsset = /* GraphQL */ `
  mutation UpdateVodAsset(
    $input: UpdateVodAssetInput!
    $condition: ModelVodAssetConditionInput
  ) {
    updateVodAsset(input: $input, condition: $condition) {
      id
      title
      description
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
      video {
        id
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
      }
    }
  }
`;
export const deleteVodAsset = /* GraphQL */ `
  mutation DeleteVodAsset(
    $input: DeleteVodAssetInput!
    $condition: ModelVodAssetConditionInput
  ) {
    deleteVodAsset(input: $input, condition: $condition) {
      id
      title
      description
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
      video {
        id
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
      }
    }
  }
`;
export const createVideoObject = /* GraphQL */ `
  mutation CreateVideoObject(
    $input: CreateVideoObjectInput!
    $condition: ModelVideoObjectConditionInput
  ) {
    createVideoObject(input: $input, condition: $condition) {
      id
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateVideoObject = /* GraphQL */ `
  mutation UpdateVideoObject(
    $input: UpdateVideoObjectInput!
    $condition: ModelVideoObjectConditionInput
  ) {
    updateVideoObject(input: $input, condition: $condition) {
      id
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteVideoObject = /* GraphQL */ `
  mutation DeleteVideoObject(
    $input: DeleteVideoObjectInput!
    $condition: ModelVideoObjectConditionInput
  ) {
    deleteVideoObject(input: $input, condition: $condition) {
      id
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
