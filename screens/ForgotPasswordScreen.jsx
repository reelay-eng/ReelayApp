import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, SafeAreaView } from 'react-native';
import { Button, Input, Icon, Text } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { AuthStyles } from '../styles';

const ForgotPasswordScreen = ({ navigation }) => {
    const [submitted, setSubmitted] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [username, setUsername] = useState(true);
    const [email, setEmail] = useState(true);

    const [confirmationCodeInput, setConfirmationCodeInput] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const STUB_CONFIRMATION_CODE = '123456';

    const passwordsMatch = () => (newPassword == confirmNewPassword);

    const renderSendConfirmationCode = () => {
        return (
            <View>
                <Input 
                    placeholder={'Username or email'} 
                    onChangeText={(text) => {
                        setEmail(text);
                        setUsername(text);
                    }}
                    rightIcon={{type: 'ionicon', name: 'mail-outline'}}
                    style={AuthStyles.input}
                />
                <Button title='Send Confirmation Code' type='solid' onPress={() => setSubmitted(true)}
                    style={AuthStyles.submitButton} />
            </View>
        );
    }

    const renderEnterConfirmationCode = () => {
        return (
            <View>
                <Input 
                    placeholder={'Enter confirmation code'} 
                    onChangeText={(code) => setConfirmationCodeInput(code)}
                    style={AuthStyles.input}
                />
                <Button title='Confirm' type='solid' onPress={() => { 
                    if (confirmationCodeInput == STUB_CONFIRMATION_CODE) {
                        setConfirmed(true);
                    }
                }}
                    style={AuthStyles.submitButton} />
                <Button title="Didn't receive a code? Let's try again." type='clear' onPress={() => { navigation.pop() }}
                    style={AuthStyles.submitButton} />
            </View>
        );
    }

    const renderResetPassword = () => {
        return (
            <View>
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
                    onPress={() => { 
                        navigation.popToTop(); 
                        navigation.push('SignInScreen'); 
                    }}
                    style={AuthStyles.submitButton} />
            </View>
        );
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
                    style={AuthStyles.headerText}>{'Forgot Password'}</Text>
            </View>
            { !submitted && renderSendConfirmationCode() }
            { submitted && !confirmed && renderEnterConfirmationCode() }
            { submitted && confirmed && renderResetPassword() }
        </SafeAreaView>
    );
}

export default ForgotPasswordScreen;