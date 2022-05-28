import React, { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import * as ReelayText from "../../components/global/Text";
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { getRuntimeString } from '../utils/TitleRuntime';
import TitlePoster from '../global/TitlePoster';

const ImageContainer = styled(View)`
    flex: 0.5;
    flex-direction: row;
    align-items: center;
`
const PressableContainer = styled(Pressable)`
    flex: 1;
    flex-direction: row;
    margin: 10px 10px 10px 20px;
`
const TitleText = styled(ReelayText.Subtitle1Emphasized)`
    color: white
`
const TitleLineContainer = styled(View)`
    flex: 1;
    justify-content: center;
    align-items: flex-start;
`;
const ActorText = styled(ReelayText.Subtitle2)`
    color: gray
`
const YearText = styled(ReelayText.Subtitle2)`
    color: gray
`

export default TitleSearchResultItem = ({ navigation, result, source, clubID, topicID }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const titleObj = result;

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
            navigation.push('VenueSelectScreen', { titleObj, clubID, topicID });
            
            logAmplitudeEventProd('advanceToCreateReelay', {
                username: reelayDBUser?.username,
                title: title,
                source: 'TitleSearchResult',
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
        } else {
            showErrorToast('Error selecting result. Please reach out to the Reelay team.');
            logAmplitudeEventProd('selectSearchResultError', {
                username: reelayDBUser?.username,
                title: title,
                source: source,
            }); 

        }
    }

    return (
        <PressableContainer key={titleObj?.id} onPress={selectResult}>
            <ImageContainer>
                { titleObj?.posterSource && (
                    <TitlePoster title={titleObj} width={72} />
                )}
                { !titleObj.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
            </ImageContainer>
            <TitleLineContainer>
                <TitleText>{title}</TitleText>
                <YearText>{`${releaseYear}    ${runtimeString}`}</YearText>
                <ActorText>{actors}</ActorText>
            </TitleLineContainer>
        </PressableContainer>
    );
};