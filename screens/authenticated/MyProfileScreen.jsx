import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';

// Logging
import { logAmplitudeEventProd } from "../../components/utils/EventLogger";

// API
import { 
    getFollowers,
    getFollowing,
    getStacksByCreator,
    getStreamingSubscriptions,
} from '../../api/ReelayDBApi';
import { getWatchlistItems } from '../../api/WatchlistApi';
import { getAllMyNotifications } from '../../api/NotificationsApi';

// Components
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileTopBar from '../../components/profile/ProfileTopBar';
import EditProfile from "../../components/profile/EditProfile";
import ProfileHeaderAndInfo from '../../components/profile/ProfileHeaderAndInfo';
import * as ReelayText from '../../components/global/Text';
import TopicsCarousel from '../../components/topics/TopicsCarousel';

// Context
import { AuthContext } from "../../context/AuthContext";
import { useDispatch, useSelector } from 'react-redux';

// Styling
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import ReelayColors from '../../constants/ReelayColors';

const { width } = Dimensions.get('window');

const EditProfileButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    border-color: white;
    border-radius: 20px;
    border-width: 1px;
    height: 40px;
    justify-content: center;
    margin: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width - 32}px;
`
const EditProfileText = styled(ReelayText.Overline)`
    color: white;
`
const MyWatchlistPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    height: 40px;
    justify-content: center;
    margin: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width - 32}px;
`
const MyWatchlistText = styled(ReelayText.Overline)`
    color: white;
`
const ProfileScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const ProfileScrollView = styled(ScrollView)`
    margin-bottom: 60px;
`
const RefreshView = styled(ProfileScreenContainer)`
    align-items: center;
    justify-content: center;
`
const Spacer = styled(View)`
    height: 12px;
`

export default MyProfileScreen = ({ navigation, route }) => {
    const [refreshing, setRefreshing] = useState(false);
	const { reelayDBUser } = useContext(AuthContext); 
    const currentAppLoadStage = useSelector(state => state.currentAppLoadStage);

    const isEditingProfile = useSelector(state => state.isEditingProfile);
    const refreshOnUpload = useSelector(state => state.refreshOnUpload);
    const myFollowers = useSelector(state => state.myFollowers);
    const myFollowing = useSelector(state => state.myFollowing);
    const myCreatorStacks = useSelector(state => state.myCreatorStacks);
    const myStreamingSubscriptions = useSelector(state => state.myStreamingSubscriptions);
  	const dispatch = useDispatch();

    const [renderCount, setRenderCount] = useState(0);
      
    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    })

    useEffect(() => {
        if (refreshOnUpload) {
			dispatch({ type: 'setRefreshOnUpload', payload: false })
            onRefresh();
        }
        logAmplitudeEventProd("openMyProfileScreen", {
            username: reelayDBUser?.username,
            email: reelayDBUser?.email,
        });
    }, []);

    useEffect(() => {
        if (!isEditingProfile) {
            setRenderCount(renderCount + 1);
        }
    }, [isEditingProfile]);

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
                    nextMyStreamingSubscriptions
                ] = await Promise.all([
                    getStacksByCreator(userSub),
                    getFollowers(userSub),
                    getFollowing(userSub),
                    getAllMyNotifications(userSub),
                    getWatchlistItems(userSub),
                    getStreamingSubscriptions(userSub),
                ]);
                
                nextMyCreatorStacks.forEach((stack) => stack.sort(sortReelays));
                nextMyCreatorStacks.sort(sortStacks);
    
                dispatch({ type: 'setMyCreatorStacks', payload: nextMyCreatorStacks });  
                dispatch({ type: 'setMyFollowers', payload: nextMyFollowers });  

                dispatch({ type: 'setMyNotifications', payload: nextMyNotifications });
                dispatch({ type: 'setMyWatchlistItems', payload: nextMyWatchlistItems });
                dispatch({ type: 'setMyFollowing', payload: nextMyFollowing });

                dispatch({ type: 'setMyStreamingSubscriptions', payload: nextMyStreamingSubscriptions });

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
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    const EditProfileButton = () => {
        return (
            <EditProfileButtonPressable onPress={() => {
                dispatch({ type: 'setIsEditingProfile', payload: true });
            }}>
                <EditProfileText>{'Edit profile'}</EditProfileText>
            </EditProfileButtonPressable>
		);
    }

    const SeeMyWatchlistButton = () => {
        const advanceToWatchlistScreen = () => navigation.push('WatchlistScreen');
        return (
            <MyWatchlistPressable onPress={advanceToWatchlistScreen}>
                <MyWatchlistText>{'My watchlist'}</MyWatchlistText>
            </MyWatchlistPressable>
        );
    }

    if (currentAppLoadStage < 3) {
        return (
            <RefreshView>
                <ActivityIndicator />
            </RefreshView>
        )
    }

    return (
		<ProfileScreenContainer>
			{ isEditingProfile && <EditProfile navigation={navigation} refreshProfile={onRefresh} /> }
			<ProfileTopBar creator={reelayDBUser} navigation={navigation} atProfileBase={true} />
			<ProfileScrollView showsVerticalScrollIndicator={false} refreshControl={refreshControl}>
                <ProfileHeaderAndInfo 
					navigation={navigation}
                    creator={reelayDBUser} 
                    bioText={(reelayDBUser.bio) ? reelayDBUser.bio : ""} 
                    websiteText={(reelayDBUser.website) ? reelayDBUser.website : ""} 
                    streamingSubscriptions={myStreamingSubscriptions}
					reelayCount={reelayCount}
					followers={myFollowers}
					following={myFollowing}
                />
				<EditProfileButton />
                <SeeMyWatchlistButton />
                <Spacer />
                <TopicsCarousel 
                    creatorOnProfile={reelayDBUser} 
                    navigation={navigation} 
                    source='profile' 
                />
                <Spacer />
                <ProfilePosterGrid creatorStacks={myCreatorStacks} navigation={navigation} />
			</ProfileScrollView>
		</ProfileScreenContainer>
	);
}

