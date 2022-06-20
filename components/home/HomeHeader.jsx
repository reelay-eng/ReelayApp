import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import * as ReelayText from "../global/Text";
import { SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';

import { useSelector } from 'react-redux';
import { ToggleSelector } from '../global/Buttons';

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
    margin-left: 12px;
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
            <ToggleSelector 
                displayOptions={tabOptions}
                options={tabOptions}
                selectedOption={selectedTab}
                onSelect={setSelectedTab}
            />
        );
    }    
    
    return (
        <React.Fragment>
            <HomeHeaderTop navigation={navigation} />
            <HomeScreenTabSelector />
        </React.Fragment>
    )
};