import React, { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Icon, Image } from 'react-native-elements';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { getRuntimeString } from '../utils/TitleRuntime';

const WatchlistItemContainer = styled(Pressable)`
    flex: 1;
    flex-direction: row;
    margin: 10px 10px 10px 20px;
`
const ImageContainer = styled(View)`
    flex: 0.5;
    flex-direction: row;
    align-items: center;
    width: 500px;
`
const SliderIconContainer = styled(View)`
    align-items: center;
    justify-content: center;
`
const TitleText = styled(ReelayText.H6)`
    color: white
    font-size: 22px;
    margin-bottom: 6px;
`
const TitleLineContainer = styled(View)`
    flex: 1;
    justify-content: center;
    align-items: flex-start;
`;
const ActorText = styled(ReelayText.Subtitle1)`
    color: gray
    font-size: 16px;
`
const YearText = styled(ReelayText.Subtitle1)`
    color: gray
`

export default WatchlistItem = ({ navigation, watchlistItem, category }) => {
    const { cognitoUser } = useContext(AuthContext);
    const { title, recommendations } = watchlistItem;

    // for movies and series
    // note that release_date for series has been overwritten with its first air date
    const actors = title?.displayActors?.map(actor => actor.name)
            .filter((actor) => actor !== undefined)
            .join(", ") 
        ?? [];

    const runtimeString = getRuntimeString(title?.runtime);

    return (
        <WatchlistItemContainer key={title?.id} onPress={() => {
            console.log('helllllooO!!!')
            navigation.push('TitleDetailScreen', { titleObj: title });
        }}>
            <ImageContainer>
                { title?.posterSource && (
                    <Image
                        source={title?.posterSource}
                        style={{ height: 90, width: 60, borderRadius: 6 }}
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
                <Icon type='ionicon' name='chevron-back-outline' color='white' size={25} />
            </SliderIconContainer>
        </WatchlistItemContainer>
    );
};