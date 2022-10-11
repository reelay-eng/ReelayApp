import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';

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
import CreateTopicScreen from '../screens/authenticated/CreateTopicScreen';
import EditClubScreen from '../screens/authenticated/EditClubScreen';
import FeedScreen from '../screens/authenticated/FeedScreen';
import NotificationScreen from '../screens/authenticated/NotificationScreen';
import PinAnnouncementScreen from '../screens/authenticated/PinAnnouncementScreen';
import ProfileFeedScreen from '../screens/authenticated/ProfileFeedScreen';
import ReelayCameraScreen from '../screens/authenticated/ReelayCameraScreen';
import ReelayUploadScreen from '../screens/authenticated/ReelayUploadScreen';
import ReportedChatMessagesScreen from '../screens/authenticated/ReportedChatMessagesScreen';
import ReportedReelaysFeedScreen from '../screens/authenticated/ReportedReelaysFeedScreen';
import ReportedTopicsFeedScreen from '../screens/authenticated/ReportedTopicsFeedScreen';
import ReportIssueScreen from '../screens/authenticated/ReportIssueScreen';
import SearchScreen from '../screens/authenticated/SearchScreen';
import SelectTitleScreen from '../screens/authenticated/SelectTitleScreen';
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

export default AuthenticatedCommonStack = ({ children, initialRouteName }) => {
    const CommonStack = createStackNavigator();
    const commonOptions = { headerShown: false };

    return (
        <CommonStack.Navigator initialRouteName={initialRouteName} detachInactiveScreens={false}>
            { children }
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
            <CommonStack.Screen name='CreateTopicScreen' component={CreateTopicScreen} options={commonOptions} />
            <CommonStack.Screen name='EditClubScreen' component={EditClubScreen} options={commonOptions} />
            <CommonStack.Screen name='FeedScreen' component={FeedScreen} options={commonOptions} />
            <CommonStack.Screen name="NotificationScreen" component={NotificationScreen} options={commonOptions} />
            <CommonStack.Screen name='PinAnnouncementScreen' component={PinAnnouncementScreen} options={commonOptions} />
            <CommonStack.Screen name='ProfileFeedScreen' component={ProfileFeedScreen} options={commonOptions} />
            <CommonStack.Screen name='ReportedChatMessagesScreen' component={ReportedChatMessagesScreen} options={commonOptions} />
			<CommonStack.Screen name='ReportedReelaysFeedScreen' component={ReportedReelaysFeedScreen} options={commonOptions} />
            <CommonStack.Screen name='ReportedTopicsFeedScreen' component={ReportedTopicsFeedScreen} options={commonOptions} />
            <CommonStack.Screen name='ReportIssueScreen' component={ReportIssueScreen} options={commonOptions} />
            <CommonStack.Screen name='SearchScreen' component={SearchScreen} options={commonOptions} />
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
        </CommonStack.Navigator>
    );
}
