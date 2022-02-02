import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Icon, Image } from 'react-native-elements';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';

import { getRuntimeString } from '../utils/TitleRuntime';
import { getRegisteredUser } from '../../api/ReelayDBApi';

const WatchlistItemContainer = styled(Pressable)`
    flex-direction: row;
    margin: 10px 10px 10px 20px;
`
const RecommendedByLineContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    padding-bottom: 10px;
    padding-left: 20px;
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
    margin-bottom: 6px;
`
const TitleLineContainer = styled(View)`
    flex: 1;
    justify-content: center;
    align-items: flex-start;
`
const ActorText = styled(ReelayText.Subtitle1)`
    color: gray;
    font-size: 16px;
`
const RecUserPill = styled(Pressable)`
    background-color: #3c3c3c;
    border-radius: 6px;
    margin-left: 6px;
    padding: 6px;
`
const RecUserText = styled(ReelayText.Subtitle1)`
    color: white;
    justify-content: flex-end;
`
const YearText = styled(ReelayText.Subtitle1)`
    color: gray
`

const RecommendedByLine = ({ watchlistItem }) => {
    const { recommendations } = watchlistItem;
    const [isLoaded, setIsLoaded] = useState(false);
    const recUsernames = useRef();
    const recUserSubs = recommendations.map((rec) => rec.recommendedBySub);

    const loadRecUsers = async () => {
        recUsernames.current = await Promise.all(recUserSubs.map(async (userSub) => {
            const { username } = await getRegisteredUser(userSub);
            return `@${username}`;
        }));
        setIsLoaded(true);
    }

    useEffect(() => {
        loadRecUsers();
    }, []);
 
    return (
        <RecommendedByLineContainer>
            <RecUserText>
                { isLoaded && recUsernames.current.length > 0 && `Sent to you by` }
            </RecUserText>   
            { isLoaded && recUsernames.current.length > 0 && recUsernames.current.map((recUsername) => {
                return (<RecUserPill><RecUserText>{recUsername}</RecUserText></RecUserPill>);
            }) }
        </RecommendedByLineContainer>
    );
}

const WatchlistItemInfo = ({ navigation, watchlistItem }) => {
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
}

export default WatchlistItem = ({ navigation, watchlistItem }) => {
    return (
        <View>
            <WatchlistItemInfo navigation={navigation} watchlistItem={watchlistItem} />
            { watchlistItem.recommendations.length > 0 && 
                <RecommendedByLine watchlistItem={watchlistItem} /> 
            }
        </View>
    );
};
