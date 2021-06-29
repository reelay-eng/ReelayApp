import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { AuthStyles, TextStyles } from '../styles';

const SignUpScreen = ({ navigation }) => {
    const [username, setUsername] = useState(true);
    const [email, setEmail] = useState(true);
    const [password, setPassword] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState(true);

    const createAccount = () => {
        console.log('Attempting account creation');
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
                placeholder={'Username or email'} 
                onChangeText={(text) => {
                    setEmail(text);
                    setUsername(text);
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