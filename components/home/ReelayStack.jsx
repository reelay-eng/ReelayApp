import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import Hero from './Hero';
import Poster from './Poster';

import ViewPager from 'react-native-pager-view';

import LikesDrawer from './LikesDrawer';
import CommentsDrawer from './CommentsDrawer';

import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import { VenueIcon } from '../utils/VenueIcon';
import { ScrollView } from 'react-native-gesture-handler';

const { height, width } = Dimensions.get('window');
const ICON_SIZE = 96;
const PLAY_PAUSE_ICON_TIMEOUT = 800;

const BackButtonContainer = styled(SafeAreaView)`
    align-self: flex-start;
    margin-left: 16px;
    position: absolute;
    top: 40px;
`
const IconContainer = styled(Pressable)`
    position: absolute;
    left: ${(width - ICON_SIZE) / 2}px;
    opacity: 50;
    top: ${(height - ICON_SIZE) / 2}px;
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
    zIndex: 3;
`
const ReelayFeedContainer = styled(View)`
    background-color: black;
    height: ${height}px;
    width: ${width}px;
`
const TopRightContainer = styled(View)`
    position: absolute;
    left: ${width - 110}px;
    top: 40px;
    zIndex: 3;
`
const UnderPosterContainer = styled(View)`
    flex-direction: row;
    justify-content: flex-end;
`
const StackLocationOval = styled(View)`
    align-items: flex-end;
    align-self: flex-end;
    background-color: white;
    border-radius: 12px;
    justify-content: center;
    right: 10px;
    height: 22px;
    width: 60px;
    zIndex: 3;
`
const StackLocationText = styled(Text)`
    align-self: center;
    color: black;
    font-size: 16px;
    font-family: System;
`

const PlayPauseIcon = ({ onPress, type = 'play' }) => {
    const ICON_SIZE = 96;
    return (
        <IconContainer onPress={onPress}>
            <Icon type='ionicon' name={type} color={'white'} size={ICON_SIZE} />
        </IconContainer>
    );
}

const StackLocation = ({ position, length }) => {
    const text = String(position + 1) + ' / ' + String(length);
    return (
        <StackLocationOval>
            <StackLocationText>{ text }</StackLocationText>
        </StackLocationOval>
    );
}

export default ReelayStack = ({ 
    stack,  
    stackViewable,
    isFixedStack,
    isPaused,
    navigation,
    setIsPaused,
}) => {

    const [iconVisible, setIconVisible] = useState(false);
    const [stackPosition, setStackPosition] = useState(0);

    const viewableReelay = stack[stackPosition];

    const playPause = () => {
        if (isPaused) {
            setIsPaused(false);
            setIconVisible('pause');
            setTimeout(() => {
                setIconVisible('none');
            }, PLAY_PAUSE_ICON_TIMEOUT);    
        } else {
            setIsPaused(true);
            setIconVisible('play');
            setTimeout(() => {
                if (iconVisible === 'play') {
                    setIconVisible('none');
                }
            }, PLAY_PAUSE_ICON_TIMEOUT);   
        }
    }

    const renderBackButton = () => {
        return (
            <BackButtonContainer>
            <Icon type='ionicon' size={30} color={'white'} name='chevron-back-outline' 
                onPress={() => navigation.pop()} />
            </BackButtonContainer>
        );
    }

    const renderReelay = ({ reelay, index }) => {
        const reelayViewable = (index === stackPosition);        
        return (
            <ReelayFeedContainer key={reelay.id}>
                <Hero 
                    navigation={navigation} 
                    reelay={reelay} 
                    viewable={stackViewable && reelayViewable}
                    index={index} 
                    isPaused={isPaused} 
                    playPause={playPause} 
                    setIsPaused={setIsPaused}
                    stackIndex={index} 
                    stackPosition={stackPosition}
                />
                { isFixedStack && renderBackButton() }
                <LikesDrawer reelay={reelay} />
                <CommentsDrawer reelay={reelay} />
                { iconVisible !== 'none' && <PlayPauseIcon onPress={playPause} type={iconVisible} /> }
            </ReelayFeedContainer>
        );
    }

    // const testItem = ({ reelay, index }) => {
    //     return (
    //         <ReelayFeedContainer key={reelay.id} style={{ alignItems: 'center', justifyContent: 'center' }}>
    //             <Text style={{ color: 'white' }}>{`${stack[0].title.display}`}</Text>
    //         </ReelayFeedContainer>
    //     );
    // }

    const onStackSwiped = (e) => {
        const { x, y } = e.nativeEvent.targetContentOffset;
        if (x % width === 0) {
            const stackPosition = x / width;
            console.log('stackPosition: ', stackPosition);
            setStackPosition(stackPosition);
        }

    }

    return (
        // <FlatList
        //     data={stack}
        //     horizontal={true}
        //     initialNumToRender={3}
        //     keyExtractor={reelay => String(reelay.id)}
        //     maxToRenderPerBatch={3}
        //     // onScroll={onStackSwipedRef.current}
        //     pagingEnabled={true}
        //     renderItem={testItem}
        //     style={{
        //         backgroundColor: 'black',
        //         height: height,
        //         width: width,
        //     }}
        //     contentContainerStyle={{
        //         alignItems: 'center',
        //         justifyContent: 'center',
        //         height: height,
        //         width: width,
        //     }}
        //     windowSize={3}
        // />
        <ReelayFeedContainer>
            <ScrollView horizontal={true} pagingEnabled={true} onScrollEndDrag={onStackSwiped}>
                { stack.map((reelay, index) => {
                    return renderReelay({ reelay, index });
                })}
            </ScrollView>
            <TopRightContainer>
                <Poster title={viewableReelay.title} />
                <UnderPosterContainer>
                    { stack.length > 1 && <StackLocation position={stackPosition} length={stack.length} /> }
                    { viewableReelay?.content?.venue && <VenueIcon venue={viewableReelay.content.venue} size={24} border={2} /> }
                </UnderPosterContainer>
            </TopRightContainer>
        </ReelayFeedContainer>
    );
}
