import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { getReelay, getUserByUsername, prepareReelay } from '../../api/ReelayDBApi';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import ProfilePicture from '../global/ProfilePicture';
import { Icon } from 'react-native-elements';

const ProfilePictureOverlap = styled(View)`
    margin-left: -15px;
    text-shadow-color: rgba(0, 0, 0, 0.2);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const RecommendedByLineContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    margin-left: 40px;
    padding-bottom: 6px;
`
const ReelayedByLineContainer = styled(Pressable)`
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    margin-left: 25px;
    padding-bottom: 6px;
`
const RecUserText = styled(ReelayText.Body2)`
    color: white;
    justify-content: flex-end;
`
const RecUserTextEmphasized = styled(ReelayText.Body2Bold)`
    color: white;
    justify-content: flex-end;
    margin-left: 6px;
`

export const RecommendedByLine = ({ navigation, watchlistItem }) => {
    const { recommendations } = watchlistItem;
    const advanceToUserProfile = async () => {
        const creator = { 
            sub: recommendations[0].recommendedBySub, 
            username: recommendations[0].recommendedByUsername 
        };
        navigation.push('UserProfileScreen', { creator });
    }

    const profilePictures = recommendations.reverse().map(({ 
        recommendedBySub,
        recommendedByUsername,
    }) => {
        // just a name transformation
        const recUser = { sub: recommendedBySub, username: recommendedByUsername };
        return (
            <ProfilePictureOverlap key={recommendedBySub}>
                <ProfilePicture navigation={navigation} circle={true} user={recUser} size={30} />
            </ProfilePictureOverlap>
        );
    });

    const firstRecUsername = `@${recommendations[0].recommendedByUsername}`;
    return (
        <RecommendedByLineContainer key={firstRecUsername}>
            { profilePictures }
            <Pressable onPress={advanceToUserProfile}>
                <RecUserTextEmphasized>
                    { firstRecUsername }
                </RecUserTextEmphasized>
            </Pressable>
            <RecUserText>
                { recommendations.length > 1 && ` +${recommendations.length - 1} ` }
                { recommendations.length === 1 && ` recommends  ` }
                { recommendations.length > 1 && ` recommend  ` }
            </RecUserText>
        </RecommendedByLineContainer>
    );
}

export const ReelayedByLine = ({ navigation, watchlistItem }) => {
    const { recommendedReelaySub, recReelayCreatorName } = watchlistItem;
    const [pressed, setPressed] = useState(false);
    const [recReelayCreatorSub, setRecReelayCreatorSub] = useState('none');

    useEffect(() => {
        fetchCreatorSub();
    }, []);

    const fetchCreatorSub = async () => {
        try  {
            const { sub } = await getUserByUsername(recReelayCreatorName);
            setRecReelayCreatorSub(sub);    
        } catch (error) {
            console.log(error);
        }
    }

    const advanceToSingleReelayScreen = async () => {
        setPressed(true);
        const singleReelay = await getReelay(recommendedReelaySub);
        const preparedReelay = await prepareReelay(singleReelay); 
        setPressed(false);
        navigation.push('SingleReelayScreen', { preparedReelay });
    }

    const creator = {
        sub: recReelayCreatorSub, 
        username: recReelayCreatorName,
    }

    return (
        <ReelayedByLineContainer key={recommendedReelaySub} onPress={advanceToSingleReelayScreen}>
            <ProfilePicture circle={true} navigation={navigation} size={30} user={creator} />
            <RecUserTextEmphasized>{`@${recReelayCreatorName}`}</RecUserTextEmphasized>
            <RecUserText>{`'s reelay  `}</RecUserText>   
            <Icon type='ionicon' name='caret-forward-circle' size={24} color={(pressed) ? 'gray' : 'white'} />
        </ReelayedByLineContainer>
    );
}
