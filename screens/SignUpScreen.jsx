import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { AuthStyles } from '../styles';

const SignUpScreen = ({ navigation }) => {
    const [isSignup, setIsSignup] = useState(true);
    const [username, setUsername] = useState(true);
    const [email, setEmail] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState(true);
    const [password, setPassword] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState(true);

    const createAccount = () => {
        console.log('Attempting account creation');
    }

    const passwordsMatch = () => (password == confirmPassword);

    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <Text h3 style={{
                flex: 0.4,
                alignSelf: 'center',
                marginTop: 20,
                color: 'white',
                fontFamily: 'System',
            }}>{'Create an Account'}</Text>
            <Input 
                placeholder={'Username or email'} 
                onChangeText={(text) => {
                    setEmail(text);
                    setUsername(text);
                }}
                rightIcon={{type: 'ionicon', name: 'mail-outline'}}
                style={{
                    flex: 1,
                    color: 'white',
                    fontFamily: 'System',
                }}
            />
            <Input 
                placeholder={'Enter password'} 
                onChangeText={(password) => setPassword(password)}
                rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                secureTextEntry={true}
                style={{
                    flex: 1, 
                    color: 'white',
                    fontFamily: 'System',
                }}
            />
            <Input 
                placeholder={'Re-enter password'} 
                onChangeText={(password) => setConfirmPassword(password)}
                rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                secureTextEntry={true}
                style={{
                    flex: 1, 
                    color: 'white',
                    fontFamily: 'System',
                }}
            />

            { !passwordsMatch() && <Text style={{
                alignSelf: 'center',
                color: 'white',
                fontFamily: 'System',
            }}>{"Passwords don't match!"}</Text> }

            <Button title='Continue' type='solid' onPress={createAccount} disabled={!passwordsMatch()}
                style={{
                    alignSelf: 'center',
                    marginTop: 10,
                    width: '75%',
                }} />
            <Button title='Login' type='clear' onPress={() => { navigation.push('SignInScreen') }} 
                style={{ marginTop: 10 }}
            />
        </SafeAreaView>
    );
}

export default SignUpScreen;