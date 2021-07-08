import React from 'react';
import { SafeAreaView } from 'react-native';
import { Button, Text } from 'react-native-elements';

import { AuthStyles } from '../styles';

export default ForgotPasswordAffirmScreen = ({ navigation }) => {
    
    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <Text h3 style={AuthStyles.headerTextCentered}>{'Password successfully reset!'}</Text>
            <Button title="Return to Sign In" type='solid' 
                onPress={() => {
                    navigation.popToTop();
                    navigation.push('SignInScreen');
                }}
                style={AuthStyles.submitButton} />
        </SafeAreaView>
    );
}