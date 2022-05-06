import React, { useState, useRef, useContext, useCallback } from 'react';
import { Dimensions, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';

import BackButton from '../../components/utils/BackButton';
import { AuthContext } from '../../context/AuthContext';

import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';

import { showMessageToast } from '../../components/utils/toasts';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import ReelayColors from '../../constants/ReelayColors';
import { useDispatch, useSelector } from 'react-redux';

import ClubPicture from '../../components/global/ClubPicture';
import InviteMyFollowsList from '../../components/clubs/InviteMyFollowsList';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addMemberToClub } from '../../api/ClubsApi';

const { width } = Dimensions.get('window');

const ImageContainer = styled(View)`
    flex-direction: row;
    align-items: center;
    margin-right: 20px;
`
const InviteScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const SendIconPressable = styled(Pressable)`
    align-items: center;
    border-radius: 16px;
    justify-content: center;
    margin-left: 10px;
    height: 48px;
    width: 48px;
`
const SkipButton = styled(TouchableOpacity)`
    align-items: center;
    padding: 16px;
    padding-bottom: 0px;
`
const SkipAndSendRowContainer = styled(View)`
    align-items: flex-start;
    background-color: black;
    bottom: ${(props) => props.bottomOffset}px;
    flex-direction: row;
    justify-content: space-around;
    position: absolute;
    width: 100%;
`
const SkipText = styled(ReelayText.Subtitle2)`
    color: white;
`
const TitleLineContainer = styled(View)`
    flex: 1;
    justify-content: center;
    align-items: flex-start;
`;
const TitleHeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 10px;
    margin-bottom: 10px;
`
const TitleText = styled(ReelayText.Subtitle1)`
    color: white
`
const YearText = styled(ReelayText.Subtitle2)`
    color: gray
`

const TitleHeader = ({ navigation, club, readyToSend, sendRecs }) => {
    return (
        <React.Fragment>
            <TitleHeaderContainer>
                <ImageContainer>
                    <ClubPicture club={club} size={48} />
                </ImageContainer>
                <TitleLineContainer>
                    <TitleText>{club.name}</TitleText>
                    <YearText>{club.description}</YearText>
                </TitleLineContainer>
                <SendIconPressable onPress={sendRecs} readyToSend={readyToSend}>
                    <Icon type='ionicon' name='paper-plane' size={24} color={(readyToSend) ? ReelayColors.reelayBlue : 'white'} />
                </SendIconPressable>
            </TitleHeaderContainer>
        </React.Fragment>
    )
}

const SkipButtonRow = ({ club, navigation, sendRecs }) => {
    const bottomOffset = useSafeAreaInsets().bottom;
    const advanceToClubActivityScreen = () => navigation.push('ClubActivityScreen', { club });
    // todo: secret achievement earned: created a diary
    return (
        <SkipAndSendRowContainer bottomOffset={bottomOffset}>
            <SkipButton onPress={advanceToClubActivityScreen}>
                <SkipText>{'Send invites later'}</SkipText>
            </SkipButton>
        </SkipAndSendRowContainer>
    );
}

export default ClubInviteMembersScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const { club } = route.params; // note: reelay can be null

    const followsToSend = useRef([]);
    const [readyToSend, setReadyToSend] = useState(followsToSend.current > 0);
    const getFollowsToSend = useCallback(() => followsToSend.current, []);
    const markFollowToSend = useCallback((followObj) => {
        followsToSend.current.push(followObj);
        if (!readyToSend) {
            setReadyToSend(true);
        }
        return true;
    }, []);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const unmarkFollowToSend = useCallback((followObj) => {
        followsToSend.current = followsToSend.current.filter((nextFollowObj) => {
            return followObj.followSub !== nextFollowObj.followSub;
        });
        if (!followsToSend.current.length) {
            setReadyToSend(false);
        }
        return false; // isMarked
    }, []);

    const sendRecs = async () => {
        console.log('sending rec!');
        const sendRecResults = await Promise.all(followsToSend.current.map(async (followObj) => {
            const addMemberResult = await addMemberToClub({
                clubID: club.id,
                userSub: followObj.followSub,
                username: followObj.followName,
                role: 'member',
                invitedBySub: reelayDBUser?.sub,
                invitedByUsername: reelayDBUser?.username,
                inviteLinkID: null,
            });
            console.log('club invite result: ', addMemberResult);
        }));

        showMessageToast(`${sendRecResults.length} people added to ${club.name}`);
        navigation.push('ClubActivityScreen', { club });
    }

    return (
		<InviteScreenContainer>
            <TitleHeader 
                navigation={navigation} 
                club={club}
                readyToSend={readyToSend}
                sendRecs={sendRecs}
            />
            <InviteMyFollowsList 
                navigation={navigation}
                getFollowsToSend={getFollowsToSend}
                markFollowToSend={markFollowToSend}
                unmarkFollowToSend={unmarkFollowToSend}
            />
            <SkipButtonRow club={club} navigation={navigation} />
        </InviteScreenContainer>
    );
}
