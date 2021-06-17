import React from 'react';
import styled from 'styled-components/native'

const TitleText = styled.Text`
    font-size: 14px;
    font-weight: bold;
`
const YearText = styled.Text`
    font-size: 14px;
`
const TitleLineContainer = styled.View`
    flex: 1
    flex-direction: row;
    align-items: left;
`

const TMDBSearchResultItem = ({resultItem, resultType}) => {

    const titleName = ('title' in resultItem) ?
        resultItem['title'] : 'Title not found';

    // make sure we have a release date for the film
    const titleYear = ('release_date' in resultItem) ?
        resultItem['release_date'][0,4] : '';

    // todo: render film poster

    return (
            <TitleLineContainer>
                <TitleText>{titleName}</TitleText>
                <YearText>{resultItem.year}</YearText>
            </TitleLineContainer>
    );

};

export default TMDBSearchResultItem;