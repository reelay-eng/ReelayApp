import React, { useContext, useState } from 'react';
import { View, SafeAreaView } from 'react-native';

import { Auth } from 'aws-amplify';
import { showErrorToast } from '../components/utils/toasts';
import { AuthContext } from '../context/AuthContext';

import { AuthButton, AuthInput, AuthHeaderLeft, AuthHeaderView } from '../components/utils/AuthComponents';
import BackButton from '../components/utils/BackButton';

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
            <AuthHeaderView>
                <BackButton navigation={navigation} />
                <AuthHeaderLeft>{'Forgot Password'}</AuthHeaderLeft>
            </AuthHeaderView>
            <View>
                <AuthInput 
                    autoCapitalize='none'
                    placeholder={'Enter username'} 
                    onChangeText={(text) => {
                        setUsername(text);
                    }}
                    rightIcon={{type: 'ionicon', name: 'mail-outline'}}
                />
                <AuthButton title='Send me a reset link' type='solid' onPress={sendForgotPasswordEmail}
                    buttonStyle={{backgroundColor: '#db1f2e'}} />
            </View>
        </SafeAreaView>
    );
}