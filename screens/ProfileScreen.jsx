import React, { useContext, useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, Pressable, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { getStacksByCreator } from '../api/ReelayDBApi';
import { getPosterURL } from '../api/TMDbApi';

import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components/native';

export default ProfileScreen = ({ navigation, route }) => {

    const [creatorStacks, setCreatorStacks] = useState([]);
    const { user } = useContext(AuthContext);

    const username = user.username ?? 'User not found';
    const userSub = user.attributes.sub ?? '';

    console.log('PROFILE SCREEN is rendering');

    const ProfileScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const ProfileScrollView = styled(ScrollView)`

    `

    const EditProfileButton = () => {

    }

    const FollowButton = () => {

    }

    const PosterGrid = () => {
        const PosterGridContainer = styled(View)`
            align-items: flex-start;
            flex: 1;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
        `
        if (!creatorStacks.length) {
            return <View />;
        }

        console.log('POSTER GRID is rendering');

        return (
            <PosterGridContainer>
                { creatorStacks.map(renderStack) }
            </PosterGridContainer>
        );
    }

    const ProfileHeader = () => {
        const ProfileHeaderContainer = styled(SafeAreaView)`
            align-items: center;
            margin-top: 16px;
            margin-bottom: 16px;
            width: 100%;
        `
        const ProfilePicture = styled(Image)`
            border-radius: 48px;
            height: 96px;
            width: 96px;
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
                    <ProfilePicture source={require('../assets/icons/reelay-icon.png')} />
                </ProfilePictureContainer>
                {/* <UsernameText>{username}</UsernameText> */}
            </ProfileHeaderContainer>
        );
    }

    const StatsBar = () => {
        const BarContainer = styled(View)`
            align-self: center;
            flex-direction: row;
        `
        const StatContainer = styled(View)`
            align-items: center;
            height: 90px;
            width: 90px;
            margin: 10px;
        `
        const DimensionText = styled(Text)`
            font-family: System;
            font-size: 16px;
            font-weight: 400;
            color: white;
        `
        const StatText = styled(Text)`
            font-family: System;
            font-size: 20px;
            font-weight: 600;
            color: white;
        `

        // sum the reelays across all the stacks
        const reelayCounter = (sum, nextStack) => sum + nextStack.length;
        const reelayCount = creatorStacks.reduce(reelayCounter, 0);

        return (
            <BarContainer>
                <StatContainer>
                    <StatText>{reelayCount}</StatText>
                    <DimensionText>{'Reelays'}</DimensionText>
                </StatContainer>
                <StatContainer>
                    <StatText>{'3.3K'}</StatText>
                    <DimensionText>{'Followers'}</DimensionText>
                </StatContainer>
                <StatContainer>
                    <StatText>{'123'}</StatText>
                    <DimensionText>{'Following'}</DimensionText>
                </StatContainer>
            </BarContainer>
        );
    }

    const TopBar = () => {
        const TopBarContainer = styled(SafeAreaView)`
            flex-direction: row
            justify-content: space-between;
            margin: 16px;
        `
        const HeadingText = styled(Text)`
            align-self: center;
            font-family: System;
            font-size: 20px;
            font-weight: 600;
            color: white;
        `
        const NotificationsIconContainer = styled(View)`
            align-self: center;
        `
        const SearchIconContainer = styled(View)`
            align-self: center;
        `
        const [notificationsOpen, setNotificationsOpen] = useState(false);
        const [searchBarOpen, setSearchBarOpen] = useState(false);

        const openNotifications = () => {
            console.log('open notifications');
            setNotificationsOpen(true);
        }
        const closeNotifications = () => {
            console.log('close notifications');
            setNotificationsOpen(false);
        }
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
                <SearchIconContainer>
                    <Icon type='ionicon' size={30} color={'white'} name='search' onPress={() => {
                        if (searchBarOpen) {
                            closeSearchBar();
                        } else {
                            openSearchBar();
                        }
                    }} />
                </SearchIconContainer>
                <HeadingText>{username}</HeadingText>
                <NotificationsIconContainer>
                    <Icon type='ionicon' size={30} color={'white'} name='notifications' onPress={() => {
                        if (notificationsOpen) {
                            closeNotifications();
                        } else {
                            openNotifications();
                        }
                    }} />
                </NotificationsIconContainer>
            </TopBarContainer>
        );
    }

    const loadCreatorStacks = async () => {
        const nextCreatorStacks = await getStacksByCreator(userSub);
        setCreatorStacks(nextCreatorStacks);
    }

    const renderStack = (stack) => {
        const PosterContainer = styled(View)`
            margin: 10px;
        `
        const PosterImage = styled(Image)`
            border-color: white;
            border-radius: 8px;
            border-width: 1px;
            height: 135px;
            width: 90px;
        `
        const posterURI = stack[0].title.posterURI;
        const posterURL = getPosterURL(posterURI);

        return (
            <PosterContainer key={posterURI}>
                <PosterImage source={{ uri: posterURL }} />
            </PosterContainer>
        );
    }

    useEffect(() => {
        if (userSub.length) loadCreatorStacks();
    }, []);

    return (
        <ProfileScreenContainer>
            <TopBar />
            <ProfileScrollView>
                <ProfileHeader />
                <StatsBar />
                <PosterGrid />
            </ProfileScrollView>
        </ProfileScreenContainer>
    );
}