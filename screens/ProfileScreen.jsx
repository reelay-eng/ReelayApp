import React, { useContext, useState } from 'react';
import { Image, View, SafeAreaView, TouchableHighlight, Pressable } from 'react-native';
import { Icon, Text } from 'react-native-elements';

import { AuthStyles } from '../styles';
import { AuthContext } from '../context/AuthContext';
import { VisibilityContext } from '../context/VisibilityContext';

import styled from 'styled-components/native';

const defaultProfilePhoto = require('../assets/icons/reelay-icon.png');

export default ProfileScreen = ({ navigation, route }) => {

    const ProfileScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const { user } = useContext(AuthContext);
    const { setOverlayVisible } = useContext(VisibilityContext);

    const username = user.username ?? 'User not found';

    const ProfileHeader = ({ navigation }) => {
        const ProfileHeaderContainer = styled(SafeAreaView)`
            align-items: center;
            margin-top: 16px;
            width: 100%;
        `
        const ProfilePictureContainer = styled(Pressable)`
            border-color: white;
            border-radius: 50px;
            border-width: 2px;
            margin: 16px;
            height: 100px;
            width: 100px;
        `
        const UsernameText = styled(Text)`
            font-family: System;
            font-size: 20px;
            font-weight: 600;
            color: white;
        `
        return (
            <ProfileHeaderContainer>
                <ProfilePictureContainer>
                    <Image style={{ 
                        borderRadius: 48,
                        height: 96, 
                        width: 96 
                    }} source={require('../assets/icons/reelay-icon.png')} />
                </ProfilePictureContainer>
                <UsernameText>{username}</UsernameText>
            </ProfileHeaderContainer>
        );
    }

    const TopBar = ({ navigation }) => {
        const TopBarContainer = styled(SafeAreaView)`
            flex-direction: row
            justify-content: center;
            margin-top: 16px;
            width: 100%;
        `
        const HeadingText = styled(Text)`
            align-self: center;
            position: absolute;
            font-family: System;
            font-size: 20px;
            font-weight: 600;
            color: white;
        `
        const SearchIconContainer = styled(View)`
            align-self: center;
            position: absolute;
            height: 30px;
            width: 30px;
            right: 46px;
        `
        const [searchBarOpen, setSearchBarOpen] = useState(false);


        const openSearchBar = () => {
            console.log('open search bar');
            setSearchBarOpen(true);
        }
        const closeSearchBar = () => {
            console.log('close search bar');
            setSearchBarOpen(false);
        }

        return (
            <TopBarContainer>
                {/* <BackButtonContainer>
                    <Icon type='ionicon' size={30} color={'white'} name='chevron-back-outline' onPress={() => {
                        navigation.pop();
                        setOverlayVisible(true);
                    }}   />
                </BackButtonContainer> */}
                <HeadingText>{'Profile'}</HeadingText>
                <SearchIconContainer>
                    <Icon type='ionicon' size={30} color={'white'} name='search' onPress={() => {
                        if (searchBarOpen) {
                            closeSearchBar();
                        } else {
                            openSearchBar();
                        }
                    }} />
                </SearchIconContainer>
            </TopBarContainer>
        );
    }

    return (
        <ProfileScreenContainer>
            <TopBar navigation={navigation} />
            <ProfileHeader navigation={navigation} />
        </ProfileScreenContainer>
    );
}