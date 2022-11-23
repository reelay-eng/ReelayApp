import React, { useContext, useRef, memo, useEffect, useState } from 'react';
import { View } from 'react-native';

import FeedVideoPlayer from './FeedVideoPlayer';
import ReelayInfo from './ReelayInfo';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
import { LinearGradient } from "expo-linear-gradient";

import LikesDrawer from './LikesDrawer';
import CommentsDrawer from './CommentsDrawer';
import Reelay3DotDrawer from './Reelay3DotDrawer';
import JustShowMeSignupDrawer from '../global/JustShowMeSignupDrawer';
import Constants from 'expo-constants';
import { getCommentLikesForReelay } from '../../api/ReelayDBApi';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import FeedTrailerDrawer from './FeedTrailerDrawer';
import { animate } from '../../hooks/animations';
import ShareGuessingGameDrawer from '../games/ShareGuessingGameDrawer';

const BottomGradient = styled(LinearGradient)`
    position: absolute;
    bottom: 0px;
    opacity: 0.8;
    height: 172px;
    width: 100%;
`

const HeroModals = ({ game = null, reelay, navigation }) => {
    const [modalsViewable, setModalsViewable] = useState(false);
    const likesVisible = useSelector(state => state.likesVisible);
    const commentsVisible = useSelector(state => state.commentsVisible);
    const dotMenuVisible = useSelector(state => state.dotMenuVisible);
    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);
    const statsVisible = useSelector(state => state.statsVisible);
    const trailerVisible = (useSelector(state => state.reelayWithVisibleTrailer) === reelay);
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
            { trailerVisible && <FeedTrailerDrawer reelay={reelay} /> }
            { statsVisible && <ShareGuessingGameDrawer game={game} navigation={navigation} /> }
        </React.Fragment>
    );
}

export default Hero = ({ 
    clubStub, 
    feedSource, 
    index, 
    game=null,
    navigation, 
    reelay, 
    showSidebar = true, 
    viewable
}) => {

    const getModalReelay = () => {
        const gameReelayCount = game?.reelays?.length ?? 0;
        if (!gameReelayCount) return reelay;
        return game?.reelays?.[0];
    }

    const modalReelay = getModalReelay();
    const commentsCount = useRef(modalReelay.comments.length);
    const isWelcomeVideo = (reelay?.sub === Constants.manifest.extra.welcomeReelaySub);
    console.log('Hero is rendering: ', reelay.creator.username, reelay.title.display);

    return (
        <View key={index} style={{ justifyContent: 'flex-end'}}>
            <FeedVideoPlayer gameID={game?.id ?? null} navigation={navigation} reelay={reelay} viewable={viewable} />
            <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
            <ReelayInfo clubStub={clubStub} feedSource={feedSource} navigation={navigation} reelay={reelay} />
            { !isWelcomeVideo && showSidebar && (
                <Sidebar 
                    commentsCount={commentsCount}
                    game={game}
                    navigation={navigation} 
                    reelay={modalReelay} 
                />
            )}
            { viewable && <HeroModals game={game} reelay={modalReelay} navigation={navigation} /> }
        </View>
    );
}
