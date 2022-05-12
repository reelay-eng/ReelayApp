import React, { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Icon, Image } from 'react-native-elements';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';

import { getRuntimeString } from '../utils/TitleRuntime';
import TitlePoster from '../global/TitlePoster';

const ActionButtonContainer = styled(View)`
    flex-direction: row;
    margin-right: 16px;
`
const ImageContainer = styled(View)`
    flex-direction: row;
    align-items: flex-start;
    margin: 5px;
    margin-right: 15px;
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
`
const YearText = styled(ReelayText.Subtitle2)`
    color: gray
`

export default WatchlistItem = ({ navigation, watchlistItem }) => {
    const { title } = watchlistItem;
    const runtimeString = getRuntimeString(title?.runtime);

    return (
        <WatchlistItemContainer key={title?.id} onPress={() => {
            navigation.push('TitleDetailScreen', { titleObj: title });
        }}>
            <ImageContainer>
                { title?.posterSource && <TitlePoster title={title} width={54} /> }
                { !title.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
            </ImageContainer>
            <TitleLineContainer>
                <TitleText>{title.display}</TitleText>
                <YearText>{`${title.releaseYear}    ${runtimeString}`}</YearText>
            </TitleLineContainer>
            <ActionButtonContainer>
                <Icon type='ionicon' name='add-circle' color='white' size={36} />
            </ActionButtonContainer>
        </WatchlistItemContainer>
    );
};
