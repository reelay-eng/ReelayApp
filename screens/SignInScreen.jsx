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
                style={AuthStyles.headerView}>
                <Icon type='ionicon' name='chevron-back-outline' color={'white'} size={30} 
                    onPress={() => { navigation.pop() }}
                    style={AuthStyles.backButton}/>
                <Text h3 
                    style={AuthStyles.headerText}>{'Sign In to Reelay'}</Text>
            </View>
            <Input 
                placeholder={'Username or email'} 
                onChangeText={(text) => {
                    setEmail(text);
                    setUsername(text);
                }}
                rightIcon={{type: 'ionicon', name: 'mail-outline'}}
                style={AuthStyles.input}
            />
            <Input 
                placeholder={'Enter password'} 
                onChangeText={(password) => setPassword(password)}
                rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                secureTextEntry={true}
                style={AuthStyles.input}
            />
            <Button title='Continue' type='solid' onPress={signInUser}
                style={AuthStyles.submitButton} />
            <Button title='Forgot password?' type='clear' onPress={() => { navigation.push('ForgotPasswordScreen') }}
                style={AuthStyles.clearButton} />
        </SafeAreaView>
    );
}

export default SignInScreen;