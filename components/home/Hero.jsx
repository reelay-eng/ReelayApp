import React, { useContext, useState, memo } from 'react';
import { View } from 'react-native';

import FeedVideoPlayer from './FeedVideoPlayer';
import ReelayInfo from './ReelayInfo';
import Sidebar from './Sidebar';

import LikesDrawer from './LikesDrawer';
import CommentsDrawer from './CommentsDrawer';
import Reelay3DotDrawer from './Reelay3DotDrawer';

const HeroOverlay = ({reelay, viewable, navigation}) => {

    const [likesVisible, setLikesVisible] = useState(false);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [dotMenuVisible, setDotMenuVisible] = useState(false);

    return (
      <View>
            <ReelayInfo navigation={navigation} reelay={reelay} />
            {viewable && likesVisible && (
                <LikesDrawer
                    reelay={reelay}
                    navigation={navigation}
                    likesVisible={likesVisible}
                    setLikesVisible={setLikesVisible}
                />
            )}
            {viewable && commentsVisible && (
                <CommentsDrawer
                    reelay={reelay}
                    navigation={navigation}
                    commentsVisible={commentsVisible}
                    setCommentsVisible={setCommentsVisible}
                />
            )}
            {viewable && dotMenuVisible && (
                <Reelay3DotDrawer
                    reelay={reelay}
                    navigation={navigation}
                    dotMenuVisible={dotMenuVisible}
                    setDotMenuVisible={setDotMenuVisible}
                />
            )}
            <Sidebar
                reelay={reelay}
                setLikesVisible={setLikesVisible}
                setCommentsVisible={setCommentsVisible}
                setDotMenuVisible={setDotMenuVisible}
            />
      </View>
    );
}


const Hero = ({ 
    index, 
    isPaused,
    navigation,
    reelay,
    playPause,
    setIsPaused,
    viewable,
}) => {
    console.log('hero re-rendering: ', reelay.title.display);

    return (
        <View key={index} style={{ justifyContent: 'flex-end'}}>
            <FeedVideoPlayer 
                reelay={reelay} viewable={viewable} 
                isPaused={isPaused} playPause={playPause} 
                navigation={navigation}
            />
            <HeroOverlay reelay={reelay} viewable={viewable} navigation={navigation} />
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