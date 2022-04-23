import React from 'react';
import { SafeAreaView, View, Platform } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import BackButton from '../utils/BackButton';

export default ProfileTopBar = ({ creator, navigation, atProfileBase = false }) => {
    const creatorName = creator.username ?? 'User not found';

    const RightCornerContainer = styled(View)`
        position: absolute;
        right: 16px;
    `
    const TopBarContainer = styled(SafeAreaView)`
        align-items: center;
        flex-direction: row;
        height: 30px;
        margin-left: 16px;
        margin-right: 16px;
        shadow-color: white;
        shadow-offset: 8px;
        shadow-radius: 2px;     
    `
    const HeadingText = styled(ReelayText.H6Emphasized)`
        color: white;
        padding-left: ${atProfileBase ? 10: 0}px;
    `
    const SettingsButtons = () => {
        return (
            <RightCornerContainer>
                <Icon type='ionicon' size={24} color={'white'} name='settings-outline' onPress={() => {
                    navigation.push('ProfileSettingsScreen', { initialFeedPos: 0 });
                }} />
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
