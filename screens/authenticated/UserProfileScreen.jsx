import React, { useEffect, useState, useContext } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { getStacksByCreator, getFollowers, getFollowing } from '../../api/ReelayDBApi';

import FollowButtonBar from '../../components/profile/FollowButtonBar';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileStatsBar from '../../components/profile/ProfileStatsBar';
import ProfileTopBar from '../../components/profile/ProfileTopBar';
import { AuthContext } from '../../context/AuthContext';

import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';
import styled from 'styled-components/native';

const ProfileScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const ProfileScrollView = styled(ScrollView)`
    margin-bottom: 60px;
`

export default UserProfileScreen = ({ navigation, route }) => {
    const [creatorStacks, setCreatorStacks] = useState([]);
    const [creatorFollowers, setCreatorFollowers] = useState([]);
    const [creatorFollowing, setCreatorFollowing] = useState([]);
    const [refreshing, setRefreshing] = useState(true);

    const { cognitoUser } = useContext(AuthContext);
    const { creator } = route.params;
    const creatorSub = creator.sub ?? '';

    const loadCreatorStacks = async () => {
        const nextCreatorStacks = await getStacksByCreator(creatorSub);
        nextCreatorStacks.forEach(stack => stack.sort(sortReelays));

        nextCreatorStacks.sort(sortStacks);
        setCreatorStacks(nextCreatorStacks);
    }

    const loadFollows = async () => {
        const nextFollowers = await getFollowers(creator.sub);
        const nextFollowing = await getFollowing(creator.sub);

        setCreatorFollowers(nextFollowers);
        setCreatorFollowing(nextFollowing);
    };

    const onRefresh = async () => {
        if (!refreshing) {
            setRefreshing(true);
        }

        if (creatorSub.length) {
            await loadCreatorStacks();
            await loadFollows();
        }
        setRefreshing(false);
    }

    useEffect(() => {
        onRefresh();
        logEventWithPropertiesAsync('viewProfile', {
            username: cognitoUser.attributes.username,
            creatorName: creator.username,
        });    
    }, []);

    const isMyProfile = (creatorSub === cognitoUser.attributes.sub);

    const sortReelays = (reelay1, reelay2) => reelay2.postedDateTime - reelay1.postedDateTime;
    const sortStacks = (stack1, stack2) => stack2[0].postedDateTime - stack1[0].postedDateTime;
    const reelayCounter = (sum, nextStack) => sum + nextStack.length;
    const reelayCount = creatorStacks.reduce(reelayCounter, 0);

    return (
        <ProfileScreenContainer>
            <ProfileTopBar creator={creator} navigation={navigation} />
            <ProfileScrollView refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                <ProfileHeader />
                <ProfileStatsBar
                    navigation={navigation}
                    reelayCount={reelayCount}
                    creator={creator}
                    followers={creatorFollowers}
                    following={creatorFollowing}
                    prevScreen={'UserProfileScreen'}
                />
                { !isMyProfile && 
                    <FollowButtonBar 
                        creator={creator} 
                        creatorFollowers={creatorFollowers} 
                        setCreatorFollowers={setCreatorFollowers}
                    />
                }
                <ProfilePosterGrid
                    creatorStacks={creatorStacks}
                    navigation={navigation}
                />
            </ProfileScrollView>
        </ProfileScreenContainer>
    );
}