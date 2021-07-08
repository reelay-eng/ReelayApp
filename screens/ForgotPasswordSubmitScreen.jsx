import React, { useContext, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';

import { Auth } from 'aws-amplify';
import { AuthStyles } from '../styles';
import { AuthContext } from '../context/AuthContext';
import { showMessageToast, showErrorToast } from '../components/utils/toasts';

export default ForgotPasswordSubmitScreen = ({ navigation }) => {

    const authContext = useContext(AuthContext);

    const [confirmationCode, setConfirmationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const RESEND_FORGOT_PW_EMAIL_MESSAGE = 'Check your email for another confirmation code'
    const FORGOT_PW_EMAIL_ERROR_MESSAGE = 'Couldn\'t resend forgot password email';
    const FORGOT_PW_SUBMIT_ERROR_MESSAGE = 'Could not reset password. Check or resend confirmation code to try again.';

    const passwordsMatch = () => (newPassword == confirmNewPassword);

    const forgotPasswordSubmit = async () => {
        console.log('Attempting to reset password');
        await Auth.forgotPasswordSubmit(
            authContext.username,
            confirmationCode,
            newPassword
        ).then((result) => {
            console.log('Reset password successfully');
            console.log(result);
            navigation.push('ForgotPasswordAffirmScreen');
        }).catch((error) => {
            console.log(FORGOT_PW_SUBMIT_ERROR_MESSAGE);
            console.log(error);
            showErrorToast(FORGOT_PW_SUBMIT_ERROR_MESSAGE);
        });
    }

    const resendForgotPasswordEmail = async () => {
        console.log('Attempting to resend forgot password email');
        Auth.forgotPassword(
            authContext.username
        ).then((result) => {
            console.log('Resent forgot password email');
            console.log(result);
            showMessageToast(RESEND_FORGOT_PW_EMAIL_MESSAGE);
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
                    style={AuthStyles.headerText}>{'Reset your password'}</Text>
            </View>
            <View>
                <Input 
                    placeholder={'Enter confirmation code'} 
                    onChangeText={(code) => setConfirmationCode(code)}
                    style={AuthStyles.input}
                />
                <Input 
                    placeholder={'Enter new password'} 
                    onChangeText={(password) => setNewPassword(password)}
                    rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                    secureTextEntry={true}
                    style={AuthStyles.input}
                />
                <Input 
                    placeholder={'Confirm new password'} 
                    onChangeText={(password) => setConfirmNewPassword(password)}
                    rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                    secureTextEntry={true}
                    style={AuthStyles.input}
                />

                { !passwordsMatch() && <Text style={{
                        alignSelf: 'center',
                        color: 'white',
                        fontFamily: 'System',
                    }}>{"Passwords don't match!"}</Text> }
                
                <Button title='Reset password' type='solid' disabled={!passwordsMatch()}
                    onPress={forgotPasswordSubmit}
                    style={AuthStyles.submitButton} />

                <Button title="Didn't receive a code? Let's try again." type='clear' 
                    onPress={resendForgotPasswordEmail}
                    style={AuthStyles.submitButton} />
            </View>
        </SafeAreaView>
    );

}