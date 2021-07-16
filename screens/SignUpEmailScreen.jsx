import React, { createRef, useContext, useState, useRef } from 'react';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';
import { AuthStyles, TextStyles } from '../styles';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../context/AuthContext';

export default SignUpEmailScreen = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const emailInput = createRef();

    emailInput.current?.setNativeProps({
        autoCorrect: false,
    });

    const authContext = useContext(AuthContext);

    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
        }}>
            <View style={AuthStyles.headerView}>
                <Icon type='ionicon' name='chevron-back-outline' color={'white'} size={30} 
                    onPress={() => { navigation.pop() }}
                    style={AuthStyles.backButton}/>
                <Text h3 style={AuthStyles.headerText}>{'Enter your email address'}</Text>
            </View>

            <Input
                ref={emailInput}
                autoCapitalize='none'
                placeholder={'Email'} 
                onChangeText={(text) => {
                    setEmail(text);
                }}
                rightIcon={{type: 'ionicon', name: 'mail-outline'}}
                style={{
                    ...AuthStyles.input,
                }}
            />

            <Button title='Continue' type='solid' onPress={() => { 
                navigation.push('SignUpScreen', { email });
            }} style={AuthStyles.submitButton} />

            <Button title='Login' type='clear' onPress={() => { 
                navigation.push('SignInScreen');
            }} style={AuthStyles.clearButton} />


        </SafeAreaView>
    );
}