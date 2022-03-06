import React, { useContext, useRef, memo } from 'react';
import { View } from 'react-native';

import FeedVideoPlayer from './FeedVideoPlayer';
import ReelayInfo from './ReelayInfo';
import Sidebar from './Sidebar';
import { FeedContext } from '../../context/FeedContext';

import LikesDrawer from './LikesDrawer';
import CommentsDrawer from './CommentsDrawer';
import Reelay3DotDrawer from './Reelay3DotDrawer';

const Hero = ({ 
    index, 
    isPaused,
    navigation,
    reelay,
    playPause,
    viewable,
}) => {

    const { likesVisible, commentsVisible, dotMenuVisible } = useContext(FeedContext);
    console.log('hero re-rendering: ', reelay.title.display);
    const commentsCount = useRef(reelay.comments.length);

    return (
        <View key={index} style={{ justifyContent: 'flex-end'}}>
            <FeedVideoPlayer 
                reelay={reelay} viewable={viewable} 
                isPaused={isPaused} playPause={playPause} 
            />
            <ReelayInfo navigation={navigation} reelay={reelay} />
            <Sidebar navigation={navigation} reelay={reelay} commentsCount={commentsCount}/>
            { viewable && likesVisible && <LikesDrawer reelay={reelay} navigation={navigation} /> }
            { viewable && commentsVisible && <CommentsDrawer reelay={reelay} navigation={navigation} commentsCount={commentsCount} /> }
            { viewable && dotMenuVisible && 
                <Reelay3DotDrawer 
                    reelay={reelay} 
                    navigation={navigation}
                /> 
            }
        </View>
    );
}

const areEqual = (prevProps, nextProps) => {
    return (
        prevProps.isPaused === nextProps.isPaused &&
        prevProps.viewable === nextProps.viewable
    );
}

export default memo(Hero, areEqual);