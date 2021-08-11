import React, { useContext, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

import { UploadContext } from '../../context/UploadContext';

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
    height: 160px;
`
const TitleText = styled.Text`
    color: white
    font-size: 18px;
`
const TitleLineContainer = styled.View`
    flex: 1;
    justify-content: flex-start;
    align-items: flex-end;
`
const DirectorText = styled.Text`
    color: white
    font-size: 18px;
`
const YearText = styled.Text`
    color: white
    font-size: 18px;
`

export default SearchResultItem = ({result, navigation}) => {

    const uploadContext = useContext(UploadContext);
    const [posterLoaded, setPosterLoaded] = useState(false);

    const titleObject = result;

    const posterImageUri = titleObject.poster_path 
        ? `${TMDB_IMAGE_API_BASE_URL}${titleObject.poster_path}` : null;

    // for movies and series
    // note that release_date for series has been overwritten with its first air date
    const title = titleObject.title ? titleObject.title : 'Title not found.';
    const releaseYear = (titleObject.release_date && titleObject.release_date.length >= 4) 
        ? ('(' + titleObject.release_date.slice(0,4) + ')') : '';

    const selectResult = () => {
        uploadContext.setUploadTitleObject(titleObject);
        console.log('selected this item', title);
        navigation.push('ReelayCameraScreen');
    }

    return (
        <PressableContainer onPress={selectResult}>
            <ImageContainer>
                { posterImageUri && <Image 
                    source={{ uri: posterImageUri }} 
                    style={{ height: 150, width: 100, borderRadius: 6 }}
                    PlaceholderContent={<ActivityIndicator />}
                    onLoadEnd={() => setPosterLoaded(true)}
                />}
                { !posterImageUri && <TitleText>{'No Poster Available'}</TitleText>}
                { !posterLoaded && <View style={{ height: 150 }} />}
            </ImageContainer>
            <TitleLineContainer>
                <TitleText>{posterLoaded ? title : ''}</TitleText>
                <DirectorText></DirectorText>
                <YearText>{posterLoaded ? releaseYear: ''}</YearText>
            </TitleLineContainer>
        </PressableContainer>
    );
};