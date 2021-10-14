import React, { createRef, useContext, useState } from 'react';
import { SafeAreaView } from 'react-native';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../context/AuthContext';
import { showErrorToast } from '../components/utils/toasts';

import { AuthButton, AuthHeaderLeft, AuthHeaderView, AuthInput, SystemText } from '../components/utils/AuthComponents';
import BackButton from '../components/utils/BackButton';

import * as Amplitude from 'expo-analytics-amplitude';

export default SignUpScreen = ({ navigation, route }) => {

    const SIGN_UP_ERROR_MESSAGE = 'Couldn\'t create an account. Try a different username?';

    const { email } = route.params;
    const authContext = useContext(AuthContext);
    const usernameRef = createRef();
    
    usernameRef.current?.setNativeProps({
        autoCorrect: false,
    });

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState(true);

    const createAccount = async () => {
        console.log('Attempting account creation');
        await Auth.signUp({
            username: username,
            password: password,
            attributes: {
                email: email,
            },
        }).then((result) => {
            console.log('user created');
            console.log(result.user);
            authContext.setUsername(username);
            navigation.push('ConfirmEmailScreen');
            Amplitude.logEventWithPropertiesAsync('signUp', {
                username: authContext.user.username,
            });
        }).catch((error) => {
            console.log('Couldn\'t sign up user');
            console.log(error);
            showErrorToast(SIGN_UP_ERROR_MESSAGE);
        });
    }

    const passwordsMatch = () => (password == confirmPassword);
    const passwordLongEnough = () => (password.length >= 8);

    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <AuthHeaderView>
                <BackButton navigation={navigation} />
                <AuthHeaderLeft>{'Create an Account'}</AuthHeaderLeft>
            </AuthHeaderView>
            <AuthInput 
                ref={usernameRef}
                autoCapitalize='none'
                placeholder={'Username'} 
                onChangeText={(text) => {
                    setUsername(text);
                }}
                rightIcon={{type: 'ionicon', name: 'person-outline'}}
            />
            <AuthInput 
                placeholder={'Enter password'} 
                onChangeText={(password) => setPassword(password)}
                rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                secureTextEntry={true}
            />
            <AuthInput 
                placeholder={'Re-enter password'} 
                onChangeText={(password) => setConfirmPassword(password)}
                rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                secureTextEntry={true}
            />

            { !passwordLongEnough() && <SystemText>{'Passwords must be at least 8 characters.'}</SystemText> }
            { !passwordsMatch() && <SystemText>{"Passwords don't match!"}</SystemText> }

            <AuthButton title='Continue' type='solid' onPress={createAccount} disabled={!(passwordsMatch() && passwordLongEnough())}
                buttonStyle={{backgroundColor: '#db1f2e'}}  />
            <AuthButton title='Login' type='clear' onPress={() => { navigation.push('SignInScreen') }} 
                titleStyle={{color: '#db1f2e'}}
            />
        </SafeAreaView>
    );
}