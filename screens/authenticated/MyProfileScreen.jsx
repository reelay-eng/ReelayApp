import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, View } from 'react-native';
import { getStacksByCreator, getFollowing, getFollowers, getFollowRequests } from '../../api/ReelayDBApi';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileStatsBar from '../../components/profile/ProfileStatsBar';
import ProfileTopBar from '../../components/profile/ProfileTopBar';

import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';

export default MyProfileScreen = ({ navigation, route }) => {

    const [creatorStacks, setCreatorStacks] = useState([]);
    // const [followers, setFollowers] = useState([]);
    // const [following, setFollowing] = useState([]);
    // const [followReq, setFollowReq] = useState([]);

	const { 
    cognitoUser,
    followers,
    following,
    followRequests,
    setFollowers,
    setFollowing,
    setFollowRequests,
  } = useContext(AuthContext); 

    // useEffect(() => {
    //   loadFollows();
    // }, []);

    // const loadFollows = async () => {
    //   const nextFollowers = await getFollowers(cognitoUser.attributes.sub);
    //   const nextFollowing = await getFollowing(cognitoUser.attributes.sub);
    //   const nextFollowReq = await getFollowRequests(cognitoUser.attributes.sub);

    //   console.log("next Followers: ", nextFollowers);
    //   console.log("next Following: ", nextFollowing);
    //   console.log("next FollowReq: ", nextFollowReq);
    //   setFollowers(nextFollowers);
    //   setFollowing(nextFollowing);
    //   setFollowReq(nextFollowReq);
    // };

    if (!cognitoUser) {
        return (
            <ProfileTopBar atProfileBase={true} creator={{ username: 'User not found' }} 
                navigation={navigation} />
        );
    }
    const userSub = cognitoUser.attributes.sub;

    const ProfileScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const ProfileScrollView = styled(ScrollView)`
        margin-bottom: 60px;
    `

    const loadCreatorStacks = async () => {
        const nextCreatorStacks = await getStacksByCreator(userSub);
        nextCreatorStacks.forEach(stack => stack.sort(sortReelays));
        nextCreatorStacks.sort(sortStacks);
        setCreatorStacks(nextCreatorStacks);
    }

    const sortReelays = (reelay1, reelay2) => reelay2.postedDateTime - reelay1.postedDateTime;
    const sortStacks = (stack1, stack2) => stack2[0].postedDateTime - stack1[0].postedDateTime;
    const reelayCounter = (sum, nextStack) => sum + nextStack.length;
    const reelayCount = creatorStacks.reduce(reelayCounter, 0);

    useEffect(() => {
        if (userSub.length) loadCreatorStacks();
    }, []);

    Amplitude.logEventWithPropertiesAsync("viewMyProfile", {
        username: cognitoUser.attributes.username,
    });

    return (
        <ProfileScreenContainer>
            <ProfileTopBar
            creator={cognitoUser}
            navigation={navigation}
            atProfileBase={true}
            />
            <ProfileScrollView>
            <ProfileHeader />
            <ProfileStatsBar
                navigation={navigation}
                reelayCount={reelayCount}
                creator={cognitoUser.attributes}
                followers={followers}
                following={following}
                followRequests={followRequests}
            />
            <ProfilePosterGrid
                creatorStacks={creatorStacks}
                navigation={navigation}
            />
            </ProfileScrollView>
        </ProfileScreenContainer>
    );
}