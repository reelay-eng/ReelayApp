import React, { useContext, useState, memo } from 'react';
import { Dimensions, FlatList, SafeAreaView, TouchableOpacity, View } from 'react-native';
import Hero from '../feed/Hero';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import TopicFeedHeader from './TopicFeedHeader';
import TopicTitleBanner from './TopicTitleBanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';
import UploadProgressBar from '../global/UploadProgressBar';

const { height, width } = Dimensions.get('window');

const AddReelayButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    width: ${width - 32}px;
`
const AddReelayButtonOuterContainer = styled(View)`
    align-items: center;
    bottom: ${(props) => props.offset ?? 0}px;
    position: absolute;
    width: 100%;
`
const AddReelayButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`
const BannerContainer = styled(View)`
    top: ${(props) => props.offset}px;
    align-items: center;
    margin-top: 10px;
    position: absolute;
    width: 100%;
`
const ReelayFeedContainer = styled(View)`
    background-color: black;
    height: ${height}px;
    width: ${width}px;
`
const AddReelayButton = ({ navigation, offset, topic }) => {
    const advanceToCreateTopic = () => navigation.push('SelectTitleScreen', { topic });
    return (
        <AddReelayButtonOuterContainer offset={offset}>
        <AddReelayButtonContainer onPress={advanceToCreateTopic}>
            <Icon type='ionicon' name='add-circle-outline' size={16} color='white' />
            <AddReelayButtonText>
                {'Add a reelay'}
            </AddReelayButtonText>
        </AddReelayButtonContainer>
        </AddReelayButtonOuterContainer>
    );
}

export default TopicStack = ({ 
    initialStackPos = 0,
    navigation,
    stackViewable,
    topic,  
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const stack = topic.reelays;
    const [stackPosition, setStackPosition] = useState(initialStackPos);
    const headerTopOffset = useSafeAreaInsets().top;
    const addReelayBottomOffset = useSafeAreaInsets().bottom;

    const uploadStage = useSelector(state => state.uploadStage);
    const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
    const showProgressBar = showProgressBarStages.includes(uploadStage);

    const getItemLayout = (data, index) => ({
        length: width, 
        offset: width * index, index,
        index: index,
    });

    const renderReelay = ({ item, index }) => {
        const headerHeight = headerTopOffset + 40;
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
                <BannerContainer offset={headerHeight}>
                    <TopicTitleBanner
                        navigation={navigation}
                        reelay={reelay}
                    />
                </BannerContainer>
            </ReelayFeedContainer>
        );
    };

    const onStackSwiped = (e) => {
        const { x, y } = e.nativeEvent.contentOffset;

        if (x % width === 0) {
            const nextStackPosition = x / width;
            if (stackPosition === nextStackPosition) {
                return;
            }

            const swipeDirection = nextStackPosition < stackPosition ? 'left' : 'right';
            const nextReelay = stack[nextStackPosition];
            const prevReelay = stack[stackPosition];
            const logProperties = {
                nextReelayID: nextReelay.id,
                nextReelayCreator: nextReelay.creator.username,
                nextReelayTitle: nextReelay.title.display,
                prevReelayID: prevReelay.id,
                prevReelayCreator: prevReelay.creator.username,
                prevReelayTitle: prevReelay.title.display,
                source: 'stack',
                swipeDirection: swipeDirection,
                username: reelayDBUser?.username,
            }
            logAmplitudeEventProd('swipedFeed', logProperties);
            setStackPosition(nextStackPosition);
        }
    }

    return (
        <ReelayFeedContainer>
            <FlatList 
                data={stack} 
                horizontal={true} 
                initialNumToRender={1}
                initialScrollIndex={initialStackPos}
                getItemLayout={getItemLayout}
                keyboardShouldPersistTaps={"handled"}
                maxToRenderPerBatch={2}
                renderItem={renderReelay} 
                onScroll={onStackSwiped} 
                pagingEnabled={true} 
                windowSize={3}
            />
            <TopicFeedHeader 
                navigation={navigation}
                position={stackPosition}
                topic={topic}
            />
            <AddReelayButton 
                navigation={navigation} 
                offset={addReelayBottomOffset}
                topic={topic} 
            />
            { showProgressBar && <UploadProgressBar mountLocation={'InTopic'} /> }
        </ReelayFeedContainer>
    );
}