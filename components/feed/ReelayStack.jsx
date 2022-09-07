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
const ReelayFeedContainer = styled(View)`
    align-items: center;
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
const TopicBannerContainer = styled(View)`
    margin-top: 10px;
    left: 10px;
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
    const renderBannerOnStack = !viewableReelay?.topicID;

    const topOffset = useSafeAreaInsets().top + 26;

    const clubStub = useMemo(() => {
        return (stack[0]?.clubID) ? {
            id: stack[0].clubID,
            name: stack[0].clubName,
        } :  null;
    }, [stack]);

    const topicStub = useMemo(() => {
        return (stack[0]?.topicID) ? {
            id: stack[0].topicID,
            title: stack[0].topicTitle,
        } : null;
    }, [stack]);

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

    const AnnouncementTitle = () => {
        return (
            <AnnouncementTitleContainer>
                <AnnouncementText>
                    {latestAnnouncement?.title}
                </AnnouncementText>
            </AnnouncementTitleContainer>
        );
    }

    const renderTitleBanner = (reelay) => {
        return (
            <TitleBannerContainer topOffset={topOffset}>
                <TitleBanner 
                    club={clubStub}
                    donateObj={donateObj}
                    navigation={navigation}
                    titleObj={reelay?.title}
                    reelay={reelay}
                />
            </TitleBannerContainer>
        );
    }

    const renderTopicBanner = (reelay) => {
        return (
            <TopicBannerContainer topOffset={topOffset}>
                <TopicBanner
                    club={clubStub}
                    navigation={navigation}
                    titleObj={reelay?.title}
                    topic={topicStub}
                    reelay={reelay}
                />                    
            </TopicBannerContainer>
        );
    }

    const renderReelay = ({ item, index }) => {
        const reelay = item;
        const reelayIsViewable = stackViewable && (index === stackPosition);          
        return (
            <ReelayFeedContainer key={reelay.id}>
                <Hero 
                    clubStub={clubStub}
                    index={index} 
                    feedSource={feedSource}
                    navigation={navigation} 
                    reelay={reelay} 
                    viewable={reelayIsViewable}
                />
                { !renderBannerOnStack && renderTopicBanner(reelay) }
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

    const renderPinnedHeader = () => {
        return (
            <BackButtonPinnedContainer topOffset={topOffset}>
                <BackButton navigation={navigation} />
                { latestAnnouncement?.title && <AnnouncementTitle /> }
            </BackButtonPinnedContainer>
        );
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
            { isPinnedReelay && renderPinnedHeader() }
            { !isPinnedReelay && renderBannerOnStack && renderTitleBanner(viewableReelay) }
            { !isPinnedReelay && (stack.length > 1) && (
                <StackPositionBar stackLength={stack?.length} stackPosition={stackPosition} stackViewable={stackViewable} /> 
            )}
            { showProgressBar && <UploadProgressBar mountLocation={'OnProfile'} onRefresh={onRefresh} /> }
        </ReelayFeedContainer>
    );
}

const areEqual = (prevProps, nextProps) => {
    return prevProps.stackViewable === nextProps.stackViewable;
}

export default memo(ReelayStack, areEqual);