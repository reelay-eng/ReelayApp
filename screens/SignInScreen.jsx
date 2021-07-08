import React, { useContext, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';
import { AuthStyles } from '../styles';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../context/AuthContext';
import { showErrorToast } from '../components/utils/toasts';

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
        }).catch((error) => {
            console.log('Couldn\'t sign in user');
            console.log(error);
            showErrorToast(SIGN_IN_ERROR_MESSAGE);
        });
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
                placeholder={'Enter username'} 
                onChangeText={(text) => {
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