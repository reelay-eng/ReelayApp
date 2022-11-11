import React, { useContext, useState, memo, useRef, useMemo, useEffect } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import Hero from './Hero';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';
import UploadProgressBar from '../global/UploadProgressBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StackPositionBar from './StackPositionBar';
import { getGameDetails } from '../../api/GuessingGameApi';
import GuessingGameBanner from '../games/GuessingGameBanner';
import ShareGuessingGameModal from '../games/ShareGuessingGameModal';


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
    feedPosition = 0,
    isPreview = false,
    navigation,
    previewGuessingGame = null,
    stackViewable,
}) => {
    const guessingGames = useSelector(state => state.homeGuessingGames);
    const displayGames = guessingGames?.content ?? [];
    const guessingGame = previewGuessingGame ?? displayGames[feedPosition];

    const [stackPosition, setStackPosition] = useState(initialStackPos);
    const { reelayDBUser } = useContext(AuthContext);
    const uploadStage = useSelector(state => state.uploadStage);

    const gameDetails = getGameDetails(guessingGame);
    const clueOrder = gameDetails?.clueOrder ?? [];
    const isFirstRenderRef = useRef(true);
    const isGameCreator = (guessingGame?.creatorSub === reelayDBUser?.sub);
    const myGuesses = (isPreview) ? [] : guessingGame?.myGuesses ?? [];

    const isGameComplete = () => {
        if (myGuesses.length === clueOrder.length) return true;
        for (const guess of myGuesses) {
            if (guess.isCorrect) return true;
        }
        return false;
    }

    const displayGame = { ...guessingGame, myGuesses };
    const gameOver = isGameComplete();
    const isUnlocked = (gameOver || isGameCreator);
    const [shareOutViewable, setShareOutViewable] = useState(false);

    const stack = displayGame?.reelays ?? [];
    const lastVisibleIndex = myGuesses?.length;
    const firstLockedIndex = lastVisibleIndex + 1;

    const displayStack = (gameOver || isUnlocked) ? stack : stack.slice(0, firstLockedIndex);
    const showSidebar = (gameOver || isGameCreator);
    const stackRef = useRef(null);
    const viewableReelay = displayStack[stackPosition];

    const topOffset = useSafeAreaInsets().top + 26;

    const checkAdvanceToNewClue = async () => {
        if (stackPosition < lastVisibleIndex && !gameOver) {
            setTimeout(() => {
                stackRef.current.scrollToOffset({ offset: width * lastVisibleIndex });    
            }, 450);
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

    const getItemLayout = (data, index) => {
        return {
            length: width, 
            offset: width * index, index,
            index: index,
        }
    };

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
                    game={displayGame}
                    navigation={navigation} 
                    reelay={reelay} 
                    showSidebar={showSidebar}
                    viewable={reelayIsViewable}
                />
            </ReelayFeedContainer>
        );
    };

    const onStackSwiped = (e) => {
        const { x, y } = e.nativeEvent.contentOffset;
        const nextStackPosition = Math.round(x / width);
        if (stackPosition === nextStackPosition) return;
        setStackPosition(nextStackPosition);
    }

    useEffect(() => {
        checkAdvanceToNewClue();
    }, [myGuesses]);

    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }
        if (gameOver && !isPreview) {
            setShareOutViewable(true);
        }
    }, [gameOver]);

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
                ref={ref => stackRef.current = ref }
                renderItem={renderReelay} 
                onScroll={onStackSwiped} 
                pagingEnabled={true} 
                windowSize={3}
            />
            <GameBannerView topOffset={topOffset}>
                <GuessingGameBanner
                    club={getClubStub(viewableReelay)}
                    clueIndex={stackPosition}
                    guessingGame={displayGame}
                    isPreview={isPreview}
                    isUnlocked={isUnlocked}
                    navigation={navigation}
                    titleObj={viewableReelay?.title}
                    topic={topicStub}
                    reelay={viewableReelay}
                />                    
            </GameBannerView>
            { (stack.length > 1) && (
                <StackPositionBar stackLength={stack?.length} stackPosition={stackPosition} stackViewable={stackViewable} /> 
            )}
            {shareOutViewable && (
                <ShareGuessingGameModal
                    closeModal={() => setShareOutViewable(false)}
                    navigation={navigation}
                    game={displayGame}
                />
            )}
        </ReelayFeedContainer>
    );
}

const areEqual = (prevProps, nextProps) => {
    console.log('are equal? ', prevProps, nextProps);
    return (
        (prevProps.initialStackPos === nextProps.initialStackPos) &&
        (prevProps.feedPosition === prevProps.feedPosition) &&
        (prevProps.stackViewable === nextProps.stackViewable)
    );
}

export default memo(GuessingGameStack, areEqual);