import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import * as ReelayText from "../global/Text";
import { Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

import { useSelector } from 'react-redux';

const ActiveOptionText = styled(ReelayText.H6)`
    color: white;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 2px;
`
const BackgroundBox = styled(View)`
    align-items: center;
    background-color: black;
    border-radius: 8px;
    justify-content: center;
    flex-direction: row;
    height: 48px;
    padding: 2px;
    width: 100%;
`
const ButtonContainer = styled(Pressable)`
    align-items: center;
    justify-content: center;
    height: 44px;
    width: 37.5%;
`
const HeaderContainer = styled(View)`
    padding-left: 15px;
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
    display: flex;
    flex-direction: row;
`
const HeaderText = styled(ReelayText.H4Bold)`
    text-align: left;
    color: white;
    margin-top: 4px;
`
const IconContainer = styled(TouchableOpacity)`
    margin-left: 10px;
`
const OptionText = styled(ReelayText.H6)`
    color: gray;
    font-size: 18px;
`
const UnreadIconIndicator = styled(SafeAreaView)`
	background-color: ${ReelayColors.reelayBlue}
	border-radius: 5px;
	height: 10px;
	width: 10px;
	position: absolute;
	right: 0px;
`

export default HomeHeader = ({ 
    navigation,
    selectedTab,
    setSelectedTab,
    tabOptions,
}) => {
    const { reelayDBUser } = useContext(AuthContext);

    const HomeHeaderTop = () => {
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
                        <Icon type='ionicon' size={27} color={'white'} name='search' />
                    </IconContainer>
                    <IconContainer onPress={advanceToMyNotifications}>
                        <Icon type='ionicon' size={27} color={'white'} name='notifications' />
                        { hasUnreadNotifications && <UnreadIconIndicator /> }
                    </IconContainer>
                </HeaderContainerRight>
            </HeaderContainer>
        );
    };

    const HomeScreenTabSelector = () => {
        return (
            <BackgroundBox>
                { ['discover', 'following'].map(tab => {
                    if (tab === selectedTab) {
                        return (
                            <ButtonContainer key={tab}>
                                <ActiveOptionText>{tab}</ActiveOptionText>
                                <FontAwesomeIcon icon={faCircle} color='white' size={4} /> 
                            </ButtonContainer>
                        );
                    } else {
                        return (
                            <ButtonContainer key={tab} onPress={() => setSelectedTab(tab)}>
                                <OptionText>{tab}</OptionText>
                                <View style={{ height: 6 }} />
                            </ButtonContainer>
                        );
                    }
                })}
            </BackgroundBox>
        );
    }    
    
    return (
        <React.Fragment>
            <HomeHeaderTop navigation={navigation} />
            <HomeScreenTabSelector />
        </React.Fragment>
    )
};