import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ClubPicture from '../global/ClubPicture';

const BackButtonContainer = styled(Pressable)`
    left: 16px;
    top: ${(props) => props.offset}px;
    position: absolute;
`
const ClubNameLine = styled(View)`
    align-items: center;
    flex-direction: row;
`
const ClubNameText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-right: 4px;
`
const HeaderBackground = styled(Pressable)`
    align-items: center;
    background-color: rgba(255,255,255,0.05);
    justify-content: flex-end;
    height: ${(props) => props.height}px;
    padding-bottom: 10px;
    position: absolute;
    width: 100%;
`
export default ClubBanner = ({ club, navigation, onGoBack = null }) => {
    const headerTopOffset = useSafeAreaInsets().top;
    const headerHeight = headerTopOffset + 72;

    const advanceToClubInfoScreen = () => navigation.push('ClubInfoScreen', { club });
    const onPress = () => (onGoBack) ? onGoBack() : navigation.goBack();

    return (
        <React.Fragment>
            <HeaderBackground height={headerHeight} onPress={advanceToClubInfoScreen}>
                <ClubPicture club={club} size={48} />
                <ClubNameLine>
                    <ClubNameText>{club.name}</ClubNameText>
                    <Icon type='ionicon' name={'information-circle-outline'} color={'white'} size={14} />
                </ClubNameLine>
            </HeaderBackground>
            <BackButtonContainer offset={headerTopOffset} onPress={onPress}>
                <Icon type='ionicon' name={'arrow-back-outline'} color={'white'} size={30} />
            </BackButtonContainer>
        </React.Fragment>
    );
}
