import React, { createRef, useContext, useState, useRef } from 'react';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, SocialIcon, Text } from 'react-native-elements';
import { AuthStyles, TextStyles } from '../styles';

import Amplify, { Auth, Hub } from 'aws-amplify';
import { AuthContext } from '../context/AuthContext';

export default PreSignUpSSOScreen = ({ navigation }) => {
    
    const authContext = useContext(AuthContext);

    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <Text h3 style={AuthStyles.headerTextCentered}>{'Join Reelay'}</Text>
            <View style={{ height: '40%' }} />

            <SocialIcon title='Continue with email' 
                button type='envelope' light
                style={{
                    marginTop: 20,
                    width: '80%',
                    alignSelf: 'center',
                }}
                onPress={() => { navigation.push('SignUpEmailScreen') }}
            />
            <SocialIcon title='Continue with Apple ID' 
                button type='apple' light
                style={{
                    marginTop: 20,
                    width: '80%',
                    alignSelf: 'center',
                }}
            />
            <SocialIcon title='Continue with Google' 
                button type='google' light
                onPress={() => { Auth.federatedSignIn({provider: 'Google'}) }}
                style={{
                    marginTop: 20,
                    width: '80%',
                    alignSelf: 'center',
                }}
            />

        </SafeAreaView>
    );
}