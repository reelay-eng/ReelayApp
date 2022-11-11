import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';

import * as ReelayText from '../global/Text';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { ChatsIconSVG } from '../global/SVGs';
import ReelayColors from '../../constants/ReelayColors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAddressBook, faPlus } from '@fortawesome/free-solid-svg-icons';

const { height, width } = Dimensions.get('window');

const AddressBookView = styled(View)`
    align-items: center;
    background-color: rgba(255,255,255,0.3);
    border-radius: 8px;
    justify-content: center;
    padding: 20px;
    padding-top: 16px;
    padding-bottom: 16px;
`
const CreateClubPressable = styled(TouchableOpacity)`
    align-items: center;
    border-color: white;
    border-radius: 24px;
    border-width: 1px;
    height: 48px;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 12px;
    width: 200px;
`
const CreateClubText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    display: flex;
    font-size: 16px;
    line-height: 20px;
    margin-right: 6px;
    text-align: center;
`
const EmptyClubsGradient = styled(LinearGradient)`
    border-radius: 16px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const EmptyClubsView = styled(View)`
    align-items: center;
    display: flex;
    justify-content: center;
    margin-left: 16px;
    margin-right: 16px;
    margin-top: 24px;
    margin-bottom: 100px;
    width: ${width - 32}px;
`
const SectionBody = styled(ReelayText.Body2)`
    color: white;
    display: flex;
    font-size: 16px;
    margin-top: 4px;
    margin-bottom: 12px;
    text-align: center;
`
const SectionHeader = styled(ReelayText.H5Bold)`
    color: white;
    display: flex;
    line-height: 28px;
    text-align: center;
`
const SectionSpacer = styled(View)`
    height: 0px;
`
const SectionView = styled(View)`
    align-items: center;
    padding: 12px;
    padding-left: 20px;
    padding-right: 20px;
    width: 100%;
`
const TopAndBottomSpacer = styled(View)`
    height: 18px;
`

export default EmptyClubsCard = ({ navigation }) => {

    const CreateClubButton = () => {
        const advanceToCreateClubScreen = () => {
            navigation.push('CreateClubScreen');
        }

        return (
            <CreateClubPressable onPress={advanceToCreateClubScreen}>
                <CreateClubText>{'Create a Chat'}</CreateClubText>
                <FontAwesomeIcon icon={faPlus} color='white' size={16} />
            </CreateClubPressable>
        );
    }

    return (
        <EmptyClubsView>
            <EmptyClubsGradient colors={['#6AB5FF', ReelayColors.reelayBlue]} />
            <TopAndBottomSpacer />
            <AddressBookView>
                <FontAwesomeIcon icon={faAddressBook} color='white' size={30} />
            </AddressBookView>
            <SectionView>
                <SectionHeader numberOfLines={3}>
                    {'Reelay works best with friends'}
                </SectionHeader>
                <SectionBody numberOfLines={3}>
                    {'Talk to your friends & family in a private space'}
                </SectionBody>
            </SectionView>
            {/* <SectionSpacer />
            <SectionView>
                <SectionHeader numberOfLines={3}>
                    {'Invite friends'}
                </SectionHeader>
                <SectionBody numberOfLines={3}>
                    {'Build shared watchlists with a\nsmaller group'}
                </SectionBody>
            </SectionView>
            <SectionView>
                <SectionHeader numberOfLines={3}>
                    {'Or keep it solo'}
                </SectionHeader>
                <SectionBody numberOfLines={3}>
                    {'Make a group for your film diary'}
                </SectionBody>
            </SectionView> */}
            <CreateClubButton />
            <TopAndBottomSpacer />
        </EmptyClubsView>
    );
}