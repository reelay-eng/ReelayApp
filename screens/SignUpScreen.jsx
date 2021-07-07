import React, { useContext, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';
import { AuthStyles, TextStyles } from '../styles';

import { AuthContext } from '../context/AuthContext';
import { reelaySignUp } from '../api/ReelayAuthApi';

const SignUpScreen = ({ navigation }) => {

    const authContext = useContext(AuthContext);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState(true);

    const createAccount = async () => {
        console.log('Attempting account creation');
        const signUpResult = await reelaySignUp({
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
        }).catch((error) => {
            console.log('Couldn\'t sign up user');
            console.log(error);
        });
    }

    const passwordsMatch = () => (password == confirmPassword);
    const passwordLongEnough = () => (password.length >= 8);

    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <Text h3 style={AuthStyles.headerTextCentered}>{'Create an Account'}</Text>
            <Input 
                autoCapitalize='none'
                placeholder={'Username'} 
                onChangeText={(text) => {
                    setUsername(text);
                }}
                rightIcon={{type: 'ionicon', name: 'person-outline'}}
                style={{
                    ...AuthStyles.input,
                }}
            />
            <Input 
                autoCapitalize='none'
                placeholder={'Email'} 
                onChangeText={(text) => {
                    setEmail(text);
                }}
                rightIcon={{type: 'ionicon', name: 'mail-outline'}}
                style={{
                    ...AuthStyles.input,
                }}
            />
            <Input 
                placeholder={'Enter password'} 
                onChangeText={(password) => setPassword(password)}
                rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                secureTextEntry={true}
                style={{
                    ...AuthStyles.input,
                }}
            />
            <Input 
                placeholder={'Re-enter password'} 
                onChangeText={(password) => setConfirmPassword(password)}
                rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                secureTextEntry={true}
                style={{
                    ...AuthStyles.input,
                }}
            />

            { !passwordLongEnough() && <Text style={{
                ...AuthStyles.systemText,
                ...AuthStyles.systemTextForm
            }}>{'Passwords must be at least 8 characters.'}</Text> }

            { !passwordsMatch() && <Text style={{
                ...AuthStyles.systemText,
                ...AuthStyles.systemTextForm
            }}>{"Passwords don't match!"}</Text> }

            <Button title='Continue' type='solid' onPress={createAccount} disabled={!(passwordsMatch() && passwordLongEnough())}
                style={AuthStyles.submitButton} />
            <Button title='Login' type='clear' onPress={() => { navigation.push('SignInScreen') }} 
                style={AuthStyles.clearButton}
            />
        </SafeAreaView>
    );
}

export default SignUpScreen;