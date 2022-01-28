import React, { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Icon, Image } from 'react-native-elements';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';
import { getPosterURL } from '../../api/TMDbApi';

import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { getRuntimeString } from '../utils/TitleRuntime';

import Swipeable from 'react-native-gesture-handler/Swipeable';

const ImageContainer = styled(View)`
    flex: 0.5;
    flex-direction: row;
    align-items: center;
    width: 500px;
`
const PressableContainer = styled(Pressable)`
    flex: 1;
    flex-direction: row;
    margin: 10px 10px 10px 20px;
    height: 165px;
`
const SliderIconContainer = styled(View)`
    align-items: center;
    justify-content: center;
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

export default WatchlistItem = ({ navigation, watchlistItem, source }) => {
    const { cognitoUser } = useContext(AuthContext);
    const { title, recommendations } = watchlistItem;

    // for movies and series
    // note that release_date for series has been overwritten with its first air date
    const actors = title?.displayActors?.map(actor => actor.name)
            .filter((actor) => actor !== undefined)
            .join(", ") 
        ?? [];

    const runtimeString = getRuntimeString(title?.runtime);

    const selectResult = () => {}

    return (
        <PressableContainer key={title?.id} onPress={selectResult}>
            <ImageContainer>
                { title?.posterSource && (
                    <Image
                        source={title?.posterSource}
                        style={{ height: 120, width: 80, borderRadius: 6 }}
                        PlaceholderContent={<ActivityIndicator />}
                    />
                )}
                { !title.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
            </ImageContainer>
            <TitleLineContainer>
                <TitleText>{title.display}</TitleText>
                <YearText>{`${title.releaseYear}    ${runtimeString}`}</YearText>
                <ActorText>{actors}</ActorText>
            </TitleLineContainer>
            <SliderIconContainer>
                <Icon type='ionicon' name='caret-back' color='white' size={20} />
            </SliderIconContainer>
        </PressableContainer>
    );
};