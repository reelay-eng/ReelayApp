import React, { useContext, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';
import { AuthStyles, TextStyles } from '../styles';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../context/AuthContext';
import { showErrorToast } from '../components/utils/toasts';

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
            <View 
                style={AuthStyles.headerView}>
                <Icon type='ionicon' name='chevron-back-outline' color={'white'} size={30} 
                    onPress={() => { navigation.pop() }}
                    style={AuthStyles.backButton}/>
                <Text h3 style={AuthStyles.headerText}>{'Check your email'}</Text>
            </View>
            <Text h4 style={{
                ...AuthStyles.headerText, 
                flex: 0.1, 
                justifyContent: 'flex-start'
                }}>{'We\'ve sent you a confirmation code'}</Text>
            <Input 
                autoCapitalize='none'
                placeholder={'Enter confirmation code'} 
                onChangeText={(text) => {
                    setConfirmationCode(text);
                }}
                rightIcon={{type: 'ionicon', name: 'mail-outline'}}
                style={AuthStyles.input}
            />
            <Button title='Continue' type='solid' onPress={confirmEmail}
                style={AuthStyles.submitButton} />
            <Button title='Resend confirmation code' type='clear' onPress={resendConfirmationCode}
                style={AuthStyles.clearButton} />
        </SafeAreaView>
    );
}