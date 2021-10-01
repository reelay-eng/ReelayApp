
- comments
    - POST      /reelays/{id}/comments
    - GET       /reelays/{id}/comments
    - PATCH     /comments/{id}
    - DELETE    /comments/{id}

- commentlikes
    - POST      /comments/{id}/likes
    - GET       /comments/{id}/likes
    - DELETE    /commentlikes/{id}

- feed
    - GET       /feed/{userid}/global
    - GET       /feed/{userid}/following

- following
    - POST      /users/{id}/following
    - GET       /users/{id}/following
    - GET       /users/{id}/followers
    - DELETE    /following/{id}

- likes
    - POST      /reelays/{id}/likes
    - GET       /reelays/{id}/likes
    - DELETE    /likes/{id}

- notifications
    - POST      /users/{id}/notifications
    - GET       /users/{id}/notifications
    - PATCH     /notifications/{id}
    - DELETE    /notifications/{id}

- reelays
    - POST      /reelays
    - GET       /reelays
    - GET       /reelays/{id}
    - PATCH     /reelays/{id}
    - DELETE    /reelays/{id}

- users
    - POST      /users
    - GET       /users/{id}
    - PATCH     /users/{id}
    - DELETE    /users/{id}