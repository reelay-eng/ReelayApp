import React, { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Icon, Image } from 'react-native-elements';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';

import { getRuntimeString } from '../utils/TitleRuntime';

const WatchlistItemContainer = styled(Pressable)`
    flex-direction: row;
`
const WatchlistItemRow = styled(View)`
    flex-direction: row;
    justify-content: space-between;
    margin: 1.5px;
`
const ImageContainer = styled(View)`
    flex-direction: row;
    align-items: flex-start;
    margin-right: 15px;
`
const SliderIconContainer = styled(View)`
    align-items: center;
    justify-content: center;
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
const ActorText = styled(ReelayText.Subtitle2)`
    color: gray;
    margin-bottom: 6px;
`
const YearText = styled(ReelayText.Subtitle2)`
    color: gray
`

const WatchlistItemInfo = ({ navigation, watchlistItem }) => {
    const { title } = watchlistItem;

    // for movies and series
    // note that release_date for series has been overwritten with its first air date
    const actors = title?.displayActors?.map(actor => actor.name)
            .filter((actor) => actor !== undefined)
            .join(", ") 
        ?? [];

    const runtimeString = getRuntimeString(title?.runtime);

    return (
        <WatchlistItemContainer key={title?.id} onPress={() => {
            navigation.push('TitleDetailScreen', { titleObj: title });
        }}>
            <ImageContainer>
                { title?.posterSource && (
                    <Image
                        source={title?.posterSource}
                        style={{ height: 81, width: 54, borderRadius: 6 }}
                        PlaceholderContent={<ActivityIndicator />}
                    />
                )}
                { !title.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
            </ImageContainer>
            <TitleLineContainer>
                <TitleText>{title.display}</TitleText>
                <YearText>{`${title.releaseYear}    ${runtimeString}`}</YearText>
                {/* <ActorText>{actors}</ActorText> */}
            </TitleLineContainer>
        </WatchlistItemContainer>
    );
}

export default WatchlistItem = ({ navigation, watchlistItem }) => {
    return (
        <WatchlistItemRow>
            <View style={{ flex: 1 }}>
                <WatchlistItemInfo navigation={navigation} watchlistItem={watchlistItem} />
            </View>
            <SliderIconContainer>
                <Icon type='ionicon' name='chevron-back-outline' color='white' size={20} />
            </SliderIconContainer>
        </WatchlistItemRow>
    );
};
