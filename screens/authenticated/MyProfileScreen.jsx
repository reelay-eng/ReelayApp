import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';

// Amplitude
import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';

// API
import { getStacksByCreator } from '../../api/ReelayDBApi';
import { getFollowers, getFollowing } from "../../api/ReelayDBApi";

// Components
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileStatsBar from '../../components/profile/ProfileStatsBar';
import ProfileTopBar from '../../components/profile/ProfileTopBar';
import EditProfile from "../../components/profile/EditProfile";
import { BWButton } from "../../components/global/Buttons";


// Context
import { AuthContext } from "../../context/AuthContext";
import { FeedContext } from "../../context/FeedContext";

// Styling

import styled from 'styled-components/native';

export default MyProfileScreen = ({ navigation, route }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
	const { 
        cognitoUser, 
        myFollowers, 
        myFollowing,
        myCreatorStacks,
        reelayDBUser,
        setMyFollowers, 
        setMyFollowing,
        setMyCreatorStacks,
    } = useContext(AuthContext); 

    const { setTabBarVisible } = useContext(FeedContext);

    useEffect(() => {
        setTabBarVisible(true);
    })

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

    const EditProfileButton = () => {
        const Container = styled(View)`
			width: 100%;
			height: 40px;
			display: flex;
			align-items: center;
			justify-content: center;
            margin-bottom: 8px;
		`;
        const EditProfileButtonContainer = styled(View)`
            width: 90%;
            height: 40px;
        `

        return (
			<Container>
				<EditProfileButtonContainer>
					<BWButton
						text="Edit Profile"
						onPress={() => {
                            setIsEditingProfile(true);
						}}
					/>
				</EditProfileButtonContainer>
			</Container>
		);
    }

    return (
        <ProfileScreenContainer>
            <EditProfile isEditingProfile={isEditingProfile} setIsEditingProfile={setIsEditingProfile}/>
            <ProfileTopBar
                creator={cognitoUser}
                navigation={navigation}
                atProfileBase={true}
            />
            <ProfileScrollView refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                <ProfileHeader profilePictureURI={reelayDBUser.profilePictureURI}/>
                <EditProfileButton />
                <ProfileStatsBar
                    navigation={navigation}
                    reelayCount={reelayCount}
                    creator={{
                        username: cognitoUser.username,
                        sub: cognitoUser.attributes.sub,
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