import React from 'react';
import { SafeAreaView, View, Platform, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import BackButton from '../utils/BackButton';
import { useSelector } from 'react-redux';
import { AddToWatchlistIconSVG } from '../global/SVGs';

export default ProfileTopBar = ({ creator, navigation, atProfileBase = false }) => {
    const creatorName = creator.username ?? 'User not found';
    const myNotifications = useSelector(state => state.myNotifications);
    const hasUnreadNotifications = myNotifications.filter(({ seen }) => !seen).length > 0;

    const HeadingText = styled(ReelayText.H6Emphasized)`
        color: white;
        padding-left: ${atProfileBase ? 10: 0}px;
    `
    const IconContainer = styled(TouchableOpacity)`
        margin-left: 10px;
    `
    // should line up with home header
    const RightCornerContainer = styled(View)`
        top: 6px;
        flex-direction: row;
        position: absolute;
        right: 5px;
    `
    const TopBarContainer = styled(SafeAreaView)`
        align-items: center;
        flex-direction: row;
        height: 30px;
        margin-left: 4px;
        margin-right: 10px;
        margin-bottom: 8px;
        shadow-color: white;
        shadow-offset: 8px;
        shadow-radius: 2px;     
    `
    const UnreadIconIndicator = styled(View)`
        background-color: ${ReelayColors.reelayBlue}
        border-radius: 5px;
        height: 10px;
        width: 10px;
        position: absolute;
        right: 0px;
    `
    const SettingsButtons = () => {
        const advanceToMyWatchlist = () => navigation.push('WatchlistScreen');
        const advanceToMyProfileSettings = () => navigation.push('ProfileSettingsScreen');
        const advanceToMyNotifications = () => avigation.push('NotificationScreen');

        return (
            <RightCornerContainer>
                <IconContainer onPress={advanceToMyWatchlist}>
                    <AddToWatchlistIconSVG size={28} />
                </IconContainer>
                <IconContainer onPress={advanceToMyProfileSettings}>
                    <Icon type='ionicon' size={24} color={'white'} name='settings-outline' />
                </IconContainer>
                <IconContainer onPress={advanceToMyNotifications}>
                    <Icon type='ionicon' size={27} color={'white'} name='notifications' />
                    { hasUnreadNotifications && <UnreadIconIndicator /> }
                </IconContainer>
            </RightCornerContainer>
        );
    }

    return (
        <TopBarContainer>
            { !atProfileBase && <BackButton navigation={navigation} /> }
            <HeadingText>@{creatorName}</HeadingText>
            { atProfileBase && <SettingsButtons /> }
        </TopBarContainer>
    );
}
