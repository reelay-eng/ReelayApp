import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, View } from 'react-native';
import { Button } from 'react-native-elements';
import { getStacksByCreator } from '../../api/ReelayDBApi';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileStatsBar from '../../components/profile/ProfileStatsBar';
import ProfileTopBar from '../../components/profile/ProfileTopBar';

import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';

const { width } = Dimensions.get('window');

export default MyProfileScreen = ({ navigation, route }) => {

    const [creatorStacks, setCreatorStacks] = useState([]);
    
    let { user } = route.params ?? useContext(AuthContext);
    const userSub = user.attributes.sub ?? '';

    const ProfileScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const ProfileScrollView = styled(ScrollView)`
        margin-bottom: 60px;
    `

    const EditProfileButton = () => {
        const ButtonContainer = styled(View)`
            align-self: center;
            margin: 20px;
            width: ${width - 40}px;
        `
        return (
            <ButtonContainer>
                <Button title='Edit Profile' type='outline' buttonStyle={{ 
                    borderColor: 'white',
                    borderWidth: 2,
                }} titleStyle={{ color: 'white' }}/>
            </ButtonContainer>
        );
    }

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
        <ProfileScreenContainer>
            <ProfileTopBar creator={user} navigation={navigation} atProfileBase={true} />
            <ProfileScrollView>
                <ProfileHeader />
                <ProfileStatsBar reelayCount={reelayCount} />
                <EditProfileButton />
                <ProfilePosterGrid creatorStacks={creatorStacks} navigation={navigation} />
            </ProfileScrollView>
        </ProfileScreenContainer>
    );
}