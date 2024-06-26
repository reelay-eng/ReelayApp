import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import AllGamesScreen from '../screens/authenticated/AllGamesScreen';
import ClubAcceptInviteScreen from '../screens/authenticated/ClubAcceptInviteScreen';
import ClubActivityScreen from '../screens/authenticated/ClubActivityScreen';
import ClubAddTitleScreen from '../screens/authenticated/ClubAddTitleScreen';
import ClubFeedScreen from '../screens/authenticated/ClubFeedScreen';
import ClubInfoScreen from '../screens/authenticated/ClubInfoScreen';
import ClubJoinFromLinkScreen from '../screens/authenticated/ClubJoinFromLinkScreen';
import ClubMediaScreen from '../screens/authenticated/ClubMediaScreen';
import ClubStainedGlassScreen from '../screens/authenticated/ClubStainedGlassScreen';
import CreateClubScreen from '../screens/authenticated/CreateClubScreen';
import CreateClubPart2Screen from '../screens/authenticated/CreateClubPart2Screen';
import CreateClubPart3Screen from '../screens/authenticated/CreateClubPart3Screen';
import CreateGuessingGameScreen from '../screens/authenticated/CreateGuessingGameScreen';
import CreateGuessingGameCluesScreen from '../screens/authenticated/CreateGuessingGameCluesScreen';
import CreateTopicScreen from '../screens/authenticated/CreateTopicScreen';
import CreateListScreen from '../screens/authenticated/CreateListScreen';
import EditClubScreen from '../screens/authenticated/EditClubScreen';
import FeedScreen from '../screens/authenticated/FeedScreen';
import GuessingGameFeedScreen from '../screens/authenticated/GuessingGameFeedScreen';
import NotificationScreen from '../screens/authenticated/NotificationScreen';
import PinAnnouncementScreen from '../screens/authenticated/PinAnnouncementScreen';
import ProfileFeedScreen from '../screens/authenticated/ProfileFeedScreen';
import ReelayCameraScreen from '../screens/authenticated/ReelayCameraScreen';
import ReelayUploadScreen from '../screens/authenticated/ReelayUploadScreen';
import ReelayListScreen from '../screens/authenticated/ReelayListScreen';
import ReportedChatMessagesScreen from '../screens/authenticated/ReportedChatMessagesScreen';
import ReportedReelaysFeedScreen from '../screens/authenticated/ReportedReelaysFeedScreen';
import ReportedTopicsFeedScreen from '../screens/authenticated/ReportedTopicsFeedScreen';
import ReportIssueScreen from '../screens/authenticated/ReportIssueScreen';
import SearchScreen from '../screens/authenticated/SearchScreen';
import SelectTitleScreen from '../screens/authenticated/SelectTitleScreen';
import InstaStoryClubScreen from '../screens/authenticated/InstaStoryClubScreen';
import InstaStoryGuessingGameScreen from '../screens/authenticated/InstaStoryGuessingGameScreen';
import InstaStoryReelayScreen from '../screens/authenticated/InstaStoryReelayScreen';
import SeeAllTitleReactionsScreen from '../screens/authenticated/SeeAllTitleReactionsScreen';
import SelectCorrectGuessScreen from '../screens/authenticated/SelectCorrectGuessScreen';
import SingleGuessingGameScreen from '../screens/authenticated/SingleGuessingGameScreen';
import SingleReelayScreen from '../screens/authenticated/SingleReelayScreen';
import SingleTopicScreen from '../screens/authenticated/SingleTopicScreen';
import TitleDetailScreen from '../screens/authenticated/TitleDetailScreen';
import TitleFeedScreen from '../screens/authenticated/TitleFeedScreen';
import TitleTrailerScreen from '../screens/authenticated/TitleTrailerScreen';
import TopicsFeedScreen from '../screens/authenticated/TopicsFeedScreen';
import TopicsListScreen from '../screens/authenticated/TopicsListScreen';
import WatchlistScreen from '../screens/authenticated/WatchlistScreen';
import UserFollowScreen from '../screens/authenticated/UserFollowScreen';
import UserProfileFromLinkScreen from '../screens/authenticated/UserProfileFromLinkScreen';
import UserProfileScreen from '../screens/authenticated/UserProfileScreen';
import VenueSelectScreen from '../screens/authenticated/VenueSelectScreen';
import MyClubsScreen from '../screens/authenticated/MyClubsScreen';
import ReferShareScreen from '../screens/authenticated/ReferShareScreen';
import SearchTitleScreen from '../screens/unauthenticated/SearchScreen';
import SelectMovieScreen from '../screens/unauthenticated/SelectMovieScreen';
import ListMovieScreen from '../components/lists/ListMovieScreen';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../components/utils/EventLogger';

export default AuthenticatedCommonStack = ({ children, initialRouteName }) => {
    try {
        firebaseCrashlyticsLog('Authenticated common stack');
        const CommonStack = createStackNavigator();
        const commonOptions = { headerShown: false };

        return (
            <CommonStack.Navigator initialRouteName={initialRouteName} detachInactiveScreens={false}>
                {children}
                <CommonStack.Screen name='AllGamesScreen' component={AllGamesScreen} options={commonOptions} />
                <CommonStack.Screen name='ClubJoinFromLinkScreen' component={ClubJoinFromLinkScreen} options={commonOptions} />
                <CommonStack.Screen name='ClubActivityScreen' component={ClubActivityScreen} options={commonOptions} />
                <CommonStack.Screen name='ClubAcceptInviteScreen' component={ClubAcceptInviteScreen} options={commonOptions} />
                <CommonStack.Screen name='ClubAddTitleScreen' component={ClubAddTitleScreen} options={commonOptions} />
                <CommonStack.Screen name='ClubFeedScreen' component={ClubFeedScreen} options={commonOptions} />
                <CommonStack.Screen name='ClubInfoScreen' component={ClubInfoScreen} options={commonOptions} />
                <CommonStack.Screen name='ClubMediaScreen' component={ClubMediaScreen} options={commonOptions} />
                <CommonStack.Screen name='ClubStainedGlassScreen' component={ClubStainedGlassScreen} options={commonOptions} />
                <CommonStack.Screen name='CreateClubScreen' component={CreateClubScreen} options={commonOptions} />
                <CommonStack.Screen name='CreateClubPart2Screen' component={CreateClubPart2Screen} options={commonOptions} />
                <CommonStack.Screen name='CreateClubPart3Screen' component={CreateClubPart3Screen} options={commonOptions} />
                <CommonStack.Screen name='CreateGuessingGameScreen' component={CreateGuessingGameScreen} options={commonOptions} />
                <CommonStack.Screen name='CreateGuessingGameCluesScreen' component={CreateGuessingGameCluesScreen} options={commonOptions} />
                <CommonStack.Screen name='CreateTopicScreen' component={CreateTopicScreen} options={commonOptions} />
                <CommonStack.Screen name='CreateListScreen' component={CreateListScreen} options={commonOptions} />
                <CommonStack.Screen name='EditClubScreen' component={EditClubScreen} options={commonOptions} />
                <CommonStack.Screen name='FeedScreen' component={FeedScreen} options={commonOptions} />
                <CommonStack.Screen name='GuessingGameFeedScreen' component={GuessingGameFeedScreen} options={{gestureEnabled: false,headerShown: false}}/>
                <CommonStack.Screen name='InstaStoryClubScreen' component={InstaStoryClubScreen} options={commonOptions} />
                <CommonStack.Screen name='InstaStoryGuessingGameScreen' component={InstaStoryGuessingGameScreen} options={commonOptions} />
                <CommonStack.Screen name='InstaStoryReelayScreen' component={InstaStoryReelayScreen} options={commonOptions} />
                <CommonStack.Screen name="NotificationScreen" component={NotificationScreen} options={commonOptions} />
                <CommonStack.Screen name='PinAnnouncementScreen' component={PinAnnouncementScreen} options={commonOptions} />
                <CommonStack.Screen name='ProfileFeedScreen' component={ProfileFeedScreen} options={commonOptions} />
                <CommonStack.Screen name='ReportedChatMessagesScreen' component={ReportedChatMessagesScreen} options={commonOptions} />
                <CommonStack.Screen name='ReportedReelaysFeedScreen' component={ReportedReelaysFeedScreen} options={commonOptions} />
                <CommonStack.Screen name='ReportedTopicsFeedScreen' component={ReportedTopicsFeedScreen} options={commonOptions} />
                <CommonStack.Screen name='ReportIssueScreen' component={ReportIssueScreen} options={commonOptions} />
                <CommonStack.Screen name='ReelayListScreen' component={ReelayListScreen} options={commonOptions} />
                <CommonStack.Screen name='SearchScreen' component={SearchScreen} options={commonOptions} />
                <CommonStack.Screen name='SeeAllTitleReactionsScreen' component={SeeAllTitleReactionsScreen} options={commonOptions} />
                <CommonStack.Screen name='SelectCorrectGuessScreen' component={SelectCorrectGuessScreen} options={commonOptions} />
                <CommonStack.Screen name='SingleGuessingGameScreen' component={SingleGuessingGameScreen} options={commonOptions} />
                <CommonStack.Screen name='SingleReelayScreen' component={SingleReelayScreen} options={commonOptions} />
                <CommonStack.Screen name='SingleTopicScreen' component={SingleTopicScreen} options={commonOptions} />
                <CommonStack.Screen name='TitleDetailScreen' component={TitleDetailScreen} options={commonOptions} />
                <CommonStack.Screen name='TitleFeedScreen' component={TitleFeedScreen} options={commonOptions} />
                <CommonStack.Screen name='TitleTrailerScreen' component={TitleTrailerScreen} options={commonOptions} />
                <CommonStack.Screen name='TopicsFeedScreen' component={TopicsFeedScreen} options={commonOptions} />
                <CommonStack.Screen name='TopicsListScreen' component={TopicsListScreen} options={commonOptions} />
                <CommonStack.Screen name='UserProfileScreen' component={UserProfileScreen} options={commonOptions} />
                <CommonStack.Screen name='UserProfileFromLinkScreen' component={UserProfileFromLinkScreen} options={commonOptions} />
                <CommonStack.Screen name='UserFollowScreen' component={UserFollowScreen} options={commonOptions} />
                <CommonStack.Screen name='SelectTitleScreen' component={SelectTitleScreen} options={commonOptions} />
                <CommonStack.Screen name='VenueSelectScreen' component={VenueSelectScreen} options={commonOptions} />
                <CommonStack.Screen name='ReelayCameraScreen' component={ReelayCameraScreen} options={commonOptions} />
                <CommonStack.Screen name='ReelayUploadScreen' component={ReelayUploadScreen} options={commonOptions} />
                <CommonStack.Screen name='WatchlistScreen' component={WatchlistScreen} options={commonOptions} />
                <CommonStack.Screen name='MyClubsScreen' component={MyClubsScreen} options={commonOptions} />
                <CommonStack.Screen name='ReferShareScreen' component={ReferShareScreen} options={commonOptions} />
                <CommonStack.Screen name="SearchTitleScreen" component={SearchTitleScreen} options={commonOptions} />
                <CommonStack.Screen name="SelectMovieScreen" component={SelectMovieScreen} options={commonOptions} />
                <CommonStack.Screen name="ListMovieScreen" component={ListMovieScreen} options={commonOptions} />
            </CommonStack.Navigator>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}
