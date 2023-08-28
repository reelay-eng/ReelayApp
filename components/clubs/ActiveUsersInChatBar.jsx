import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import ProfilePicture from '../global/ProfilePicture';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import moment from 'moment';
import ReelayColors from '../../constants/ReelayColors';
import { AuthContext } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { firebaseCrashlyticsError, firebaseCrashlyticsLog } from '../utils/EventLogger';

const LAST_ACTIVE_MAX_SECONDS = 180;

const BarView = styled(View)`
    background-color: #1a1a1a;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    flex-direction: row;
    justify-content: space-between;
    padding: 6px;
    padding-left: 16px;
    padding-right: 16px;
    position: absolute;
    top: ${props => props.topOffset + 76}px;
    width: 100%;
`
const OnlineNowText = styled(ReelayText.Body2)`
    color: rgba(255,255,255,0.8);
    margin-top: 2px;
`
const ProfilePicView = styled(View)`
    margin-left: 2px;
`
const ProfilePicRowView = styled(View)`
    flex-direction: row;
    justify-content: flex-end;
`

export default ActiveUsersInChatBar = ({ activeUsersInChatRef, navigation }) => {
    try {
        firebaseCrashlyticsLog('Active users in chat bar');
        const { reelayDBUser } = useContext(AuthContext);
        const topOffset = useSafeAreaInsets().top;

        const getDisplayUsersInChat = () => {
            const activeUsersInChat = Object.values(activeUsersInChatRef?.current);
            const displayUsersInChat = activeUsersInChat.filter(userInChat => {
                const lastActiveMoment = moment(userInChat?.lastActiveAt);
                const secondsSinceActive = moment().diff(lastActiveMoment, 'seconds');
                return secondsSinceActive < LAST_ACTIVE_MAX_SECONDS;
            });
            return displayUsersInChat;
        }

        const [displayUsersInChat, setDisplayUsersInChat] = useState(getDisplayUsersInChat());
        const otherUsersInChatCount = displayUsersInChat?.length - 1;
        const otherUsersActive = otherUsersInChatCount > 0;

        // todo: only display up to 5 profile pics

        const ProfilePicRow = () => {
            return (
                <ProfilePicRowView>
                    {displayUsersInChat.map(activeUser => {
                        const picUserObj = {
                            sub: activeUser?.userSub,
                            username: activeUser?.username,
                        }
                        // if (picUserObj?.sub === reelayDBUser?.sub) return <View />;

                        return (
                            <ProfilePicView key={picUserObj?.sub}>
                                <ProfilePicture user={picUserObj} size={24} />
                            </ProfilePicView>
                        );
                    })}
                </ProfilePicRowView>
            );
        }

        const updateActiveUsersInChat = () => {
            try {
                const nextDisplayUsersInChat = getDisplayUsersInChat();
                const refString = JSON.stringify(nextDisplayUsersInChat);
                const stateString = JSON.stringify(displayUsersInChat);
                if (refString !== stateString) {
                    setDisplayUsersInChat(nextDisplayUsersInChat);
                }
            } catch (error) {
                console.log('error in updating active users in chat bar');
                console.log(error);
            }
        }

        useEffect(() => {
            const activeUsersInterval = setInterval(() => updateActiveUsersInChat(), 250);
            return () => clearInterval(activeUsersInterval);
        }, []);

        if (!otherUsersActive) return <View />;

        return (
            <BarView topOffset={topOffset}>
                <OnlineNowText>{'In the chat now'}</OnlineNowText>
                <ProfilePicRow />
            </BarView>
        )
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}

