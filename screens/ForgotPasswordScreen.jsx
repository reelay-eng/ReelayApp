import React, { useContext, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';

import { Auth } from 'aws-amplify';
import { AuthStyles } from '../styles';
import { showErrorToast } from '../components/utils/toasts';
import { AuthContext } from '../context/AuthContext';

export default ForgotPasswordScreen = ({ navigation }) => {

    const authContext = useContext(AuthContext);

    const [username, setUsername] = useState(true);
    const FORGOT_PW_EMAIL_ERROR_MESSAGE = 'Couldn\'t send forgot password email';

    const sendForgotPasswordEmail = async () => {
        console.log('Attempting to send forgot password email');
        Auth.forgotPassword(
            username
        ).then((result) => {
            console.log('Sent forgot password email');
            console.log(result);
            authContext.setUsername(username);
            navigation.push('ForgotPasswordSubmitScreen');
        }).catch((error) => {
            console.log(FORGOT_PW_EMAIL_ERROR_MESSAGE);
            console.log(error);
            showErrorToast(FORGOT_PW_EMAIL_ERROR_MESSAGE);
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
                    style={AuthStyles.headerText}>{'Forgot Password'}</Text>
            </View>
            <View>
                <Input 
                    autoCapitalize='none'
                    placeholder={'Enter username'} 
                    onChangeText={(text) => {
                        setUsername(text);
                    }}
                    rightIcon={{type: 'ionicon', name: 'mail-outline'}}
                    style={AuthStyles.input}
                />
                <Button title='Send me a reset link' type='solid' onPress={sendForgotPasswordEmail}
                    style={AuthStyles.submitButton} />
            </View>
        </SafeAreaView>
    );
}