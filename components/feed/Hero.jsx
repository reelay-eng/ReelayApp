import React, { useContext, useRef, memo, useEffect } from 'react';
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

const Hero = ({ index, navigation, reelay, viewable }) => {
    const likesVisible = useSelector(state => state.likesVisible);
    const commentsVisible = useSelector(state => state.commentsVisible);
    const dotMenuVisible = useSelector(state => state.dotMenuVisible);
    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);
    const commentsCount = useRef(reelay.comments.length);
    const { reelayDBUser } = useContext(AuthContext);
    const isWelcomeVideo = (reelay?.sub === Constants.manifest.extra.welcomeReelaySub);

    console.log('Hero is rendering: ', reelayDBUser?.username, reelay.title.display);

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
                console.log('comment id with like attached: ', commentID);
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