import React, { createRef, useState } from 'react';
import { SafeAreaView } from 'react-native';

import { AuthButton, AuthHeaderCenter, AuthInput } from '../components/utils/AuthComponents';

export default SignUpEmailScreen = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const emailInput = createRef();

    emailInput.current?.setNativeProps({
        autoCorrect: false,
    });

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
                onPress={() => { 
                    navigation.push('SignUpScreen', { email });
                }} 
                buttonStyle={{backgroundColor: '#b83636'}} 
            />
            <AuthButton title='Login' type='clear' 
                onPress={() => { 
                    navigation.push('SignInScreen');
                }}
                titleStyle={{color: '#b83636'}}
            />
        </SafeAreaView>
    );
}