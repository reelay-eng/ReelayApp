import React, { useContext, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Image } from 'react-native-elements';
import * as ReelayText from "../../components/global/Text";
import styled from 'styled-components/native';
import { getPosterURL } from '../../api/TMDbApi';

import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { getRuntimeString } from '../utils/TitleRuntime';

const ImageContainer = styled.View`
    flex: 0.5;
    flex-direction: row;
    align-items: center;
    width: 500px;
`
const PressableContainer = styled.Pressable`
    flex: 1;
    flex-direction: row;
    margin: 10px 10px 10px 20px;
    height: 165px;
`
const TitleText = styled(ReelayText.H5Emphasized)`
    color: white
    font-size: 22px;
    margin-bottom: 10px;
`
const TitleLineContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: flex-start;
`;
const ActorText = styled(ReelayText.H6Emphasized)`
    color: gray
    font-size: 16px;
`
const YearText = styled(ReelayText.H6Emphasized)`
    color: gray
`

export default TitleSearchResultItem = ({ navigation, result, source }) => {
    const { cognitoUser } = useContext(AuthContext);
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
            navigation.navigate('VenueSelectScreen', {
                titleObj: titleObj
            });

            logAmplitudeEventProd('advanceToCreateReelay', {
                username: cognitoUser.username,
                title: title,
                source: 'create',
            });
        } else if (source && source === 'search') {
            navigation.push('TitleDetailScreen', { 
                titleObj: titleObj
            }); 
            
            logAmplitudeEventProd('selectSearchResult', {
                username: cognitoUser.username,
                title: title,
                source: 'search',
            }); 
        } else {
            showErrorToast('Error selecting result. Please reach out to the Reelay team.');
            logAmplitudeEventProd('selectSearchResultError', {
                username: cognitoUser.username,
                title: title,
                source: source,
            }); 

        }
    }

    return (
        <PressableContainer key={titleObj?.id} onPress={selectResult}>
            <ImageContainer>
                { titleObj?.posterSource && (
                    <Image
                        source={titleObj?.posterSource}
                        style={{ height: 120, width: 80, borderRadius: 6 }}
                        PlaceholderContent={<ActivityIndicator />}
                    />
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