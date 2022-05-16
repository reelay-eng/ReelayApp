import React, { useContext, useState, memo } from 'react';
import { Dimensions, FlatList, SafeAreaView, View } from 'react-native';
import BackButton from '../utils/BackButton';
import Hero from './Hero';
import TitleBanner from './TitleBanner';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';
import UploadProgressBar from '../global/UploadProgressBar';

const { height, width } = Dimensions.get('window');

const BackButtonContainer = styled(SafeAreaView)`
    align-self: flex-start;
    position: absolute;
    top: 150px;
`
const ReelayFeedContainer = styled(View)`
    background-color: black;
    height: ${height}px;
    width: ${width}px;
`

const ReelayStack = ({ 
    stack,  
    stackViewable,
    initialStackPos = 0,
    navigation,
}) => {
    const [stackPosition, setStackPosition] = useState(initialStackPos);
    const { reelayDBUser } = useContext(AuthContext);
    const donateLinks = useSelector(state => state.donateLinks);
    const uploadStage = useSelector(state => state.uploadStage);

    const viewableReelay = stack[stackPosition];
    const donateObj = donateLinks?.find((donateLinkObj) => {
        const { tmdbTitleID, titleType } = donateLinkObj;
        const viewableTitleID = stack[0].title.id;
        const viewableTitleType = (stack[0].title.isSeries) ? 'tv' : 'film';
        return ((tmdbTitleID === viewableTitleID) && titleType === viewableTitleType);
    });

    const getItemLayout = (data, index) => ({
        length: width, 
        offset: width * index, index,
        index: index,
    });

    const renderBackButton = () => {
        return (
            <BackButtonContainer>
                <BackButton navigation={navigation} />
            </BackButtonContainer>
        );
    }

    const renderReelay = ({ item, index }) => {
        const reelay = item;
        const reelayViewable = stackViewable && (index === stackPosition);  
        const atStackTop = (navigation?.getState()?.index === 0);
        
        return (
            <ReelayFeedContainer key={reelay.id}>
                <Hero 
                    index={index} 
                    navigation={navigation} 
                    reelay={reelay} 
                    viewable={reelayViewable}
                />
                { !atStackTop && renderBackButton() }
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
            <TitleBanner 
                titleObj={viewableReelay?.title}
                navigation={navigation}
                viewableReelay={viewableReelay}
                stack={stack}
                donateObj={donateObj}
            />
            { uploadStage === 'uploading' && <UploadProgressBar /> }
        </ReelayFeedContainer>
    );
}

const areEqual = (prevProps, nextProps) => {
    return prevProps.stackViewable === nextProps.stackViewable;
}

export default memo(ReelayStack, areEqual);