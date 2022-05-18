import React from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ClubPicture from '../global/ClubPicture';
import BackButton from '../utils/BackButton';

const BackButtonContainer = styled(View)`
    left: 6px;
    justify-content: flex-end;
    position: absolute;
    top: ${props => props.topOffset}px;
`
const ClubNameText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-right: 4px;
`
const HeaderBackground = styled(Pressable)`
    align-items: flex-end;
    background-color: rgba(0,0,0,0.35);
    flex-direction: row;
    height: ${(props) => props.height}px;
    justify-content: center;
    padding-left: 6px;
    padding-right: 16px;
    padding-bottom: 10px;
    position: absolute;
    width: 100%;
`
const HeaderCenterContainer = styled(TouchableOpacity)`
    align-items: center;
    justify-content: flex-end;
`
const InfoButtonContainer = styled(TouchableOpacity)`
    flex-direction: row;
    margin-left: 5px;
    position: absolute;
    right: 16px;
    top: ${props => props.topOffset}px;
`
export default ClubBanner = ({ club, navigation }) => {
    const topOffset = useSafeAreaInsets().top;
    const headerHeight = topOffset + 72;
    const backButtonTopOffset = topOffset + 22;
    const infoButtonTopOffset = topOffset + 32;

    const advanceToClubInfoScreen = () => navigation.push('ClubInfoScreen', { club });

    const HeaderCenter = () => {
        return (
            <HeaderCenterContainer>
                <ClubPicture club={club} size={48} />
                <ClubNameText>{club.name}</ClubNameText>
            </HeaderCenterContainer>
        );
    }

    const InfoButton = () => {
        return (
            <InfoButtonContainer onPress={advanceToClubInfoScreen} topOffset={infoButtonTopOffset}>
                <Icon type='ionicon' name='information-circle-outline' size={30} color='white' />
            </InfoButtonContainer>
        );
    }

    return (
        <HeaderBackground height={headerHeight} onPress={advanceToClubInfoScreen}>
            <BackButtonContainer topOffset={backButtonTopOffset}>
                <BackButton navigation={navigation} />
            </BackButtonContainer>
            <HeaderCenter />
            <InfoButton />
        </HeaderBackground>
    );
}
