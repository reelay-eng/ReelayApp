import React from 'react';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
// import { usePosterFetchQuery } from '../../redux/services/TMDbApi';
import { tagTitle } from './CreateReelaySlice';

const TMDB_IMAGE_API_BASE_URL = 'http://image.tmdb.org/t/p/w500/';

const ImageContainer = styled.View`
    flex: 0.5;
    flex-direction: row;
    align-items: flex-start;
    width: 500px;
`
const PressableContainer = styled.Pressable`
    flex: 1;
    flex-direction: row;
    margin: 10px 10px 10px 10px;
`
const TitleText = styled.Text`
    font-size: 18px;
    flex: 1;
`
const TitleTextSelected = styled.Text`
    font-size: 18px;
    font-weight: bold;
`
const TitleLineContainer = styled.View`
    flex: 1
    flex-direction: row;
    align-items: flex-start;
`
const YearText = styled.Text`
    font-size: 18px;
`
const YearTextSelected = styled.Text`
    font-size: 18px;
    font-weight: bold;
`

export default SearchResultItem = ({result, resultType}) => {
    const dispatch = useDispatch();
    const titleObject = result;

    // const posterImageUri = titleObject.id ? usePosterFetchQuery(titleObject.id) : null;
    const posterImageUri = titleObject.poster_path 
        ? `${TMDB_IMAGE_API_BASE_URL}${titleObject.poster_path}` : null;

    const title = titleObject.title ? titleObject.title + '\t' : 'Title not found.' + '\t';
    const releaseYear = (titleObject.release_date && titleObject.release_date.length >= 4) 
        ? ('(' + titleObject.release_date.slice(0,4) + ')') : '';

    const isTagged = useSelector((state) => state.createReelay.titleObject) == titleObject;

    const selectResult = () => {
        dispatch(tagTitle(titleObject));
        console.log('selected ', title);
    }

    return (
        <PressableContainer onPress={selectResult}>
            <ImageContainer>
                { posterImageUri && <Image 
                    source={{ uri: posterImageUri }} 
                    style={{ height: 150, width: 100 }}
                />}
                { !posterImageUri && <TitleText>{'No Image'}</TitleText>}
            </ImageContainer>
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