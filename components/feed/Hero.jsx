import React, { useContext, useRef, memo, useEffect, useState } from 'react';
import { View } from 'react-native';

import FeedVideoPlayer from './FeedVideoPlayer';
import ReelayInfo from './ReelayInfo';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';

import LikesDrawer from './LikesDrawer';
import CommentsDrawer from './CommentsDrawer';
import Reelay3DotDrawer from './Reelay3DotDrawer';
import JustShowMeSignupDrawer from '../global/JustShowMeSignupDrawer';
import Constants from 'expo-constants';
import { getCommentLikesForReelay } from '../../api/ReelayDBApi';
import { useFocusEffect } from '@react-navigation/native';

const HeroModals = ({ reelay, navigation }) => {
    const [modalsViewable, setModalsViewable] = useState(false);
    const likesVisible = useSelector(state => state.likesVisible);
    const commentsVisible = useSelector(state => state.commentsVisible);
    const dotMenuVisible = useSelector(state => state.dotMenuVisible);
    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);
    const { reelayDBUser } = useContext(AuthContext);

    useFocusEffect(() => {
        setModalsViewable(true);
        return () => setModalsViewable(false);
    });

    const addLikesToComment = (commentID, commentLikeObj) => {
        const matchCommentID = (nextCommentObj) => (nextCommentObj.id === commentID);
        const commentObj = reelay?.comments?.find(matchCommentID);
        commentObj.likes = commentLikeObj;
    }

    const loadCommentLikes = async () => {
        const commentLikes = await getCommentLikesForReelay(reelay.sub, reelayDBUser?.sub);
        const singleReelayEntry = commentLikes?.reelays?.[reelay.sub];
        if (singleReelayEntry) {
            const commentEntries = singleReelayEntry?.comments;
            if (!commentEntries) {
                console.log('error: could not load comment entries');
                return;
            }
            const commentIDs = Object.keys(commentEntries);
            commentIDs.forEach((commentID) => {
                const commentLikeObj = commentEntries[commentID];
                addLikesToComment(commentID, commentLikeObj);
            })
        }
        reelay.commentLikesLoaded = true;
    }

    useEffect(() => {
        if (reelay?.commentLikesLoaded) return;
        loadCommentLikes();
    }, []);

    if (!modalsViewable) return <View />;

    return (
        <React.Fragment>
            { likesVisible && <LikesDrawer reelay={reelay} navigation={navigation} /> }
            { commentsVisible && <CommentsDrawer reelay={reelay} navigation={navigation} /> }
            { dotMenuVisible && <Reelay3DotDrawer reelay={reelay} navigation={navigation} /> }
            { justShowMeSignupVisible && <JustShowMeSignupDrawer navigation={navigation} /> }
        </React.Fragment>
    );
}

export default Hero = ({ index, navigation, reelay, viewable }) => {
    const commentsCount = useRef(reelay.comments.length);
    const isWelcomeVideo = (reelay?.sub === Constants.manifest.extra.welcomeReelaySub);

    if (viewable) {
        console.log('Hero is viewable: ', reelay.creator.username, reelay.title.display);
    }

    return (
        <View key={index} style={{ justifyContent: 'flex-end'}}>
            <FeedVideoPlayer reelay={reelay} viewable={viewable} />
            <ReelayInfo navigation={navigation} reelay={reelay} />
            { !isWelcomeVideo && <Sidebar navigation={navigation} reelay={reelay} commentsCount={commentsCount}/> }
            { viewable && <HeroModals reelay={reelay} navigation={navigation} /> }
        </View>
    );
}