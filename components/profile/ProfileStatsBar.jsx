import React, { useContext } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';

import { logAmplitudeEventProd, firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../utils/EventLogger';
import * as ReelayText from '../../components/global/Text';

const BarContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
`
const StatContainer = styled(TouchableOpacity)`
    display: flex;
    flex: 1;
    align-items: center;
`
const DimensionText = styled(ReelayText.Subtitle2)`
    color: white;
`
const StatText = styled(ReelayText.Subtitle1)`
    color: white;
    font-size: 18px;
`

export default ProfileStatsBar = ({
    navigation,
    reelayCount,
    creator,
    followers,
    following,
}) => {
    try {
        firebaseCrashlyticsLog('Profile stats screen');
        const { reelayDBUser } = useContext(AuthContext);
        const dispatch = useDispatch();

        const showMeSignupIfGuest = () => {
            if (reelayDBUser?.username === 'be_our_guest') {
                dispatch({ type: 'setJustShowMeSignupVisible', payload: true })
                return true;
            }
            return false;
        }
        const viewFollows = ({ followType }) => {
            if (showMeSignupIfGuest()) return;
            navigation.push('UserFollowScreen', {
                creator: creator,
                initFollowType: followType,
                initFollowers: followers,
                initFollowing: following,
            });
        }

        const viewFollowers = () => {
            if (showMeSignupIfGuest()) return;
            viewFollows({ followType: 'Followers' });
            logAmplitudeEventProd('viewFollowers', {
                username: reelayDBUser.username,
                creatorName: creator.username,
            });
        }

        const viewFollowing = () => {
            if (showMeSignupIfGuest()) return;
            viewFollows({ followType: 'Following' });
            logAmplitudeEventProd('viewFollowing', {
                username: reelayDBUser.username,
                creatorName: creator.username,
            });
        }

        return (
            <BarContainer>
                <StatContainer>
                    <StatText>{reelayCount}</StatText>
                    <DimensionText>{"Reelays"}</DimensionText>
                </StatContainer>
                <View style={{ backgroundColor: "#fff", height: "80%", width: .5 }} />
                <StatContainer onPress={viewFollowers}>
                    <StatText>{followers ? followers.length : 0}</StatText>
                    <DimensionText>{"Followers"}</DimensionText>
                </StatContainer>
                <View style={{ backgroundColor: "#fff", height: "80%", width: .5 }} />
                <StatContainer onPress={viewFollowing}>
                    <StatText>{following ? following.length : 0}</StatText>
                    <DimensionText>{"Following"}</DimensionText>
                </StatContainer>
                {/* <StatContainer>
                <StatText>{reelayCount}</StatText>
                <DimensionText>{"Watchlist Adds"}</DimensionText>
            </StatContainer> */}
            </BarContainer>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
};
