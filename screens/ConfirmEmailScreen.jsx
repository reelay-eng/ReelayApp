import React, { useContext, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';
import { AuthStyles, TextStyles } from '../styles';

import { AuthContext } from '../context/AuthContext';

import { reelayConfirmEmail, reelayResendConfirmationCode } from '../api/ReelayAuthApi';

const ConfirmEmailScreen = ({ navigation, username }) => {

    const authContext = useContext(AuthContext);
    const [confirmationCode, setConfirmationCode] = useState('');

    const confirmEmail = async () => {
        console.log('Attempting email confirmation');
        const confirmEmailResult = reelayConfirmEmail({
            username: authContext.username,
            confirmationCode: confirmationCode,
        }).catch((error) => {
            console.log('Could not confirm email address');
            console.log(error);
        });

        // todo: make a toast message
        if (confirmEmailResult) {
            console.log('Email confirmed');
            navigation.pop();
            navigation.push('SignInScreen');    
        }
    }

    const resendConfirmationCode = async () => {
        console.log('Attempting to resend confirmation code');
        const resendConfirmationResult = await reelayResendConfirmationCode({
            username: username,
        }).then((result) => {
            console.log('Confirmation code resent');
            navigation.pop();
            navigation.push('SignInScreen');
        }).catch((error) => {
            console.log('Could not resend confirmation code');
            console.log(error);
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
            <Button title='Resend confirmation code' type='clear' onPress={() => { resendConfirmationCode }}
                style={AuthStyles.clearButton} />
        </SafeAreaView>
    );
}

export default ConfirmEmailScreen;