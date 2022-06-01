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
import BackButton from '../../components/utils/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const EmailTextInput = styled(TextInput)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 16px;
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
    padding-left: 16px;
    padding-bottom: 16px;
    margin-bottom: 16px;
    width: ${width - 64}px;
`
const HeaderBox = styled(View)`
    align-items: center;
    flex-direction: row;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 24px;
    width: 100%;
`
const HeaderText = styled(ReelayText.H6)`
    color: white;
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
    font-size: 16px;
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
    padding-left: 16px;
    padding-bottom: 16px;
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
const SendButtonText = styled(ReelayText.Body1)`
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
    const emailTextRef = useRef(reelayDBUser?.email)
    const issueTextRef = useRef('');
    const topOffset = useSafeAreaInsets().top;

    const EmailInput = () => {
        const [emailText, setEmailText] = useState(reelayDBUser?.email);
        const changeEmailText = (newEmailText) => {
            setEmailText(newEmailText);
            emailTextRef.current = newEmailText;
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
                        value={emailText.current}
                    />
                </EmailTextInputBox>
            </View>
        );
    }

    const Header = () => {
        return (
            <HeaderBox>
                <BackButton navigation={navigation} />
                <HeaderText>{'Report an issue'}</HeaderText>
            </HeaderBox>
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

        return (
            <View>
                <InputLabelBox>
                    <InputLabelText>{`What's up?`}</InputLabelText>
                </InputLabelBox>
                <IssueTextInputBox>
                    <IssueTextInput
                        autoCapitalize="sentences"
                        keyboardType="default"
                        multiline
                        placeholder={"Tell us about the issue"}
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

        const onPress = async () => {
            try {
                setSent(true);
                const reportResult = await reportIssue({
                    authSession,
                    email,
                    issueText: issueText.current,
                    reportingUserSub: reelayDBUser?.sub,
                    viewedContent,
                    viewedContentType,
                });    
                if (reportResult?.success) {
                    showMessageToast('Issue reported -- thanks for the feedback');
                } else {
                    showErrorToast(ERROR_MESSAGE);
                }
            } catch(error) {
                showErrorToast(ERROR_MESSAGE);
            }
        }    

        return (
            <SendButtonBox disabled={sent} onPress={onPress}>
                <Icon type='ionicon' name='mail-outline' color='white' size={24} /> 
                <SendButtonText>{'Submit'}</SendButtonText>
            </SendButtonBox>
        );
    }

    return (
        <FullscreenBox onPress={Keyboard.dismiss} topOffset={topOffset}>
            <Header />
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