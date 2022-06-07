import React, { useContext, useRef, useState } from 'react';
import { 
    ActivityIndicator,
    Dimensions,
    Keyboard, 
    SafeAreaView, 
    TextInput, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    View,
} from 'react-native';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { postAnnouncement } from '../../api/ReelayDBApi';
import Constants from 'expo-constants';
import moment from 'moment';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

const { width } = Dimensions.get('window');

const ExplainerContainer = styled(View)`
    align-items: flex-start;
    justify-content: center;
    margin-top: 10px;
    width: 100%;
`
const ExplainerText = styled(ReelayText.Body2)`
    color: white;
`
// color is ReelayColors.reelayGreen at reduced opacity
const PinAnnouncementButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${(props) => props.disabled 
        ? 'white' 
        : ReelayColors.reelayBlue
    };
    border-radius: 40px;
    justify-content: center;
    height: 40px;
    width: ${width - 56}px;
`
const PinScreenContainer = styled(SafeAreaView)`
    background-color: black;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 10px;
    margin-bottom: 16px;
`
const HeaderText = styled(ReelayText.H6Emphasized)`
    color: white;
    margin-left: 20px;
    margin-top: 4px;
`
const TitleInputField = styled(TextInput)`
    border-color: white;
    border-radius: 4px;
    border-width: 1px;
    color: white;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-top: 6px;
    padding: 12px;
`
const SectionContainer = styled(View)`
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 16px;
    margin-bottom: 8px;
`
const SectionContainerBottom = styled(SectionContainer)`
    align-items: center;
    bottom: 20px;
`
const TitleText = styled(ReelayText.Subtitle2)`
    color: ${(props) => props.disabled ? 'black' : 'white'};
    font-size: 16px;
`
const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 12;

export default function PinAnnouncementScreen({ navigation, route }) {
    const { reelayDBUser } = useContext(AuthContext);

    const reelay = route?.params?.reelay;
    const authSession = useSelector(state => state.authSession);

    const dispatch = useDispatch();
    const titleFieldRef = useRef(null);
    const titleTextRef = useRef('');

    const changeTitleText = (text) => titleTextRef.current = text;
    const focusTitle = () => titleFieldRef?.current && titleFieldRef.current.focus();

    const PinAnnouncementButton = () => {
        const [publishing, setPublishing] = useState(false);

        const onPress = async () => {
            if (publishing) return;
            setPublishing(true);
            const titleText = titleTextRef.current;

            if (titleText.length < TITLE_MIN_LENGTH) {
                showErrorToast('Could not pin announcement: title is too short');
                setPublishing(false);
                return;
            }

            const expiryAt = moment().add(7, 'days');
            const publishResult = await postAnnouncement({
                authSession,
                reqUserSub: reelayDBUser?.sub,
                postBody: {
                    expiryAt, 
                    optionsJSON: JSON.stringify({}),
                    reelaySub: reelay.sub,
                    title: titleTextRef.current,
                    visibility: FEED_VISIBILITY,
                }
            });

            if (!publishResult || publishResult?.error) {
                showErrorToast('Something went wrong! Could not pin announcement');
                setPublishing(false);
            } else {
                showMessageToast('Announcement pinned!');
                navigation.pop();
            }
            return publishResult;
        };

        return (
            <PinAnnouncementButtonContainer onPress={onPress}>
                { publishing && <ActivityIndicator/> }
                { !publishing && <TitleText>{'Pin announcement'}</TitleText> }
            </PinAnnouncementButtonContainer>
        );
    }

    const Explainer = () => {
        return (
            <ExplainerContainer>
                <ExplainerText>{'Place this reelay on top of the feed, and linked on the home screen for 7 days or until you unpin'}</ExplainerText>
            </ExplainerContainer>
        ); 
    }

    const Header = () => {
        return (
            <HeaderContainer>
                <BackButton navigation={navigation} />
                <HeaderText>{'Pin announcement'}</HeaderText>
            </HeaderContainer>
        );
    }

    const TitleInput = () => {
        return (
            <SectionContainer>
                <TitleText>{'Title'}</TitleText>
                <TouchableWithoutFeedback onPress={focusTitle}>
                    <TitleInputField 
                        ref={titleFieldRef}
                        blurOnSubmit={true}
                        maxLength={TITLE_MAX_LENGTH}
                        multiline
                        numberOfLines={2}
                        defaultValue={titleTextRef.current}
                        placeholder={"What's new"}
                        placeholderTextColor={'rgba(255,255,255,0.6)'}
                        onChangeText={changeTitleText}
                        onSubmitEditing={Keyboard.dismiss}
                        onPressOut={Keyboard.dismiss}
                        returnKeyLabel="done"
                        returnKeyType="done"
                    />
                </TouchableWithoutFeedback>   
                <Explainer />
            </SectionContainer> 
        );
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
        return () => {
            dispatch({ type: 'setTabBarVisible', payload: true });
        }
    });

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <PinScreenContainer>
                <View style={{ display: 'flex' }}>
                    <Header />
                    <TitleInput />
                </View>
                <SectionContainerBottom>
                    <PinAnnouncementButton />
                </SectionContainerBottom>
            </PinScreenContainer>
        </TouchableWithoutFeedback>
    );
};