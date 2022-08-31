import React, { useContext, useState, memo, useRef } from 'react';
import { Dimensions, FlatList, SafeAreaView, TouchableOpacity, View } from 'react-native';
import Hero from '../feed/Hero';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';
import UploadProgressBar from '../global/UploadProgressBar';
import TitleBanner from '../feed/TitleBanner';
import TopicBanner from './TopicBanner';

const { height, width } = Dimensions.get('window');

const BannerContainer = styled(View)`
    top: ${(props) => props.offset}px;
    align-items: center;
    margin-top: 10px;
    position: absolute;
    width: 100%;
`
const ReelayFeedContainer = styled(View)`
    align-items: center;
    background-color: black;
    height: ${height}px;
    width: ${width}px;
`

export default TopicStack = ({ 
    initialStackPos = 0,
    navigation,
    onRefresh,
    stackViewable,
    topic,  
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const stack = topic.reelays;
    const [stackPosition, setStackPosition] = useState(initialStackPos);

    const viewableReelay = stack[stackPosition];
    const stackRef = useRef(null);
    const uploadStage = useSelector(state => state.uploadStage);
    const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
    const showProgressBar = showProgressBarStages.includes(uploadStage);
    const topOffset = useSafeAreaInsets().top + 28;

    const getItemLayout = (data, index) => ({
        length: width, 
        offset: width * index, index,
        index: index,
    });

    const renderReelay = ({ item, index }) => {
        const reelay = item;
        const reelayViewable = stackViewable && (index === stackPosition);  
        
        return (
            <ReelayFeedContainer key={reelay.id}>
                <Hero 
                    index={index} 
                    navigation={navigation} 
                    reelay={reelay} 
                    viewable={reelayViewable}
                />
            </ReelayFeedContainer>
        );
    };

    const onStackSwiped = (e) => {
        const { x, y } = e.nativeEvent.contentOffset;
        const nextStackPosition = Math.round(x / width);
        if (stackPosition === nextStackPosition) return;
        
        const swipeDirection = nextStackPosition < stackPosition ? 'left' : 'right';
        const nextReelay = stack[nextStackPosition];
        const prevReelay = stack[stackPosition];
        const logProperties = {
            nextReelayCreator: nextReelay.creator.username,
            nextReelayTitle: nextReelay.title.display,
            prevReelayCreator: prevReelay.creator.username,
            prevReelayTitle: prevReelay.title.display,
            source: 'stack',
            swipeDirection: swipeDirection,
            username: reelayDBUser?.username,
        }
        logAmplitudeEventProd('swipedFeed', logProperties);
        setStackPosition(nextStackPosition);
    }

    return (
        <ReelayFeedContainer>
            <FlatList 
                data={stack} 
                horizontal={true} 
                initialNumToRender={2}
                initialScrollIndex={initialStackPos}
                getItemLayout={getItemLayout}
                keyboardShouldPersistTaps={"handled"}
                maxToRenderPerBatch={2}
                ref={stackRef}
                renderItem={renderReelay} 
                onScroll={onStackSwiped} 
                pagingEnabled={true} 
                windowSize={3}
            />
            <BannerContainer offset={topOffset}>
                <TopicBanner  
                    club={null}
                    navigation={navigation}
                    reelay={viewableReelay}
                    titleObj={viewableReelay?.title}
                    topic={topic}
                />
            </BannerContainer>
            { showProgressBar && <UploadProgressBar mountLocation={'InTopic'}  /> }
        </ReelayFeedContainer>
    );
}