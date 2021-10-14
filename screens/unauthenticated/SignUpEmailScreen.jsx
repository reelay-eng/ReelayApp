import React, { createRef, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { validate } from 'validate.js';
import constraints from '../../components/utils/EmailValidationConstraints';

import { AuthButton, AuthHeaderCenter, AuthInput } from '../../components/utils/AuthComponents';
import { showErrorToast } from '../../components/utils/toasts';

import * as Amplitude from 'expo-analytics-amplitude';

export default SignUpEmailScreen = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const emailInput = createRef();

    emailInput.current?.setNativeProps({
        autoCorrect: false,
    });

    const continueToSignUp = async () => {
        // validate result is undef if there are no errors
        const errors = validate({ emailAddress: email }, constraints);
        if (!errors) {
            navigation.push('SignUpScreen', { email });
            Amplitude.logEventWithPropertiesAsync('signUpStarted', {
                email: email,
            });
        } else {
            if (errors.emailAddress && errors.emailAddress[0]) {
                showErrorToast(errors.emailAddress[0], false);
            }
        }
    }

    // todo: there's no checking for valid email on this page

    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <AuthHeaderCenter>{'Join Reelay'}</AuthHeaderCenter>
            <AuthInput
                ref={emailInput}
                autoCapitalize='none'
                placeholder={'Email'} 
                onChangeText={(text) => {
                    setEmail(text);
                }}
                rightIcon={{type: 'ionicon', name: 'mail-outline'}}
            />
            <AuthButton title='Continue' type='solid' 
                onPress={continueToSignUp} 
                buttonStyle={{backgroundColor: '#db1f2e'}} 
            />
            <AuthButton title='Login' type='clear' 
                onPress={() => { 
                    navigation.push('SignInScreen');
                }}
                titleStyle={{color: '#db1f2e'}}
            />
        </SafeAreaView>
    );
}