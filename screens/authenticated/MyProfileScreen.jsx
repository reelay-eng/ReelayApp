import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View, Linking } from 'react-native';
import { Autolink } from "react-native-autolink";
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';

// Logging
import { logAmplitudeEventProd } from "../../components/utils/EventLogger";

// API
import { 
    refreshMyFollowers, 
    refreshMyFollowing, 
    refreshMyNotifications, 
    refreshMyReelayStacks, 
    refreshMyWatchlist 
} from '../../api/ReelayUserApi';

// Components
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileStatsBar from '../../components/profile/ProfileStatsBar';
import ProfileTopBar from '../../components/profile/ProfileTopBar';
import EditProfile from "../../components/profile/EditProfile";
import { BWButton } from "../../components/global/Buttons";
import * as ReelayText from "../../components/global/Text";

// Context
import { AuthContext } from "../../context/AuthContext";
import { useDispatch, useSelector } from 'react-redux';

// Styling
import styled from 'styled-components/native';
import store from '../../redux/store';

export default MyProfileScreen = ({ navigation, route }) => {
    const HeaderContainer = styled(View)`
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        flex-direction: row;
    `
    const ProfileScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `;
    const ProfileScrollView = styled(ScrollView)`
        margin-bottom: 60px;
    `;
    const UserInfoContainer = styled(View)`
        align-self: center;
        width: 72%;
        padding-top: 10px;
    `;
    // should have same style as: ReelayText.Subtitle1
    const BioText = styled(Autolink)` 
        color: white;
        text-align: left;
        padding-bottom: 3px;
        font-family: Outfit-Regular;
        font-size: 14px;
        font-style: normal;
        line-height: 20px;
        letter-spacing: 0.1px;
    `;
    const WebsiteText = styled(ReelayText.Subtitle2)`
        color: 'rgb(51,102,187)';
        text-align: left;
        padding-bottom: 5px;
    `;

    const [refreshing, setRefreshing] = useState(false);
	const { 
        reelayDBUser,
    } = useContext(AuthContext); 

    const signedIn = useSelector(state => state.signedIn);
    const refreshOnUpload = useSelector(state => state.refreshOnUpload);
    const myFollowers = useSelector(state => state.myFollowers);
    const myFollowing = useSelector(state => state.myFollowing);
    const myCreatorStacks = useSelector(state => state.myCreatorStacks);
  	const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
        if (refreshOnUpload) {
			dispatch({ type: 'setRefreshOnUpload', payload: false })
            onRefresh();
        }
    });

    useEffect(() => {
        logAmplitudeEventProd("openMyProfileScreen", {
            username: reelayDBUser?.username,
            email: reelayDBUser?.email,
        });
    }, []);

    useEffect(() => {
        logAmplitudeEventProd('viewMyProfile', {
            username: reelayDBUser?.username,
        });    
    }, []);

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText='My Reelays' />
    }

    if (!reelayDBUser) {
        return (
            <ProfileTopBar atProfileBase={true} creator={{ username: 'User not found' }} 
                navigation={navigation} />
        );
    }


    const onRefresh = async () => {
        const userSub = reelayDBUser?.sub;
        if (userSub.length) {
            console.log('Now refreshing');
            setRefreshing(true);
            try {
                const [
                    nextMyCreatorStacks,
                    nextMyFollowers,
                    nextMyFollowing,
                    nextMyNotifications,
                    nextMyWatchlistItems,
                ] = await Promise.all([
                    refreshMyReelayStacks(userSub),
                    refreshMyFollowers(userSub),
                    refreshMyFollowing(userSub),
                    refreshMyNotifications(userSub),
                    refreshMyWatchlist(userSub),
                ]);
                
                nextMyCreatorStacks.forEach((stack) => stack.sort(sortReelays));
                nextMyCreatorStacks.sort(sortStacks);
    
                dispatch({ type: 'setMyCreatorStacks', payload: nextMyCreatorStacks });  
                dispatch({ type: 'setMyFollowers', payload: nextMyFollowers });  

                dispatch({ type: 'setMyNotifications', payload: nextMyNotifications });
                dispatch({ type: 'setMyWatchlistItems', payload: nextMyWatchlistItems });
                dispatch({ type: 'setMyFollowing', payload: nextMyFollowing });

                console.log('Refresh complete');
            } catch (error) {
                console.log(error);
            }
            setRefreshing(false);
        }
    }

    const sortReelays = (reelay1, reelay2) => reelay2.postedDateTime - reelay1.postedDateTime;
    const sortStacks = (stack1, stack2) => stack2[0].postedDateTime - stack1[0].postedDateTime;
    const reelayCounter = (sum, nextStack) => sum + nextStack.length;
    const reelayCount = myCreatorStacks.reduce(reelayCounter, 0);

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
            width: 80%;
            height: 40px;
        `

        return (
			<Container>
				<EditProfileButtonContainer>
					<BWButton
						text="Edit Profile"
						onPress={() => {
                            dispatch({ type: 'setIsEditingProfile', payload: true });
						}}
					/>
				</EditProfileButtonContainer>
			</Container>
		);
    }

    const fixLink = (link) => {
        if (link.startsWith('https://') || link.startsWith('http://')) {
            return link;
        } else {
            return 'https://'+link;
        }
    }

    return (
		<ProfileScreenContainer>
			<EditProfile/>
			<ProfileTopBar creator={reelayDBUser} navigation={navigation} atProfileBase={true} />
			<ProfileScrollView refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                <HeaderContainer>
                    <ProfileHeader creator={reelayDBUser} />
                    <UserInfoContainer>
                        {reelayDBUser?.bio && (
                            <BioText 
                                text={reelayDBUser?.bio?.trim() ?? ''} 
                                linkStyle={{ color: '#3366BB' }} 
                                url
                            /> 
                        )}
                        {reelayDBUser?.website && (
                            <WebsiteText onPress={() => Linking.openURL(fixLink(reelayDBUser.website))}> {reelayDBUser.website} </WebsiteText>
                        )}
                    </UserInfoContainer>
                </HeaderContainer>
				<EditProfileButton />
				<ProfileStatsBar
					navigation={navigation}
					reelayCount={reelayCount}
					creator={{
						username: reelayDBUser.username,
						sub: reelayDBUser?.sub,
					}}
					followers={myFollowers}
					following={myFollowing}
					prevScreen={"MyProfileScreen"}
				/>
				<ProfilePosterGrid creatorStacks={myCreatorStacks} navigation={navigation} />
			</ProfileScrollView>
		</ProfileScreenContainer>
	);
}