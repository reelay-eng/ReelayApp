import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { getStacksByCreator } from '../../api/ReelayDBApi';

import FollowButtonBar from "../../components/profile/FollowButtonBar";
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileStatsBar from '../../components/profile/ProfileStatsBar';
import ProfileTopBar from '../../components/profile/ProfileTopBar';
import Tombstone from '../../components/profile/Tombstone';

import styled from 'styled-components/native';

export default UserProfileScreen = ({ navigation, route }) => {

    const [creatorStacks, setCreatorStacks] = useState([]);

    const { creator } = route.params;
    const creatorSub = creator.sub ?? '';

    const ProfileScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const ProfileScrollView = styled(ScrollView)`
        margin-bottom: 60px;
    `

    const loadCreatorStacks = async () => {
        const nextCreatorStacks = await getStacksByCreator(creatorSub);
        nextCreatorStacks.forEach(stack => stack.sort(sortReelays));

        nextCreatorStacks.sort(sortStacks);
        setCreatorStacks(nextCreatorStacks);
    }

    const sortReelays = (reelay1, reelay2) => reelay2.postedDateTime - reelay1.postedDateTime;
    const sortStacks = (stack1, stack2) => stack2[0].postedDateTime - stack1[0].postedDateTime;
    const reelayCounter = (sum, nextStack) => sum + nextStack.length;
    const reelayCount = creatorStacks.reduce(reelayCounter, 0);

    useEffect(() => {
        if (creatorSub.length) loadCreatorStacks();
    }, []);

    return (
      <ProfileScreenContainer>
        <ProfileTopBar creator={creator} navigation={navigation} />
        <ProfileScrollView>
          <ProfileHeader />
          <ProfileStatsBar reelayCount={reelayCount} creator={creator} />
          <FollowButtonBar creator={creator}/>
          <ProfilePosterGrid
            creatorStacks={creatorStacks}
            navigation={navigation}
          />
        </ProfileScrollView>
      </ProfileScreenContainer>
    );
}