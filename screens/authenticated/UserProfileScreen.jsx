import React, { useEffect, useState, useContext } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, Linking, View } from 'react-native';
import { Autolink } from "react-native-autolink";

import { getStacksByCreator, getRegisteredUser, getFollowers, getFollowing } from '../../api/ReelayDBApi';

import Constants from 'expo-constants';
import FollowButtonBar from '../../components/profile/Follow/FollowButtonBar';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileStatsBar from '../../components/profile/ProfileStatsBar';
import ProfileTopBar from '../../components/profile/ProfileTopBar';
import * as ReelayText from "../../components/global/Text";
import { AuthContext } from '../../context/AuthContext';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import styled from 'styled-components/native';



const UserInfoContainer = styled(View)`
    align-self: center;
    width: 75%;
    padding-bottom: 10px;
`;
const BioText = styled(Autolink)`
    color: white;
    text-align: center;
    padding-bottom: 5px;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    line-height: 24px;
    letter-spacing: 0.15px;
`;
const WebsiteText = styled(ReelayText.Subtitle1)`
    color: "rgb(51,102,187)";
    text-align: center;
    padding-bottom: 5px;
`;

const ProfileScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const ProfileScrollView = styled(ScrollView)`
    margin-bottom: 60px;
`

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

export default UserProfileScreen = ({ navigation, route }) => {
    const [creatorStacks, setCreatorStacks] = useState([]);
    const [creatorFollowers, setCreatorFollowers] = useState([]);
    const [creatorFollowing, setCreatorFollowing] = useState([]);
    const [bioText, setBioText] = useState("");
    const [websiteText, setWebsiteText] = useState("")
    const [refreshing, setRefreshing] = useState(true);

    const { cognitoUser } = useContext(AuthContext);
    const { creator } = route.params;
    const creatorSub = creator.sub ?? '';
    const creatorProfilePictureURI = creatorSub.length > 0 ? `${CLOUDFRONT_BASE_URL}/public/profilepic-${creatorSub}-current.jpg` : null;

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

    const loadUserInformation = async () => {
        const creatorInfo = await getRegisteredUser(creatorSub);
        setBioText(creatorInfo.bio ? creatorInfo.bio : "");
        setWebsiteText(creatorInfo.website ? creatorInfo.website : "")
    }

    const onRefresh = async () => {
        if (!refreshing) {
            setRefreshing(true);
        }

        if (creatorSub.length) {
            await loadCreatorStacks();
            await loadFollows();
            await loadUserInformation();
        }
        setRefreshing(false);
    }

    useEffect(() => {
        onRefresh();
        logAmplitudeEventProd('viewProfile', {
            username: cognitoUser?.attributes?.username,
            creatorName: creator.username,
        });    
    }, []);

    const isMyProfile = (creatorSub === cognitoUser?.attributes?.sub);

    const sortReelays = (reelay1, reelay2) => reelay2.postedDateTime - reelay1.postedDateTime;
    const sortStacks = (stack1, stack2) => stack2[0].postedDateTime - stack1[0].postedDateTime;
    const reelayCounter = (sum, nextStack) => sum + nextStack.length;
    const reelayCount = creatorStacks.reduce(reelayCounter, 0);

    return (
        <ProfileScreenContainer>
            <ProfileTopBar creator={creator} navigation={navigation} />
            <ProfileScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                >
                <ProfileHeader profilePictureURI={creatorProfilePictureURI} />
                <UserInfoContainer>
                    {bioText !== "" && (
                        <BioText
                        text={bioText.trim()}
                        linkStyle={{ color: "#3366BB" }}
                        url
                        />
                    )}
                    {websiteText !== "" && (
                        <WebsiteText onPress={() => Linking.openURL(websiteText)}>
                        {" "}
                        {websiteText}{" "}
                        </WebsiteText>
                    )}
                </UserInfoContainer>

                <ProfileStatsBar
                    navigation={navigation}
                    reelayCount={reelayCount}
                    creator={creator}
                    followers={creatorFollowers}
                    following={creatorFollowing}
                    prevScreen={"UserProfileScreen"}
                />
                {!isMyProfile && (
                    <FollowButtonBar
                    creator={creator}
                    creatorFollowers={creatorFollowers}
                    setCreatorFollowers={setCreatorFollowers}
                    />
                )}
                <ProfilePosterGrid
                    creatorStacks={creatorStacks}
                    navigation={navigation}
                />
            </ProfileScrollView>
        </ProfileScreenContainer>
    );
}