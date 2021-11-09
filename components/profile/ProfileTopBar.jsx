import React, { useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';

import styled from 'styled-components/native';

export default ProfileTopBar = ({ creator, navigation, route, atProfileBase = false }) => {
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
    const LeftCornerContainer = styled(SafeAreaView)`
        align-self: flex-start;
        flex-direction: row;
        position: absolute;
    `
    const TopBarContainer = styled(SafeAreaView)`
        justify-content: center;
        margin-left: 16px;
        margin-right: 16px;
        margin-top: 24px;
        margin-bottom: 24px;
        shadow-color: white;
        shadow-offset: 8px;
        shadow-radius: 2px;            
    `
    const HeadingText = styled(Text)`
        align-self: center;
        font-family: System;
        font-size: 20px;
        font-weight: 600;
        color: white;
        position: absolute;
    `
    const SearchIconContainer = styled(View)`
        align-self: center;
        margin-left: 10px;
    `
    const SettingsIconContainer = styled(View)`
        align-self: center;
        margin-right: 10px;
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

    // we're leaving the search button out of the UI
    // until we actually implement it

    const SearchButton = () => {
        return (
            <LeftCornerContainer>
                <SearchIconContainer>
                    <Icon type='ionicon' size={30} color={'white'} name='search' onPress={() => {
                        if (searchBarOpen) {
                            closeSearchBar();
                        } else {
                            openSearchBar();
                        }
                    }} />
                </SearchIconContainer>
            </LeftCornerContainer>
        );
    }

    const SettingsButton = () => {
        return (
            <RightCornerContainer>
                <SettingsIconContainer>
                    <Icon type='ionicon' size={30} color={'white'} name='settings-outline' onPress={() => {
                        navigation.push('ProfileSettingsScreen', {initialFeedPos: 0});
                    }} />
                </SettingsIconContainer>
            </RightCornerContainer>
        );
    }

    return (
        <TopBarContainer>
            { !atProfileBase &&
            <>
                <BackButtonContainer>
                    <Icon type='ionicon' size={30} color={'white'} name='chevron-back-outline' 
                        onPress={() => navigation.pop()} />
                </BackButtonContainer>  
            </>      
            }
            <HeadingText>{creatorName}</HeadingText>
            {/* <SearchButton /> */}
            <SettingsButton />
        </TopBarContainer>
    );
}
