import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import ProfilePicture from '../global/ProfilePicture';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import moment from 'moment';
import ReelayColors from '../../constants/ReelayColors';
import { AuthContext } from '../../context/AuthContext';

const LAST_ACTIVE_MAX_SECONDS = 180;

const BarView = styled(View)`
    background-color: #E9E9E9;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    flex-direction: row;
    justify-content: space-between;
    padding: 6px;
    padding-left: 16px;
    padding-right: 16px;
    position: absolute;
    top: 116px;
    width: 100%;
`
const OnlineNowText = styled(ReelayText.Body2)`
    color: black;
`
const ProfilePicView = styled(View)`
    margin-left: 2px;
`
const ProfilePicRowView = styled(View)`
    flex-direction: row;
    justify-content: flex-end;
`

export default ActiveUsersInChatBar = ({ activeUsersInChatRef, navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [activeUsersInChat, setActiveUsersInChat] = useState(activeUsersInChatRef?.current);

    const displayUsersInChat = Object.entries(activeUsersInChat).filter(userInChat => {
        const lastActiveMoment = moment(userInChat?.lastActive);
        const secondsSinceActive = moment().diff(lastActiveMoment, 'seconds');
        return secondsSinceActive < LAST_ACTIVE_MAX_SECONDS;
    })

    const otherUsersInChatCount = displayUsersInChat?.length - 1;
    const otherUsersActive = otherUsersInChatCount > 0;
    const usersPlural = otherUsersInChatCount > 1;

    if (!otherUsersActive) return <View />;

    const ProfilePicRow = () => {
        return (
            <ProfilePicRowView>
                { displayUsersInChat.map(activeUser => {
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

    useEffect(() => {
        setInterval(() => {
            try {
                const refString = JSON.stringify(activeUsersInChatRef?.current);
                const stateString = JSON.stringify(activeUsersInChat);
                if (refString !== stateString) {
                    setActiveUsersInChat(activeUsersInChatRef?.current);
                }    
            } catch (error) {
                console.log('error in updating active users in chat bar');
                console.log(error);
            }
        }, 500);
    }, []);

    return (
        <BarView>
            <OnlineNowText>{'In the chat now'}</OnlineNowText>
            <ProfilePicRow />
        </BarView>
    )
}

