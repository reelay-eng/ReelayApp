import React, { useContext, useState } from 'react';
import { View, SafeAreaView } from 'react-native';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../../components/utils/toasts';

import { AuthButton, AuthHeaderLeft, AuthHeaderView, AuthInput } from '../../components/utils/AuthComponents';
import BackButton from '../../components/utils/BackButton';

import * as Amplitude from 'expo-analytics-amplitude';
import styled from 'styled-components/native';

export default SignInScreen = ({ navigation }) => {

    const authContext = useContext(AuthContext);

    const [username, setUsername] = useState(true);
    const [password, setPassword] = useState(true);

    const SIGN_IN_ERROR_MESSAGE = 'Couldn\'t sign in. Your username or password may be incorrect';

    const signInUser = async () => {
        console.log('Attempting user sign in');
        await Auth.signIn(
            username,
            password
        ).then((user) => {
            authContext.setUser(user);
            authContext.setUsername(user.username);
            authContext.setSignedIn(true);
            console.log('Signed in user successfully');
            Amplitude.logEventWithPropertiesAsync('signInSuccessful', {
                username: user.username,
            });
        }).catch((error) => {
            console.log('Couldn\'t sign in user');
            console.log(error);
            showErrorToast(SIGN_IN_ERROR_MESSAGE);
            Amplitude.logEventWithPropertiesAsync('signInFailed', {
                username: username,
            });
        });
    }

    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <AuthHeaderView>
                <BackButton navigation={navigation} />
                <AuthHeaderLeft>{'Sign In to Reelay'}</AuthHeaderLeft>
            </AuthHeaderView>
            <AuthInput 
                autoCapitalize='none'
                placeholder={'Enter username'} 
                onChangeText={(text) => {
                    setUsername(text);
                }}
                rightIcon={{type: 'ionicon', name: 'mail-outline'}}
            />
            <AuthInput 
                placeholder={'Enter password'} 
                onChangeText={(password) => setPassword(password)}
                rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                secureTextEntry={true}
            />
            <AuthButton title='Continue' type='solid' onPress={signInUser}
                buttonStyle={{backgroundColor: '#db1f2e'}} />
            <AuthButton title='Forgot password?' type='clear' onPress={() => { navigation.push('ForgotPasswordScreen') }}
                titleStyle={{color: '#db1f2e'}} />
        </SafeAreaView>
    );
}