import React, { useContext, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Text } from 'react-native-elements';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../../components/utils/toasts';

import { AuthButton, AuthInput, AuthHeaderView, AuthHeaderLeft } from '../../components/utils/AuthComponents';
import BackButton from '../../components/utils/BackButton';

export default ConfirmEmailScreen = ({ navigation }) => {

    const authContext = useContext(AuthContext);
    const [confirmationCode, setConfirmationCode] = useState('');

    const CONFIRM_ERROR_MESSAGE = 'Could not confirm email address';
    const RESEND_ERROR_MESSAGE = 'Could not resend confirmation code';

    const confirmEmail = async () => {
        console.log('Attempting email confirmation');
        await Auth.confirmSignUp(
            authContext.username, 
            confirmationCode
        ).then((result) => {
            console.log('Email confirmed');
            console.log(result);
            navigation.pop();
            navigation.push('SignInScreen');
        }).catch((error) => {
            console.log(CONFIRM_ERROR_MESSAGE);
            console.log(error);
            showErrorToast(CONFIRM_ERROR_MESSAGE);
        });
    }

    const resendConfirmationCode = async () => {
        console.log('Attempting to resend confirmation code');
        await Auth.resendConfirmationCode(
            authContext.username
        ).then((result) => {
            console.log('Confirmation code resent');
            navigation.pop();
            navigation.push('SignInScreen');
        }).catch((error) => {
            console.log(RESEND_ERROR_MESSAGE);
            console.log(error);
            showErrorToast(RESEND_ERROR_MESSAGE);
        });
    }

    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <AuthHeaderView>
                <BackButton navigation={navigation} />
                <AuthHeaderLeft>{'Check your email'}</AuthHeaderLeft>
            </AuthHeaderView>
            <Text h4 style={{
                color: 'white',
                fontFamily: 'System',
                flex: 0.1, 
                justifyContent: 'center'
                }}>{'We\'ve sent you a confirmation code'}</Text>
            <AuthInput 
                autoCapitalize='none'
                placeholder={'Enter confirmation code'} 
                onChangeText={(text) => {
                    setConfirmationCode(text);
                }}
                rightIcon={{type: 'ionicon', name: 'mail-outline'}}
            />
            <AuthButton title='Continue' type='solid' onPress={confirmEmail}
                buttonStyle={{backgroundColor: '#db1f2e'}} />
            <AuthButton title='Resend confirmation code' type='clear' onPress={resendConfirmationCode}
                titleStyle={{color: '#db1f2e'}} />
        </SafeAreaView>
    );
}