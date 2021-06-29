import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { AuthStyles } from '../styles';

const SignInScreen = ({ navigation }) => {
    const [isSignup, setIsSignup] = useState(true);
    const [username, setUsername] = useState(true);
    const [email, setEmail] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState(true);
    const [password, setPassword] = useState(true);

    const signInUser = () => {
        console.log('Attempting user sign in');
    }

    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <View 
                style={{
                    flex: 0.4, 
                    flexDirection: 'row', 
                    justifyContent: 'center',
                    marginTop: 20,
                }}>
                <Icon type='ionicon' name='chevron-back-outline' color={'white'} size={30} 
                    onPress={() => { navigation.pop() }}
                    style={{
                        flex: 1,
                        alignSelf: 'flex-start',
                    }}/>
                <Text h3 
                    style={{
                        flex: 1,
                        alignSelf: 'flex-start',
                        color: 'white',
                        fontFamily: 'System',
                    }}>{'Sign In to Reelay'}</Text>
            </View>
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
            <Button title='Continue' type='solid' onPress={signInUser}
                style={{
                    alignSelf: 'center',
                    marginTop: 10,
                    width: '75%',
                }} />
            <Button title='Forgot password?' type='clear' onPress={() => { navigation.push('ForgotPasswordScreen') }}
                style={{ marginTop: 10 }} />
        </SafeAreaView>
    );
}

export default SignInScreen;