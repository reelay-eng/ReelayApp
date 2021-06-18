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
    align-items: flex-start;
`

export default SearchResultItem = ({result, resultType}) => {

    const title = result.title ? result.title : 'Title not found.';
    const releaseYear = (result.release_date && result.release_date.length >= 4) 
        ? result.release_date.slice(0,4) : 'Release year not found.';

    return (
            <TitleLineContainer>
                <TitleText>{title}</TitleText>
                <YearText>{releaseYear}</YearText>
            </TitleLineContainer>
    );

};