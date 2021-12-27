# Reelay

To build Reelay, clone the repo onto your machine, cd into the directory, and run `yarn setup`. This takes care of installing packages and pods, and setting up the Amplify connection.

Run the app using one of the following commands:
- `yarn local`: (development) Runs the app, connecting to a localhost server with a data connection to the `dev` feed
- `yarn cloud`: (staging) Runs the app, connecting to an AWS server with a data connection to the `dev` feed
- `yarn start`: (production) Runs the app, connecting to an AWS server with a data connection to the `global` feed

- To run the localhost server, set up the `ReelayBackend` repo locally and run the following commands in two separate windows:
    - `yarn dev`: Starts the server on localhost
    - `yarn tunnel`: Creates an HTTPS tunnel to the localhost server, so the Expo app can talk to it

Build the app using `expo build:ios` and `expo build:android` and publish them to their respective stores using on-screen instructions.