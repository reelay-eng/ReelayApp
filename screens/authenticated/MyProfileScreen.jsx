import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { getStacksByCreator } from '../../api/ReelayDBApi';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileStatsBar from '../../components/profile/ProfileStatsBar';
import ProfileTopBar from '../../components/profile/ProfileTopBar';

import { getFollowers, getFollowing } from '../../api/ReelayDBApi';

import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';

export default MyProfileScreen = ({ navigation, route }) => {
    const [refreshing, setRefreshing] = useState(false);
	const { 
        cognitoUser, 
        myFollowers, 
        myFollowing,
        myCreatorStacks,
        setMyFollowers, 
        setMyFollowing,
        setMyCreatorStacks,
    } = useContext(AuthContext); 

    if (!cognitoUser) {
        return (
            <ProfileTopBar atProfileBase={true} creator={{ username: 'User not found' }} 
                navigation={navigation} />
        );
    }
    const userSub = cognitoUser?.attributes?.sub;

    const ProfileScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const ProfileScrollView = styled(ScrollView)`
        margin-bottom: 60px;
    `

    const loadCreatorStacks = async () => {
        const nextMyCreatorStacks = await getStacksByCreator(userSub);
        nextMyCreatorStacks.forEach(stack => stack.sort(sortReelays));
        nextMyCreatorStacks.sort(sortStacks);
        setMyCreatorStacks(nextMyCreatorStacks);
    }

    const loadFollows = async () => {
        const nextMyFollowers = await getFollowers(userSub);
        const nextMyFollowing = await getFollowing(userSub);

        setMyFollowers(nextMyFollowers);
        setMyFollowing(nextMyFollowing);
    }

    const onRefresh = async () => {
        if (userSub.length) {
            setRefreshing(false);
            await loadCreatorStacks();
            await loadFollows();
            setRefreshing(false);
        }
    }

    const sortReelays = (reelay1, reelay2) => reelay2.postedDateTime - reelay1.postedDateTime;
    const sortStacks = (stack1, stack2) => stack2[0].postedDateTime - stack1[0].postedDateTime;
    const reelayCounter = (sum, nextStack) => sum + nextStack.length;
    const reelayCount = myCreatorStacks.reduce(reelayCounter, 0);

    useEffect(() => {
        onRefresh();
        logEventWithPropertiesAsync('viewMyProfile', {
            username: cognitoUser.attributes.username,
        });    
    }, []);

    logEventWithPropertiesAsync("viewMyProfile", {
        username: cognitoUser.username,
    });

    return (
        <ProfileScreenContainer>
            <ProfileTopBar
                creator={cognitoUser}
                navigation={navigation}
                atProfileBase={true}
            />
            <ProfileScrollView refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                <ProfileHeader />
                <ProfileStatsBar
                    navigation={navigation}
                    reelayCount={reelayCount}
                    creator={{
                        username: cognitoUser.username,
                        sub: cognitoUser?.attributes?.sub,
                    }}
                    followers={myFollowers}
                    following={myFollowing}
                    prevScreen={'MyProfileScreen'}
                />
                <ProfilePosterGrid
                    creatorStacks={myCreatorStacks}
                    navigation={navigation}
                />
            </ProfileScrollView>
        </ProfileScreenContainer>
    );
}