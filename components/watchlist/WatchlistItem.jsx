import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Icon, Image } from 'react-native-elements';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';

import { getRuntimeString } from '../utils/TitleRuntime';
import { getReelay, getRegisteredUser, prepareReelay } from '../../api/ReelayDBApi';

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
const TitleText = styled(ReelayText.Subtitle1Emphasized)`
    color: white
`
const TitleLineContainer = styled(View)`
    flex: 1;
    justify-content: center;
    align-items: flex-start;
`
const ActorText = styled(ReelayText.Subtitle2)`
    color: gray;
`
const RecUserPill = styled(Pressable)`
    background-color: ${(props) => (props?.pressed) ? 'gray' : '#3c3c3c'};
    border-radius: 6px;
    margin-left: 6px;
    padding: 6px;
`
const RecUserText = styled(ReelayText.Subtitle2)`
    color: white;
    justify-content: flex-end;
`
const YearText = styled(ReelayText.Subtitle2)`
    color: gray
`

const RecommendedByLine = ({ navigation, watchlistItem }) => {
    const { recommendations } = watchlistItem;
    const advanceToUserProfile = async (creator) => {
        navigation.push('UserProfileScreen', { creator });
    }

    return (
        <RecommendedByLineContainer>
            <RecUserText>
                { recommendations.length > 0 && `Sent to you by` }
            </RecUserText>   
            { recommendations.length > 0 && recommendations.map(({
                recommendedBySub,
                recommendedByUsername,
                recommendedReelaySub, // unused right now
            }) => {
                return (
                    <RecUserPill key={recommendedBySub} onPress={() => {
                        advanceToUserProfile({ 
                            sub: recommendedBySub, 
                            username: recommendedByUsername,
                        });
                    }}>
                        <RecUserText>{recommendedByUsername ?? '@god'}</RecUserText>
                    </RecUserPill>
                );
            }) }
        </RecommendedByLineContainer>
    );
}

const ReelayedByLine = ({ navigation, watchlistItem }) => {
    const { recommendedReelaySub } = watchlistItem;
    const [pressed, setPressed] = useState(false);

    const advanceToSingleReelayScreen = async () => {
        setPressed(true);
        const singleReelay = await getReelay(recommendedReelaySub);
        const preparedReelay = await prepareReelay(singleReelay); 
        setPressed(false);
        navigation.push('SingleReelayScreen', { preparedReelay });
    }

    return (
        <RecommendedByLineContainer>
            <RecUserText>{`Reelayed by`}</RecUserText>   
            <RecUserPill onPress={advanceToSingleReelayScreen} pressed={pressed}>
                <RecUserText>{'@god'}</RecUserText>
            </RecUserPill>
        </RecommendedByLineContainer>
    );
}

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
                <RecommendedByLine navigation={navigation} watchlistItem={watchlistItem} /> 
            }
            { !!watchlistItem.recommendedReelaySub && 
                <ReelayedByLine navigation={navigation} watchlistItem={watchlistItem} />
            }
        </View>
    );
};
