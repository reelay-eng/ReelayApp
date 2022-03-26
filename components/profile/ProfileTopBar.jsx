import React, { useContext } from 'react';
import { SafeAreaView, View, Platform } from 'react-native';
import { Icon } from 'react-native-elements';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';
import BackButton from '../utils/BackButton';

export default ProfileTopBar = ({ creator, navigation, atProfileBase = false }) => {
    const creatorName = creator.username ?? 'User not found';

    const BackButtonContainer = styled(SafeAreaView)`
        align-self: flex-start;
        position: absolute;
    `
    const RightCornerContainer = styled(SafeAreaView)`
        align-self: flex-end;
        flex-direction: row;
        position: absolute;
    `
    const TopBarContainer = styled(SafeAreaView)`
        paddingTop: ${Platform.OS === 'android' ? '25px' : '0px'};
        justify-content: center;
        margin-left: 16px;
        margin-right: 16px;
        margin-top: 24px;
        margin-bottom: 24px;
        shadow-color: white;
        shadow-offset: 8px;
        shadow-radius: 2px;            
    `
    const HeadingText = styled(ReelayText.H6Emphasized)`
        align-self: center;
        color: white;
        position: absolute;
    `
    const SettingsIconContainer = styled(View)`
        align-self: center;
        margin-right: 10px;
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
        return (
            <RightCornerContainer>
                <SettingsIconContainer>
                    <Icon type='ionicon' size={27} color={'white'} name='cog-outline' onPress={() => {
                        navigation.push('ProfileSettingsScreen', { initialFeedPos: 0 });
                    }} />
                </SettingsIconContainer>
            </RightCornerContainer>
        );
    }

    return (
        <TopBarContainer>
            { !atProfileBase && 
                <BackButtonContainer>
                    <BackButton navigation={navigation} />
                </BackButtonContainer>  
            }
            <HeadingText>@{creatorName}</HeadingText>
            { atProfileBase && <SettingsButtons /> }
        </TopBarContainer>
    );
}
