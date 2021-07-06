import React, { useContext, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';
import { AuthStyles } from '../styles';

import { AuthContext } from '../context/AuthContext';
import { reelaySignIn } from '../api/ReelayAuthApi';

const SignInScreen = ({ navigation }) => {

    const authContext = useContext(AuthContext);

    const [username, setUsername] = useState(true);
    const [email, setEmail] = useState(true);
    const [password, setPassword] = useState(true);

    const signInUser = async () => {
        console.log('Attempting user sign in');
        const user = await reelaySignIn({
            username: username,
            password: password,
            attributes: {
                email: email,
            },
        });

        // set state with returned user info
        if (user) {
            authContext.setUser(user);
            authContext.setSignedIn(true);    
        }
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
                autoCapitalize='none'
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