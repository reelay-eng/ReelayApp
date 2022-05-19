import React, { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, TouchableOpacity, View } from 'react-native';
import { Icon, Image } from 'react-native-elements';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';

import { getRuntimeString } from '../utils/TitleRuntime';
import TitlePoster from '../global/TitlePoster';
import { useDispatch, useSelector } from 'react-redux';
import { showMessageToast } from '../utils/toasts';

import { getWatchlistItems, markWatchlistItemSeen, markWatchlistItemUnseen } from '../../api/WatchlistApi';
import { AuthContext } from '../../context/AuthContext';

const CreateReelayButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: #444950;
    border-radius: 17px;
    flex-direction: row;
    justify-content: center;
    height: 30px;
    margin-top: 16px;
    padding-left: 12px;
    padding-right: 8px;
`
const CreateReelayText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 12px;
    line-height: 16px;
`
const ImageContainer = styled(View)`
    flex-direction: row;
    align-items: flex-start;
    margin: 5px;
    margin-right: 15px;
`
const MarkSeenButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    padding-left: 4px;
`
const MarkSeenText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    padding-right: 6px;
`
const RightButtonsContainer = styled(View)`
    align-items: flex-end;
    margin-right: 10px;
`
const TitleText = styled(ReelayText.H5Emphasized)`
    color: white
    font-size: 20px;
`
const TitleLineContainer = styled(View)`
    flex: 1;
    justify-content: center;
    align-items: flex-start;
`
const WatchlistItemContainer = styled(Pressable)`
    align-items: center;
    flex-direction: row;
    margin-top: 8px;
    margin-bottom: 8px;
`
const YearText = styled(ReelayText.Subtitle2)`
    color: gray
`

const CreateReelayButton = ({ navigation, watchlistItem }) => {
    const advanceToCreateReelay = () => navigation.push('VenueSelectScreen', { 
        titleObj: watchlistItem.title, 
    });

    return (
        <CreateReelayButtonContainer onPress={advanceToCreateReelay}>
            <CreateReelayText>{'Reelay  '}</CreateReelayText>
            <Icon type='ionicon' name='arrow-forward-circle' color='white' size={20} />
        </CreateReelayButtonContainer>
    );
}

const MarkSeenButton = ({ watchlistItem }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const { title } = watchlistItem;
    const dispatch = useDispatch();
    const [markedSeen, setMarkedSeen] = useState(watchlistItem.hasSeenTitle);

    const updateWatchlistReqBody = { 
        reqUserSub: reelayDBUser?.sub, 
        tmdbTitleID: title?.id, 
        titleType: title?.titleType,
    };

    const markSeen = async () => {
        setMarkedSeen(true);
        const markSeenResult = await markWatchlistItemSeen(updateWatchlistReqBody);
        console.log('mark seen result: ', markSeenResult);
        showMessageToast('Title marked as seen');

        // logAmplitudeEventProd('markWatchlistItemSeen', {
        //     username: reelayDBUser?.username,
        //     title: watchlistItem?.title?.display,
        //     source: 'clubActivityScreen',
        //     clubName: club?.name,
        // });

        const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })    
    }

    const markUnseen = async () => {
        setMarkedSeen(false);
        const markUnseenResult = await markWatchlistItemUnseen(updateWatchlistReqBody);
        console.log('mark unseen result: ', markUnseenResult);
        showMessageToast('Title marked unseen');

        // logAmplitudeEventProd('markWatchlistItemUnseen', {
        //     username: reelayDBUser?.username,
        //     title: clubTitle?.title?.display,
        //     source: 'clubActivityScreen',
        //     clubName: club?.name,
        // });

        const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })    
    }

    return (
        <MarkSeenButtonContainer onPress={(markedSeen) ? markUnseen : markSeen}>
            <MarkSeenText>{'Seen'}</MarkSeenText>
            { markedSeen && <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayBlue} size={30} />}
            { !markedSeen && <Icon type='ionicon' name='ellipse-outline' color={'white'} size={30} />}
        </MarkSeenButtonContainer>
    );
}


export default WatchlistItem = ({ navigation, watchlistItem }) => {
    const { title, hasSeenTitle } = watchlistItem;
    const advanceToTitleScreen = () => navigation.push('TitleDetailScreen', { titleObj: title });
    const runtimeString = getRuntimeString(title?.runtime);

    return (
        <WatchlistItemContainer key={title?.id} onPress={advanceToTitleScreen}>
            <ImageContainer>
                { title?.posterSource && <TitlePoster title={title} width={54} /> }
                { !title.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
            </ImageContainer>
            <TitleLineContainer>
                <TitleText>{title.display}</TitleText>
                <YearText>{`${title.releaseYear}    ${runtimeString}`}</YearText>
            </TitleLineContainer>
            <RightButtonsContainer>
                <MarkSeenButton watchlistItem={watchlistItem} />
                { hasSeenTitle && (
                    <CreateReelayButton navigation={navigation} watchlistItem={watchlistItem} />
                )}
            </RightButtonsContainer>
        </WatchlistItemContainer>
    );
};
