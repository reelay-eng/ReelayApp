import { Auth } from 'aws-amplify';

const reelaySignUp = async ({
    username,
    password,
    attributes: {
        email,
    }
}) => {
    try {
        const signUpResult = { user, userConfirmed, userSub } = await Auth.signUp({
            username,
            password,
            attributes: {
                email: email,
            }
        });
        console.log(signUpResult);
        return signUpResult;
    } catch (error) {
        console.log('error signing up: ', error);
        return null;
    }
}

const reelaySignIn = async ({username, password}) => {
    try {
        const user = await Auth.signIn(username, password);
        console.log('signed in successfully');
        console.log(user);
        return user;
    } catch (error) {
        console.log('error signing in: ', error);
        return null;
    }
}

const reelaySignOut = async() => {
    try {
        await Auth.signOut();
    } catch (error) {
        console.log('error signing out: ', error);
    }
}

const reelayConfirmEmail = async ({ username, confirmationCode }) => {
    try {
        const confirmEmailResult = await Auth.confirmSignUp(username, confirmationCode);
        console.log('code resent successfully');
        console.log(confirmEmailResult);
        return confirmEmailResult;
    } catch (error) {
        console.log('error resending confirmation code: ', error);
        return null;
    }
}

const reelayResendConfirmationCode = async ({ username }) => {
    try {
        const resendConfirmationResult = await Auth.resendSignUp(username);
        console.log('code resent successfully');
        return resendConfirmationResult;
    } catch (error) {
        console.log('error resending confirmation code: ', error);
        return null;
    }
}

export { reelaySignUp, reelaySignIn, reelaySignOut, reelayConfirmEmail, reelayResendConfirmationCode };