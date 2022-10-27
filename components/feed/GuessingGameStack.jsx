import React, { useContext, useState, memo, useRef, Fragment, useMemo, useEffect } from 'react';
import { Dimensions, FlatList, SafeAreaView, View } from 'react-native';
import BackButton from '../utils/BackButton';
import Hero from './Hero';
import TitleBanner from './TitleBanner';
import * as ReelayText from '../global/Text';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/native';
import UploadProgressBar from '../global/UploadProgressBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StackPositionBar from './StackPositionBar';
import TopicBanner from '../topics/TopicBanner';
import { getGameDetails } from '../../api/GuessingGameApi';
import GuessingGameBanner from '../games/GuessingGameBanner';

const { height, width } = Dimensions.get('window');

const ReelayFeedContainer = styled(View)`
    align-items: center;
    background-color: black;
    height: ${height}px;
    width: ${width}px;
`
const GameBannerView = styled(View)`
    margin-top: 10px;
    left: 10px;
    position: absolute;
    top: ${props => props.topOffset}px;
    width: 100%;
`

export const GuessingGameStack = ({ 
    initialStackPos = 0,
    guessingGame,
    isPreview = false,
    navigation,
    onRefresh,
    stackViewable,
}) => {
    const [stackPosition, setStackPosition] = useState(initialStackPos);
    const { reelayDBUser } = useContext(AuthContext);
    const uploadStage = useSelector(state => state.uploadStage);

    const gameDetails = getGameDetails(guessingGame);
    const clueOrder = gameDetails?.clueOrder ?? [];
    const correctTitleKey = gameDetails?.correctTitleKey ?? 'film-0';

    const initMyGuesses = (isPreview) 
        ? [] 
        : game?.myGuesses ?? [];

    const [myGuesses, setMyGuesses] = useState(initMyGuesses);

    const isGameComplete = () => {
        if (myGuesses.length === clueOrder.length) return true;
        for (const guess of myGuesses) {
            if (guess.isCorrect) return true;
        }
        return false;
    }

    const stack = guessingGame?.reelays ?? [];
    const lastVisibleIndex = myGuesses?.length;
    const firstLockedIndex = lastVisibleIndex + 1;
    const displayStack = (isGameComplete()) 
        ? stack 
        : stack.slice(0, firstLockedIndex);

    const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
    const showProgressBar = showProgressBarStages.includes(uploadStage);
    const stackRef = useRef(null);
    const viewableReelay = displayStack[stackPosition];

    const topOffset = useSafeAreaInsets().top + 26;

    const checkAdvanceToNewClue = () => {
        if (stackPosition < lastVisibleIndex) {
            // stackRef.current.scrollToIndex(lastVisibleIndex);
            // setStackPosition(lastVisibleIndex);
        }
    }

    const getClubStub = (reelay) => (reelay?.clubID) 
        ? { id: reelay.clubID, name: reelay.clubName } 
        : null;

    const topicStub = useMemo(() => {
        return (stack[0]?.topicID) ? {
            id: stack[0].topicID,
            title: stack[0].topicTitle,
        } : null;
    }, [stack]);

    const getItemLayout = (data, index) => ({
        length: width, 
        offset: width * index, index,
        index: index,
    });

    const renderReelay = ({ item, index }) => {
        const reelay = item;
        const reelayIsViewable = stackViewable && (index === stackPosition);  
        const clubStub = getClubStub(reelay);
    
        return (
            <ReelayFeedContainer key={reelay.id}>
                <Hero 
                    clubStub={clubStub}
                    index={index} 
                    feedSource={'guessingGame'}
                    navigation={navigation} 
                    reelay={reelay} 
                    viewable={reelayIsViewable}
                />
            </ReelayFeedContainer>
        );
    };

    const onStackSwiped = (e) => {
        const { x, y } = e.nativeEvent.contentOffset;
        const nextStackPosition = Math.round(x / width);
        if (stackPosition === nextStackPosition) return;

        const swipeDirection = nextStackPosition < stackPosition ? 'left' : 'right';
        const nextReelay = displayStack[nextStackPosition];
        const prevReelay = displayStack[stackPosition];
        const logProperties = {
            nextReelayCreator: nextReelay.creator?.username,
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

    useEffect(() => {
        checkAdvanceToNewClue();
    }, [myGuesses]);

    return (
        <ReelayFeedContainer>
            <FlatList 
                data={displayStack} 
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
            <GameBannerView topOffset={topOffset}>
                <GuessingGameBanner
                    clueIndex={stackPosition}
                    club={getClubStub(viewableReelay)}
                    myGuesses={myGuesses}
                    setMyGuesses={setMyGuesses}
                    navigation={navigation}
                    titleObj={viewableReelay?.title}
                    topic={topicStub}
                    reelay={viewableReelay}
                />                    
            </GameBannerView>
            { (stack.length > 1) && (
                <StackPositionBar stackLength={stack?.length} stackPosition={stackPosition} stackViewable={stackViewable} /> 
            )}
            { showProgressBar && <UploadProgressBar mountLocation={'OnProfile'} onRefresh={onRefresh} /> }
        </ReelayFeedContainer>
    );
}

export default GuessingGameStack;