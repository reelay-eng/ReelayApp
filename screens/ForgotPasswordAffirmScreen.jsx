import React from 'react';
import { SafeAreaView } from 'react-native';

import { AuthButton, AuthHeaderCenter } from '../components/utils/AuthComponents';

export default ForgotPasswordAffirmScreen = ({ navigation }) => {
    
    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <AuthHeaderCenter>{'Password successfully reset!'}</AuthHeaderCenter>
            <AuthButton title="Return to Sign In" type='solid' 
                onPress={() => {
                    navigation.popToTop();
                    navigation.push('SignInScreen');
                }}
                buttonStyle={{backgroundColor: '#b83636'}} />
        </SafeAreaView>
    );
}