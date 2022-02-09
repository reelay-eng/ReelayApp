import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { getReelay, prepareReelay } from '../../api/ReelayDBApi';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

const RecommendedByLineContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    padding-bottom: 10px;
`
const ReelayedByLineContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    padding-bottom: 10px;
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

export const RecommendedByLine = ({ navigation, watchlistItem }) => {
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
                        <RecUserText>{`@${recommendedByUsername}` ?? '@god'}</RecUserText>
                    </RecUserPill>
                );
            }) }
        </RecommendedByLineContainer>
    );
}

export const ReelayedByLine = ({ navigation, watchlistItem }) => {
    const { recommendedReelaySub, recReelayCreatorName } = watchlistItem;
    const [pressed, setPressed] = useState(false);

    const advanceToSingleReelayScreen = async () => {
        setPressed(true);
        const singleReelay = await getReelay(recommendedReelaySub);
        const preparedReelay = await prepareReelay(singleReelay); 
        setPressed(false);
        navigation.push('SingleReelayScreen', { preparedReelay });
    }

    return (
        <ReelayedByLineContainer>
            <RecUserText>{`Reelayed by`}</RecUserText>   
            <RecUserPill onPress={advanceToSingleReelayScreen} pressed={pressed}>
                <RecUserText>{`@${recReelayCreatorName}`}</RecUserText>
            </RecUserPill>
        </ReelayedByLineContainer>
    );
}
