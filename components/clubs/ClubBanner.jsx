import React, { useContext, useEffect, useRef, useState } from 'react';
import { Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../utils/BackButton';
import ClubPicture from '../global/ClubPicture';

const BackButtonContainer = styled(SafeAreaView)`
    left: 0px;
    position: absolute;
`
const ClubNameText = styled(ReelayText.Subtitle2)`
    color: white;
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
export default ClubBanner = ({ club, navigation }) => {
    const headerTopOffset = useSafeAreaInsets().top;
    const headerHeight = headerTopOffset + 60;

    const advanceToClubInfoScreen = () => navigation.push('ClubInfoScreen', { club });

    return (
        <React.Fragment>
            <HeaderBackground height={headerHeight} onPress={advanceToClubInfoScreen}>
                <ClubPicture club={club} size={30} />
                <ClubNameText>{club.name}</ClubNameText>
            </HeaderBackground>
            <BackButtonContainer>
                <BackButton navigation={navigation} />
            </BackButtonContainer>
        </React.Fragment>
    );
}
