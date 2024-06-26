import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, TextInput, TouchableOpacity, SafeAreaView, View, KeyboardAvoidingView, Pressable, Keyboard, ScrollView } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import { reportIssue } from '../../api/ReelayDBApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { useSelector } from 'react-redux';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import ReelayColors from '../../constants/ReelayColors';
import { Icon } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { validate } from 'validate.js';
import constraints from '../../components/utils/EmailValidationConstraints';
import { HeaderWithBackButton } from '../../components/global/Headers';

const { width } = Dimensions.get('window');

const ClearEmailButtonBox = styled(TouchableOpacity)`
    align-items: center;
    height: 100%;
    justify-content: center;
    position: absolute;
    margin-top: 6px;
    right: 8px;
`
const EmailTextInput = styled(TextInput)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 14px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-left: 8px;
    padding: 4px;
    width: 100%;
`
const EmailTextInputBox = styled(View)`
    background-color: #1a1a1a;
    border-color: white;
    border-radius: 8px;
    border-width: 1px;
    flex-direction: row;
    padding-top: 6px;
    padding-left: 6px;
    padding-bottom: 6px;
    width: ${width - 64}px;
`
const InputLabelBox = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-top: 8px;
    margin-bottom: 8px;
`
const InputLabelText = styled(ReelayText.CaptionEmphasized)`
    color: white;
`
const IssueTextInput = styled(TextInput)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 14px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin: 8px;
    padding: 4px;
    width: 100%;
`
const IssueTextInputBox = styled(View)`
    background-color: #1a1a1a;
    border-color: white;
    border-radius: 8px;
    border-width: 1px;
    flex-direction: row;
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 6px;
    padding-bottom: 6px;
    height: 200px;
    width: ${width - 64}px;
`
const FullscreenBox = styled(Pressable)`
    align-items: center;
    background-color: black;
    height: 100%;
    padding-top: ${props => props.topOffset + 20}px;
    width: 100%;
`
const LeaveBlankText = styled(ReelayText.Body2)`
    color: gray;
    margin-top: 8px;
`
const SendButtonBox = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 12px;
    flex-direction: row;
    height: 48px;
    justify-content: center;
    width: ${width - 64}px;
`
const SendButtonText = styled(ReelayText.Body2)`
    color: white;
    margin-left: 6px;
`
const Spacer = styled(View)`
    height: 20px;
`

export default ReportIssueScreen = ({ navigation, route }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const { viewedContent, viewedContentType } = route?.params;
    const emailTextRef = useRef(reelayDBUser?.email);
    const emailValidRef = useRef(!!reelayDBUser?.email);
    const issueTextRef = useRef('');
    const topOffset = useSafeAreaInsets().top;

    const EmailInput = () => {
        const [emailText, setEmailText] = useState(reelayDBUser?.email);
        const changeEmailText = (newEmailText) => {
            setEmailText(newEmailText);
            emailTextRef.current = newEmailText;
        }

        const emailInvalid = validate({ emailAddress: emailText }, constraints);
        emailValidRef.current = (emailText?.length > 0 && !emailInvalid);

        const ClearEmailButton = () => {
            const clearEmail = () => changeEmailText('');
            const invisible = (emailText?.length === 0);
            if (invisible) return <View />;
            
            return (
                <ClearEmailButtonBox onPress={clearEmail}>
                    <Icon type='ionicon' name='close' color='white' size={20} />
                </ClearEmailButtonBox>
            );
        }

        return (
            <View>
                <InputLabelBox>
                    <InputLabelText>{'Email'}</InputLabelText>
                </InputLabelBox>
                <EmailTextInputBox>
                    <EmailTextInput 
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        onChangeText={changeEmailText}
                        leftIcon={{
                            type: 'ionicon',
                            name: 'mail-outline',
                            color: 'white',
                        }}
                        textContentType='emailAddress'
                        value={emailText}
                    />
                    <ClearEmailButton />
                </EmailTextInputBox>
            </View>
        );
    }

    const LeaveBlank = () => {
        return <View>
            <LeaveBlankText>{`Leave blank if you don't want us to contact you`}</LeaveBlankText>
        </View>;
    }

    const IssueInput = () => {
        const [issueText, setIssueText] = useState('');
        const changeIssueText = (newIssueText) => {
            setIssueText(newIssueText);
            issueTextRef.current = newIssueText;
        }
        const MAX_CHAR_COUNT = 1000;

        return (
            <View>
                <InputLabelBox>
                    <InputLabelText>{`Tell us about the issue`}</InputLabelText>
                </InputLabelBox>
                <IssueTextInputBox>
                    <IssueTextInput
                        autoCapitalize="sentences"
                        keyboardType="default"
                        maxLength={MAX_CHAR_COUNT}
                        multiline
                        placeholder={'What are you experiencing?'}
                        placeholderTextColor='gray'
                        onChangeText={changeIssueText}
                        leftIcon={{
                            type: 'ionicon',
                            name: 'mail-outline',
                            color: 'white',
                        }}
                        value={issueText.current}
                    />
                </IssueTextInputBox>
            </View>
        );
    }

    const SendButton = () => {
        const [sent, setSent] = useState(false);
        const ERROR_MESSAGE = 'Ruh roh! Something went wrong. Try again, or email us directly at support@reelay.app';
        const MIN_ISSUE_CHAR_COUNT = 10;

        const onPress = async () => {
            try {
                if (issueTextRef.current?.length < MIN_ISSUE_CHAR_COUNT) {
                    showErrorToast('Ruh roh! This message too short');
                    return;
                }

                if (issueTextRef.current?.length < MIN_ISSUE_CHAR_COUNT) {
                    showErrorToast('Ruh roh! Max message length is 1000 chars');
                    return;
                }

                setSent(true);
                const reportResult = await reportIssue({
                    authSession,
                    email: emailTextRef.current,
                    issueText: issueTextRef.current,
                    reqUserSub: reelayDBUser?.sub,
                    reqUsername: reelayDBUser?.username,
                    viewedContent,
                    viewedContentType,
                });    
                if (reportResult && !reportResult?.error) {
                    showMessageToast('Issue reported -- thanks for the feedback');
                } else {
                    console.log('report result: ', reportResult);
                    showErrorToast(ERROR_MESSAGE);
                }
            } catch (error) {
                console.log(error);
                showErrorToast(ERROR_MESSAGE);
            }
        }    

        return (
            <SendButtonBox disable={sent} onPress={onPress}>
                <Icon type='ionicon' name='mail-outline' color='white' size={18} /> 
                <SendButtonText>{'Submit'}</SendButtonText>
            </SendButtonBox>
        );
    }

    return (
        <FullscreenBox onPress={Keyboard.dismiss} topOffset={topOffset}>
            <HeaderWithBackButton navigation={navigation} text={'report an issue'} />
            <Spacer />
            <ScrollView showsVerticalScrollIndicator={false}>
                <KeyboardAvoidingView behavior="padding" style={{ alignItems: 'center', width: '100%'}}>
                    <EmailInput />
                    <LeaveBlank />
                    <Spacer />
                    <IssueInput />
                    <Spacer />
                    <SendButton />
                </KeyboardAvoidingView>
            </ScrollView>
        </FullscreenBox>
    );
}