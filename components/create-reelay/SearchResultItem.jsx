import React, { useContext, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

import { UploadContext } from '../../context/UploadContext';

const TMDB_IMAGE_API_BASE_URL = 'http://image.tmdb.org/t/p/w500/';


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
const TitleText = styled.Text`
    color: white
    font-size: 22px;
`
const TitleLineContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: flex-start;
`;
const ActorText = styled.Text`
    color: gray
    font-size: 16px;
`
const YearText = styled.Text`
    color: gray
    font-size: 16px;
`

export default SearchResultItem = ({ result, navigation }) => {

    const { setHasSelectedTitle, setUploadTitleObject } = useContext(UploadContext);
    const [posterLoaded, setPosterLoaded] = useState(false); 

    const titleObject = result;

    const posterImageUri = titleObject.poster_path 
        ? `${TMDB_IMAGE_API_BASE_URL}${titleObject.poster_path}` : null;

    // for movies and series
    // note that release_date for series has been overwritten with its first air date
    const title = titleObject.title ? titleObject.title : 'Title not found.';
    const actors = titleObject.displayActors.map(actor => actor.name).filter((actor) => actor!==undefined).join(", ");
    const releaseYear = (titleObject.release_date && titleObject.release_date.length >= 4) 
        ? ('(' + titleObject.release_date.slice(0,4) + ')') : '';

    const selectResult = () => {
        setHasSelectedTitle(true); // this makes the tab bar disappear
        setUploadTitleObject(titleObject);
        console.log('selected this item', title);
        
        navigation.push('VenueSelectScreen', { title: title });
    }

    return (
      <PressableContainer onPress={selectResult}>
        <TitleLineContainer>
          <TitleText>{posterLoaded ? title : ""}</TitleText>
          <YearText>{posterLoaded ? releaseYear : ""}</YearText>
          <ActorText>{posterLoaded ? actors : ""}</ActorText>
        </TitleLineContainer>
        <ImageContainer>
          {posterImageUri && (
            <Image
              source={{ uri: posterImageUri }}
              style={{ height: 150, width: 100, borderRadius: 6 }}
              PlaceholderContent={<ActivityIndicator />}
              onLoadEnd={() => setPosterLoaded(true)}
            />
          )}
          {!posterImageUri && <TitleText>{"No Poster Available"}</TitleText>}
          {!posterLoaded && <View style={{ height: 150 }} />}
        </ImageContainer>
      </PressableContainer>
    );
};