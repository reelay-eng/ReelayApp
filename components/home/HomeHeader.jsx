import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import * as ReelayText from "../global/Text";
import { Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

import { useSelector } from 'react-redux';
import { NotificationIconSVG, SearchIconSVG } from '../global/SVGs';

const HeaderContainer = styled(View)`
    padding-left: 12px;
    padding-right: 15px;
    padding-bottom: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;
const HeaderContainerLeft = styled(View)`
    align-items: center;
    flex-direction: row;
`;
const HeaderContainerRight = styled(View)`
    flex-direction: row;
    top: 8px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 28px;
    line-height: 28px;
    margin-top: 6px;
    text-align: left;
`
const IconContainer = styled(TouchableOpacity)`
    margin-top: -10px;
    padding-top: 10px;
    padding-left: 10px;
    padding-bottom: 10px;
`
const UnreadIconIndicator = styled(SafeAreaView)`
	background-color: ${ReelayColors.reelayBlue}
	border-radius: 5px;
	height: 10px;
	width: 10px;
	position: absolute;
    top: 6px;
	right: 0px;
`

export default HomeHeader = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const isGuestUser = (reelayDBUser?.username === 'be_our_guest');
    const myNotifications = useSelector(state => state.myNotifications);
    const hasUnreadNotifications = myNotifications.filter(({ seen }) => !seen).length > 0;

    const advanceToMyNotifications = () => navigation.push('NotificationScreen');
    const advanceToSearchScreen = () => navigation.push('SearchScreen');

    return (
        <HeaderContainer>
            <HeaderContainerLeft>
                <HeaderText>{'reelay'}</HeaderText>
            </HeaderContainerLeft>
            <HeaderContainerRight>
                <IconContainer onPress={advanceToSearchScreen}>
                    <SearchIconSVG />
                </IconContainer>
                { !isGuestUser && (
                    <IconContainer onPress={advanceToMyNotifications}>
                        <NotificationIconSVG />
                        { hasUnreadNotifications && <UnreadIconIndicator /> }
                    </IconContainer>
                )}
            </HeaderContainerRight>
        </HeaderContainer>
    );
};