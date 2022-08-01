import React, { useEffect, useState, useContext } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, Linking, View } from 'react-native';
import { Autolink } from "react-native-autolink";
import { useSelector } from 'react-redux';

import { getStacksByCreator, getRegisteredUser, getFollowers, getFollowing, getStreamingSubscriptions } from '../../api/ReelayDBApi';

import FollowButtonBar from '../../components/profile/Follow/FollowButtonBar';
import JustShowMeSignupDrawer from '../../components/global/JustShowMeSignupDrawer';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileTopBar from '../../components/profile/ProfileTopBar';
import ProfileHeaderAndInfo from '../../components/profile/ProfileHeaderAndInfo';
import TopicsCarousel from '../../components/topics/TopicsCarousel';

import { AuthContext } from '../../context/AuthContext';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import styled from 'styled-components/native';

const ProfileScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const ProfileScrollView = styled(ScrollView)`
    margin-bottom: 60px;
`
const Spacer = styled(View)`
    height: 12px;
`

export default UserProfileScreen = ({ navigation, route }) => {
    const { creator } = route.params;
    const { sub, username } = creator; // these are the only fields you need to pass in

    const [creatorInfo, setCreatorInfo] = useState({});
    const [creatorStacks, setCreatorStacks] = useState([]);
    const [creatorFollowers, setCreatorFollowers] = useState([]);
    const [creatorFollowing, setCreatorFollowing] = useState([]);
    const [streamingSubscriptions, setStreamingSubscriptions] = useState([]);
    const [refreshing, setRefreshing] = useState(true);

    const { reelayDBUser } = useContext(AuthContext);
	const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);
    const creatorSub = sub ?? '';

    const loadCreatorInfo = async () => {
        const creatorInfo = await getRegisteredUser(creatorSub);
        setCreatorInfo(creatorInfo);
    }

    const loadCreatorStacks = async () => {
        const nextCreatorStacks = await getStacksByCreator(creatorSub);
        nextCreatorStacks.forEach(stack => stack.sort(sortReelays));

        nextCreatorStacks.sort(sortStacks);
        setCreatorStacks(nextCreatorStacks);
    }

    const loadFollows = async () => {
        const [nextFollowers, nextFollowing] = await Promise.all([
            getFollowers(creatorSub),
            getFollowing(creatorSub),
        ]);
        setCreatorFollowers(nextFollowers);
        setCreatorFollowing(nextFollowing);
    };

    const loadUserStreamingSubscriptions = async () => {
        const subscriptions = await getStreamingSubscriptions(creator.sub);
        setStreamingSubscriptions(subscriptions);
    }

    const onRefresh = async () => {
        if (!refreshing) {
            setRefreshing(true);
        }

        if (creatorSub.length) {
            await Promise.all([
                loadCreatorInfo(),
                loadCreatorStacks(),
                loadFollows(),
                loadUserStreamingSubscriptions(),
            ])
        }
        setRefreshing(false);
    }

    useEffect(() => {
        onRefresh();
        logAmplitudeEventProd('viewProfile', {
            username: reelayDBUser?.username,
            creatorName: username,
        });    
    }, []);
    const isMyProfile = (creatorSub === reelayDBUser?.sub);

    const sortReelays = (reelay1, reelay2) => reelay2.postedDateTime - reelay1.postedDateTime;
    const sortStacks = (stack1, stack2) => stack2[0].postedDateTime - stack1[0].postedDateTime;
    const reelayCounter = (sum, nextStack) => sum + nextStack.length;
    const reelayCount = creatorStacks.reduce(reelayCounter, 0);
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    return (
        <ProfileScreenContainer>
            <ProfileTopBar creator={creator} navigation={navigation} />
            <ProfileScrollView showsVerticalScrollIndicator={false} refreshControl={refreshControl}>
                <ProfileHeaderAndInfo 
                    navigation={navigation}
                    creator={{ ...creator, ...creatorInfo }} 
                    streamingSubscriptions={streamingSubscriptions}
                    reelayCount={reelayCount}
                    followers={creatorFollowers}
                    following={creatorFollowing}
                />
                {!isMyProfile && <FollowButtonBar creator={creator} bar /> }
                <Spacer />
                <TopicsCarousel navigation={navigation} source='profile' creatorOnProfile={creator} />
                <Spacer />
                <ProfilePosterGrid
                    creatorStacks={creatorStacks}
                    navigation={navigation}
                />
            </ProfileScrollView>
            { justShowMeSignupVisible && <JustShowMeSignupDrawer navigation={navigation} />}
        </ProfileScreenContainer>
    );
}