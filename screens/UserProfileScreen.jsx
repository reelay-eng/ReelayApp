import React, { createContext, useContext, useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, Pressable, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { getStacksByCreator } from '../api/ReelayDBApi';
import { getPosterURL } from '../api/TMDbApi';

import styled from 'styled-components/native';

export const ProfileContext = createContext({ stackList: [] });

export default UserProfileScreen = ({ navigation, route }) => {

    const [creatorStacks, setCreatorStacks] = useState([]);

    const { creator } = route.params;
    const creatorSub = creator.id ?? '';
    const creatorName = creator.username ?? 'User not found';

    console.log('User PROFILE SCREEN is rendering');

    const ProfileScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const ProfileScrollView = styled(ScrollView)`
        margin-bottom: 60px;
    `

    const EditProfileButton = () => {

    }

    const FollowButton = () => {

    }

    const PosterGrid = () => {
        const PosterGridContainer = styled(View)`
            align-items: flex-start;
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
        return (
            <ProfileHeaderContainer>
                <ProfilePictureContainer>
                    <ProfilePicture source={require('../assets/icons/reelay-icon.png')} />
                </ProfilePictureContainer>
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
        const NotificationsIconContainer = styled(View)`
            align-self: center;
            margin: 10px;
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
                <BackButtonContainer>
                    <Icon type='ionicon' size={30} color={'white'} name='chevron-back-outline' 
                        onPress={() => navigation.pop()} />
                </BackButtonContainer>
                <HeadingText>{creatorName}</HeadingText>
                <RightCornerContainer>
                    {/* <SearchIconContainer>
                        <Icon type='ionicon' size={30} color={'white'} name='search' onPress={() => {
                            if (searchBarOpen) {
                                closeSearchBar();
                            } else {
                                openSearchBar();
                            }
                        }} />
                    </SearchIconContainer> */}
                    <NotificationsIconContainer>
                        <Icon type='ionicon' size={30} color={'white'} name='notifications' onPress={() => {
                            if (notificationsOpen) {
                                closeNotifications();
                            } else {
                                openNotifications();
                            }
                        }} />
                    </NotificationsIconContainer>
                </RightCornerContainer>
            </TopBarContainer>
        );
    }

    const loadCreatorStacks = async () => {
        const nextCreatorStacks = await getStacksByCreator(creatorSub);
        nextCreatorStacks.forEach(stack => stack.sort(sortReelays));
        nextCreatorStacks.sort(sortStacks);
        setCreatorStacks(nextCreatorStacks);
    }

    const renderStack = (stack, index) => {
        const PosterContainer = styled(Pressable)`
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

        const viewProfileFeed = () => {
            navigation.push('ProfileFeedScreen', { stackList: creatorStacks, initialFeedPos: index });
        }

        return (
            <PosterContainer key={posterURI} onPress={viewProfileFeed}>
                <PosterImage source={{ uri: posterURL }} />
            </PosterContainer>
        );
    }

    const sortReelays = (reelay1, reelay2) => reelay2.postedDateTime - reelay1.postedDateTime;
    const sortStacks = (stack1, stack2) => stack2[0].postedDateTime - stack1[0].postedDateTime;

    useEffect(() => {
        if (creatorSub.length) loadCreatorStacks();
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