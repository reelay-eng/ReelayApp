import React, { useContext, useRef, memo, useEffect } from 'react';
import { View } from 'react-native';

import FeedVideoPlayer from './FeedVideoPlayer';
import ReelayInfo from './ReelayInfo';
import Sidebar from './Sidebar';
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import { checkShouldMarkSeen } from '../utils/UnreadReelays';

import LikesDrawer from './LikesDrawer';
import CommentsDrawer from './CommentsDrawer';
import Reelay3DotDrawer from './Reelay3DotDrawer';
import JustShowMeSignupDrawer from '../global/JustShowMeSignupDrawer';
import Constants from 'expo-constants';
import { useSelector } from 'react-redux';

const Hero = ({ index, navigation, reelay, viewable }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const myFollowing = useSelector(state => state.myFollowing);
    const { likesVisible, commentsVisible, dotMenuVisible, justShowMeSignupVisible } = useContext(FeedContext);
    const commentsCount = useRef(reelay?.comments?.length);
    const isWelcomeVideo = (reelay?.sub === Constants.manifest.extra.welcomeReelaySub);

    useEffect(() => {
        checkShouldMarkSeen({ reelay, reelayDBUser, myFollowing });
    }, [viewable]);

    console.log('Hero is rendering: ', reelayDBUser?.username, reelay.title.display);

    return (
        <View key={index} style={{ justifyContent: 'flex-end'}}>
            <FeedVideoPlayer reelay={reelay} viewable={viewable} />
            <ReelayInfo navigation={navigation} reelay={reelay} />
            { !isWelcomeVideo && <Sidebar navigation={navigation} reelay={reelay} commentsCount={commentsCount}/> }
            { viewable && likesVisible && <LikesDrawer reelay={reelay} navigation={navigation} /> }
            { viewable && commentsVisible && <CommentsDrawer reelay={reelay} navigation={navigation} commentsCount={commentsCount} /> }
            { viewable && dotMenuVisible && <Reelay3DotDrawer reelay={reelay} navigation={navigation} /> }
            { viewable && justShowMeSignupVisible && <JustShowMeSignupDrawer navigation={navigation} /> }
        </View>
    );
}

const areEqual = (prevProps, nextProps) => {
    return (prevProps.viewable === nextProps.viewable);
}

export default memo(Hero, areEqual);