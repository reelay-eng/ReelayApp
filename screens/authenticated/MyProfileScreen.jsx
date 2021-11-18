import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, View } from 'react-native';
import { getStacksByCreator } from '../../api/ReelayDBApi';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileStatsBar from '../../components/profile/ProfileStatsBar';
import ProfileTopBar from '../../components/profile/ProfileTopBar';
import Tombstone from '../../components/profile/Tombstone';

import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';

export default MyProfileScreen = ({ navigation, route }) => {

    const [creatorStacks, setCreatorStacks] = useState([]);
    let { cognitoUser } = useContext(AuthContext);    

    if (!cognitoUser) {
        return (
            <ProfileTopBar atProfileBase={true} creator={{ username: 'User not found' }} 
                navigation={navigation} />
        );
    }
    const userSub = cognitoUser.attributes?.sub;

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

    return (
<<<<<<< HEAD
        <ProfileScreenContainer>
            <ProfileTopBar creator={cognitoUser} navigation={navigation} atProfileBase={true} />
            <ProfileScrollView>
                <ProfileHeader />
                <ProfileStatsBar reelayCount={reelayCount} creator={cognitoUser} />
                <ProfilePosterGrid creatorStacks={creatorStacks} navigation={navigation} />
            </ProfileScrollView>
        </ProfileScreenContainer>
=======
      <ProfileScreenContainer>
        <ProfileTopBar
          creator={user}
          navigation={navigation}
          atProfileBase={true}
        />
        <ProfileScrollView>
          <ProfileHeader />
          <ProfileStatsBar reelayCount={reelayCount} creator={user} />
          <ProfilePosterGrid
            creatorStacks={creatorStacks}
            navigation={navigation}
          />
        </ProfileScrollView>
      </ProfileScreenContainer>
>>>>>>> d97e9ae5cd0fec6fb05a828fccc86e7e56eff80b
    );
}