import React from 'react';
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
import { tagTitle } from '../../redux/slices/CreateReelaySlice';

const PressableContainer = styled.Pressable`
    height: 30px;
`
const TitleText = styled.Text`
    font-size: 20px;
`
const TitleTextSelected = styled.Text`
    font-size: 20px;
    font-weight: bold;
`
const TitleLineContainer = styled.View`
    flex: 1
    flex-direction: row;
    align-items: flex-start;
`
const YearText = styled.Text`
    font-size: 20px;
`
const YearTextSelected = styled.Text`
    font-size: 20px;
    font-weight: bold;
`

export default SearchResultItem = ({result, resultType}) => {
    const dispatch = useDispatch();
    const titleObject = result;

    const title = titleObject.title ? titleObject.title + '\t' : 'Title not found.' + '\t';
    const releaseYear = (titleObject.release_date && titleObject.release_date.length >= 4) 
        ? ('(' + titleObject.release_date.slice(0,4) + ')') : 'Release year not found.';

    const isTagged = useSelector((state) => state.createReelay.titleObject) == titleObject;

    const selectResult = () => {
        dispatch(tagTitle(titleObject));
        console.log('selected ', title);
    }

    return (
        <PressableContainer onPress={selectResult}>
            { isTagged && 
                <TitleLineContainer>
                    <TitleTextSelected>{title}</TitleTextSelected>
                    <YearTextSelected>{releaseYear}</YearTextSelected>
                </TitleLineContainer>
            }
            { !isTagged && 
                <TitleLineContainer>
                    <TitleText>{title}</TitleText>
                    <YearText>{releaseYear}</YearText>
                </TitleLineContainer>
            }
        </PressableContainer>
    );
};