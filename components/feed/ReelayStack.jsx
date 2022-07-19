import React, { useContext, useState, memo, useRef, Fragment } from 'react';
import { Dimensions, FlatList, SafeAreaView, View } from 'react-native';
import BackButton from '../utils/BackButton';
import Hero from './Hero';
import TitleBanner from './TitleBanner';
import * as ReelayText from '../global/Text';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';
import UploadProgressBar from '../global/UploadProgressBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReelayFeedHeader from './ReelayFeedHeader';

const { height, width } = Dimensions.get('window');

const AnnouncementTitleContainer = styled(View)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 6px;
    flex-direction: row;
    margin-left: 12px;
    height: 38px;
    padding: 6px;
`
const AnnouncementText = styled(ReelayText.CaptionEmphasized)`
    margin-top: 2px;
    margin-left: 6px;
    margin-right: 6px;
    color: white;
`
const BackButtonPinnedContainer = styled(SafeAreaView)`
    align-items: center;
    flex-direction: row;
    position: absolute;
    top: ${props => props.topOffset}px;
`
const HeaderContainer = styled(View)`
    position: absolute;
    width: 100%;
`
const ReelayFeedContainer = styled(View)`
    background-color: black;
    height: ${height}px;
    width: ${width}px;
`
const TitleBannerContainer = styled(View)`
    margin-top: 10px;
    position: absolute;
    top: ${props => props.topOffset}px;
    width: 100%;
`

const ReelayStack = ({ 
    initialStackPos = 0,
    feedSource,
    navigation,
    onRefresh,
    stack,  
    stackViewable,
}) => {
    const [stackPosition, setStackPosition] = useState(initialStackPos);
    const { reelayDBUser } = useContext(AuthContext);
    const donateLinks = useSelector(state => state.donateLinks);
    const uploadStage = useSelector(state => state.uploadStage);
    
    const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
    const showProgressBar = showProgressBarStages.includes(uploadStage);
    const stackRef = useRef(null);
    const viewableReelay = stack[stackPosition];

    const latestAnnouncement = useSelector(state => state.latestAnnouncement);
    const isPinnedReelay = (viewableReelay?.sub === latestAnnouncement?.pinnedReelay?.sub);
    const topOffset = useSafeAreaInsets().top;

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

    const onTappedOldest = () => {
        setStackPosition(0);
        stackRef?.current?.scrollToIndex({ animated: false, index: 0 });
    }

    const onTappedNewest = () => {
        const nextPosition = stack?.length - 1;
        setStackPosition(nextPosition);
        stackRef?.current?.scrollToIndex({ animated: false, index: nextPosition });
    }

    const AnnouncementTitle = () => {
        return (
            <AnnouncementTitleContainer>
                <AnnouncementText>
                    {latestAnnouncement?.title}
                </AnnouncementText>
            </AnnouncementTitleContainer>
        );
    }

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
                ref={stackRef}
                renderItem={renderReelay} 
                onScroll={onStackSwiped} 
                pagingEnabled={true} 
                windowSize={3}
            />
            { isPinnedReelay && (
                <BackButtonPinnedContainer topOffset={topOffset}>
                    <BackButton navigation={navigation} />
                    { latestAnnouncement?.title && <AnnouncementTitle /> }
                </BackButtonPinnedContainer>
            )}
            { !isPinnedReelay && (
                <HeaderContainer>
                    <ReelayFeedHeader 
                        navigation={navigation}
                        feedSource={feedSource}
                        position={stackPosition}
                        stackLength={stack?.length}
                        onTappedNewest={onTappedNewest}
                        onTappedOldest={onTappedOldest}
                        reelay={stack[stackPosition]}
                    />
                    <TitleBannerContainer topOffset={topOffset}>
                        <TitleBanner 
                            club={null}
                            donateObj={donateObj}
                            navigation={navigation}
                            stack={stack}
                            titleObj={viewableReelay?.title}
                            topic={null}
                            viewableReelay={viewableReelay}
                        />
                    </TitleBannerContainer>
                </HeaderContainer>
            )}
            { showProgressBar && <UploadProgressBar mountLocation={'OnProfile'} onRefresh={onRefresh} /> }
        </ReelayFeedContainer>
    );
}

const areEqual = (prevProps, nextProps) => {
    return prevProps.stackViewable === nextProps.stackViewable;
}

export default memo(ReelayStack, areEqual);