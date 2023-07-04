import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, View,TouchableOpacity } from 'react-native';
import * as ReelayText from "../../components/global/Text";
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { getRuntimeString } from '../utils/TitleRuntime';
import TitlePoster from '../global/TitlePoster';
import AddToWatchlistButton from '../watchlist/AddToWatchlistButton';
import * as Haptics from 'expo-haptics';
import { Camera } from 'expo-camera';
import { useDispatch, useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import { Icon } from 'react-native-elements';

const ImageContainer = styled(View)`
    flex-direction: row;
    align-items: center;
`
const PressableContainer = styled(Pressable)`
    flex-direction: row;
    margin: 5px;
    margin-left: 20px;
`
const TitleText = styled(ReelayText.Subtitle1Emphasized)`
    color: white
`
const TitleLineContainer = styled(View)`
    flex: 1;
    justify-content: center;
    margin-left: 12px;
    margin-right: 20px;
`;
const ActorText = styled(ReelayText.Subtitle2)`
    color: gray
`
const YearText = styled(ReelayText.Subtitle2)`
    color: gray
`

const MarkedSeenCircle = styled(View)`
    background-color: ${props => props.markedSeen ? 'white' : 'transparent'};
    border-radius: ${props => props.size}px;
    height: ${props => props.size}px;
    position: absolute;
    right: 6px;
    width: ${props => props.size}px;
`
const MarkSeenButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    padding-left: 4px;
    margin-top:-45px;
`
export default TitleSearchResultItem = ({ navigation, onGuessTitle, result, source, clubID, topicID, addCustomWatchlist = false }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const isGuestUser = (reelayDBUser?.username === 'be_our_guest');
    const titleObj = result;
    const [movielist, setmovielist] = useState([]);
    const [markedSeen, setmarkedSeen] = useState(false);
    const addCustomProfile = useSelector(state => state.addCustomProfile);

    // for movies and series
    // note that release_date for series has been overwritten with its first air date
    const title = titleObj?.display;
    const actors = titleObj?.displayActors?.map(actor => actor.name)
            .filter((actor) => actor !== undefined)
            .join(", ") 
        ?? [];


    const releaseYear = (titleObj?.releaseDate && titleObj?.releaseDate.length >= 4) 
        ? titleObj.releaseDate.slice(0,4) : '';
    const runtimeString = getRuntimeString(titleObj?.runtime);

    const selectResult = () => {
        if (source && source === 'create') {
            // navigation.push('VenueSelectScreen', { titleObj, clubID, topicID });
            advancetoCameraScreen(titleObj)
            logAmplitudeEventProd('advanceToCreateReelay', {
                username: reelayDBUser?.username,
                title: title,
                source: 'createReelay',
            });
        } else if (source && source === 'search') {
            navigation.push('TitleDetailScreen', { 
                titleObj: titleObj
            }); 
            
            logAmplitudeEventProd('selectSearchResult', {
                username: reelayDBUser?.username,
                title: title,
                source: 'search',
            }); 

        } else if (source && source === 'createGuessingGame') {
            navigation.push('CreateGuessingGameScreen', { 
                clubID,
                correctTitleObj: titleObj,
            });
        } else if (source && source === 'guessTitle') {
            // todo
            onGuessTitle(titleObj);
        } else {
            showErrorToast('Error selecting result. Please reach out to the Reelay team.');
            logAmplitudeEventProd('selectSearchResultError', {
                username: reelayDBUser?.username,
                title: title,
                source: source,
            }); 

        }
    }

    const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        return (status === "granted");
    }

    const getMicPermissions = async () => {
        const { status } = await Camera.requestMicrophonePermissionsAsync();
        return (status === "granted");
    }

    const advancetoCameraScreen = async(titleObj) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const hasCameraPermissions = await getCameraPermissions();
        const hasMicPermissions = await getMicPermissions();
        const venue = "";
        if (hasCameraPermissions && hasMicPermissions) {
            navigation.push('ReelayCameraScreen', { titleObj, venue, topicID, clubID });    
            logAmplitudeEventProd('selectVenue', { venue });
        } else {
            alertCameraAccess();
        }
    }
    const alertCameraAccess = async () => {
        Alert.alert(
            "Please allow camera access",
            "To make a reelay, please enable camera and microphone permissions in your phone settings",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              { text: "Update camera settings", onPress: () => Linking.openSettings() }
            ]
        );        
    }


    const MarkSeen = ({item}) => {
       const markeddata = () => {
        const Item = {
            reqUserSub: reelayDBUser?.sub,
            reqUsername: reelayDBUser?.username,
            tmdbTitleID: item?.id,
            titleType: item?.titleType,
        }
        let abbc = addCustomProfile;
        if(addCustomProfile?.find(items=> items.tmdbTitleID == item.id)){
            console.log(abbc.filter(items=> items.tmdbTitleID !== item.id))
            dispatch({ type: 'setAddCustomProfile', payload: abbc.filter(items=> items.tmdbTitleID !== item.id) });
        }else {
            console.log("abbc",abbc)
            dispatch({ type: 'setAddCustomProfile', payload: [...addCustomProfile,Item] });
        } 
        }


        return (
                 <MarkSeenButtonContainer onPress={()=>markeddata()}>
                <MarkedSeenCircle markedSeen={markedSeen} size={24} />
                {addCustomProfile?.find(items=> items.tmdbTitleID == item.id) ?
                <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayGreen} size={32} />:
                <Icon type='ionicon' name='ellipse-outline' color={"white"} size={32} /> }
            </MarkSeenButtonContainer>
        );
    }

    return (
        <PressableContainer key={titleObj?.id} onPress={selectResult}>
            <ImageContainer>
                { titleObj?.posterSource && (
                    <TitlePoster title={titleObj} width={60} />
                )}
                { !titleObj.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
            </ImageContainer>
            <TitleLineContainer>
                <TitleText>{title}</TitleText>
                <YearText>{`${releaseYear}    ${runtimeString}`}</YearText>
                <ActorText>{actors}</ActorText>
            </TitleLineContainer>
            {addCustomWatchlist ?
            <>
            <MarkSeen item={titleObj}/>
            </>:
            (source === 'search' && !isGuestUser && (
                <AddToWatchlistButton shouldGoToWatchlist={true} navigation={navigation} showCircle={false} titleObj={titleObj} />
            ))}
        </PressableContainer>
    );
};