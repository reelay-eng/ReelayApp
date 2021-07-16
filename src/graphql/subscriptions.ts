/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateVodAsset = /* GraphQL */ `
  subscription OnCreateVodAsset {
    onCreateVodAsset {
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
export const onUpdateVodAsset = /* GraphQL */ `
  subscription OnUpdateVodAsset {
    onUpdateVodAsset {
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
export const onDeleteVodAsset = /* GraphQL */ `
  subscription OnDeleteVodAsset {
    onDeleteVodAsset {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
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
export const onCreateReelay = /* GraphQL */ `
  subscription OnCreateReelay {
    onCreateReelay {
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
export const onUpdateReelay = /* GraphQL */ `
  subscription OnUpdateReelay {
    onUpdateReelay {
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
export const onDeleteReelay = /* GraphQL */ `
  subscription OnDeleteReelay {
    onDeleteReelay {
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
export const onCreateMovie = /* GraphQL */ `
  subscription OnCreateMovie {
    onCreateMovie {
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
export const onUpdateMovie = /* GraphQL */ `
  subscription OnUpdateMovie {
    onUpdateMovie {
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
export const onDeleteMovie = /* GraphQL */ `
  subscription OnDeleteMovie {
    onDeleteMovie {
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
export const onCreateVideoObject = /* GraphQL */ `
  subscription OnCreateVideoObject {
    onCreateVideoObject {
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
export const onUpdateVideoObject = /* GraphQL */ `
  subscription OnUpdateVideoObject {
    onUpdateVideoObject {
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
export const onDeleteVideoObject = /* GraphQL */ `
  subscription OnDeleteVideoObject {
    onDeleteVideoObject {
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
