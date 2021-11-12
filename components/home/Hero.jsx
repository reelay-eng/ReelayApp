import React, { useContext } from 'react';
import { View } from 'react-native';

import FeedVideoPlayer from './FeedVideoPlayer';
import ReelayInfo from './ReelayInfo';
import Sidebar from './Sidebar';
import { FeedContext } from '../../context/FeedContext';

export default Hero = ({ 
    index, 
    isPaused,
    navigation,
    reelay,
    playPause,
    setIsPaused,
    setReelayOverlay,
    viewable,
}) => {

    const { likesVisible, commentsVisible } = useContext(FeedContext);

    return (
        <View key={index} style={{ justifyContent: 'flex-end'}}>
            <FeedVideoPlayer 
                reelay={reelay} viewable={viewable} 
                isPaused={isPaused} playPause={playPause} 
                setReelayOverlay={setReelayOverlay}
            />
            <ReelayInfo navigation={navigation} reelay={reelay} />
            <Sidebar reelay={reelay} />
            { viewable && likesVisible && <LikesDrawer reelay={reelay} /> }
            { viewable && commentsVisible && <CommentsDrawer reelay={reelay} /> }
        </View>
    );
}