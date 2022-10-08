import React, { useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';

import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { HeaderWithBackButton } from '../../components/global/Headers';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEarthAmericas, faLock } from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

const ContinueText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 15px;
`
const CreateClubButtonView = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 40px;
    justify-content: center;
    height: 40px;
    width: ${width - 56}px;
`
const CreateScreenView = styled(SafeAreaView)`
    background-color: black;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const ClubSettingRowPressable = styled(Pressable)`
    align-items: center;
    flex-direction: row;
    padding: 16px;
    padding-left: 0px;
    width: 100%;
`
const ClubSettingIconView = styled(View)`
    margin-right: 16px;
`
const ClubSettingInfoView = styled(View)`
    display: flex;
    flex: 1;
`
const ClubSettingBodyText = styled(ReelayText.Caption)`
    color: white;
`
const ClubSettingHeadingText = styled(ReelayText.Body1)`
    color: white;
`
const ClubSettingSelectedView = styled(View)`
    margin-left: 16px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 28px;
    line-height: 36px;
`
const HeaderView = styled(View)`
`
const SectionView = styled(View)`
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 16px;
`
const SectionViewBottom = styled(SectionView)`
    align-items: center;
    bottom: 20px;
`
const Spacer = styled(View)`
    height: 24px;
`

export default CreateClubScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const visibilityRef = useRef('private');

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const ContinueButton = () => {
        const onPress = () => {
            navigation.push('CreateClubPart2Screen', { clubVisibility: visibilityRef?.current });
        }

        return (
            <CreateClubButtonView onPress={onPress}>
                <ContinueText>{'Continue'}</ContinueText>
            </CreateClubButtonView>
        );
    }

    const SettingsRow = ({ isSelected, isPrivate, onPress }) => {
        const headingText = (isPrivate)
            ? 'Private Chat'
            : 'Public Chat';
        const bodyText = (isPrivate)
            ? 'Closed group. Invite people to the chat'
            : 'Open group. Anyone can join';

        const renderSettingIcon = () => (isPrivate)
            ? <FontAwesomeIcon icon={faLock} color='white' size={27} />
            : <FontAwesomeIcon icon={faEarthAmericas} color='white' size={27} />

        return (
            <ClubSettingRowPressable onPress={onPress}>
                <ClubSettingIconView>
                    { renderSettingIcon() }
                </ClubSettingIconView>
                <ClubSettingInfoView>
                    <ClubSettingHeadingText>{headingText}</ClubSettingHeadingText>
                    <ClubSettingBodyText>{bodyText}</ClubSettingBodyText>
                </ClubSettingInfoView>
                <ClubSettingSelectedView>
                    { isSelected && <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayBlue} size={30} />}
                    { !isSelected && <Icon type='ionicon' name='ellipse-outline' color={'white'} size={30} />}
                </ClubSettingSelectedView>
            </ClubSettingRowPressable>
        );
    }

    const PublicOrPrivatePrompt = () => {
        const [isPrivate, setIsPrivate] = useState(visibilityRef.current === 'private');
        const onSelectPrivate = () => {
            setIsPrivate(true);
            visibilityRef.current = 'private';
        }
        const onSelectPublic = () => {
            setIsPrivate(false);
            visibilityRef.current = FEED_VISIBILITY;
        }

        return (
            <SectionView>
                <HeaderText>{'Is this chat public or private?'}</HeaderText>
                <Spacer />
                <SettingsRow isSelected={isPrivate} isPrivate={true} onPress={onSelectPrivate} />
                <SettingsRow isSelected={!isPrivate} isPrivate={false} onPress={onSelectPublic} />
            </SectionView> 
        );
    }

    const Header = () => {
        return (
            <HeaderView>
                <HeaderWithBackButton navigation={navigation} text={'start a new chat'} />
            </HeaderView>
        );
    }

    return (
        <CreateScreenView>
            <View>
                <Header />
                <Spacer />
                <PublicOrPrivatePrompt />
            </View>
            <SectionViewBottom>
                <ContinueButton />
            </SectionViewBottom>
        </CreateScreenView>
    );
};
