import React from 'react';
import { SafeAreaView, View, Platform, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import BackButton from '../utils/BackButton';

import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';

export default ProfileTopBar = ({ creator, navigation, atProfileBase = false }) => {
    const creatorName = creator.username ?? 'User not found';

    const HeadingText = styled(ReelayText.H6Emphasized)`
        color: white;
        padding-left: ${atProfileBase ? 10: 0}px;
    `
    const IconContainer = styled(TouchableOpacity)`
        margin-left: 20px;
    `
    // should line up with home header
    const RightCornerContainer = styled(View)`
        align-items: center;
        top: 6px;
        flex-direction: row;
        position: absolute;
        right: 5px;
    `
    const TopBarContainer = styled(SafeAreaView)`
        align-items: center;
        flex-direction: row;
        height: 40px;
        margin-left: 4px;
        margin-right: 10px;
        margin-bottom: 8px;
        shadow-color: white;
        shadow-offset: 8px;
        shadow-radius: 2px;
    `
    const SettingsButtons = () => {
        const advanceToMyWatchlist = () => navigation.push('WatchlistScreen');
        const advanceToMyProfileSettings = () => navigation.push('ProfileSettingsScreen');

        return (
            <RightCornerContainer>
                <IconContainer onPress={advanceToMyWatchlist}>
                    {/* <WatchlistAddedIconSVG size={28} /> */}
                    <FontAwesomeIcon icon={ faListCheck } size={27} color='white' />
                </IconContainer>
                <IconContainer onPress={advanceToMyProfileSettings}>
                    <Icon type='ionicon' size={27} color={'white'} name='settings-outline' />
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
