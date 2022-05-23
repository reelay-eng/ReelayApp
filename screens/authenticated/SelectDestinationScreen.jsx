import React, { useContext, useRef, useState } from 'react';
import { 
    ActivityIndicator, 
    Dimensions, 
    Pressable, 
    ScrollView,
    SafeAreaView, 
    View,
    TouchableOpacity,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { HeaderWithBackButton } from '../../components/global/Headers';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import ClubPicture from '../../components/global/ClubPicture';
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import ProfilePicture from '../../components/global/ProfilePicture';
import BackButton from '../../components/utils/BackButton';
import TitlePoster from '../../components/global/TitlePoster';
import { VenueIcon } from '../../components/utils/VenueIcon';
import { ClubsIconSVG } from '../../components/global/SVGs';

const ClubNameText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
`
const ContinueButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    align-self: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 18px;
    bottom: ${props => props.bottomOffset}px;
    height: 36px;
    justify-content: center;
    position: absolute;
    width: 90%;
`
const ContinueButtonText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
`
const MyClubsHeaderContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    padding-left: 24px;
    padding-bottom: 12px;
`
const MyClubsHeaderText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
    font-size: 16px;
    line-height: 20px
`
const ProfilePictureContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const RowContainer = styled(TouchableOpacity)`
    display: flex;
    align-items: center;
    background-color: #1a1a1a;
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;    
    border-bottom-left-radius: ${props => props.lastRow ? 12 : 0}px;
    border-bottom-right-radius: ${props => props.lastRow ? 12 : 0}px;
    border-top-left-radius: ${props => props.firstRow ? 12 : 0}px;
    border-top-right-radius: ${props => props.firstRow ? 12 : 0}px;
    flex-direction: row;
    margin-left: 16px;
    margin-right: 16px;
    padding: 6px;
    padding-left: 20px;
    padding-right: 20px;
`
const RowLeftContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`
const ScreenContainer = styled(SafeAreaView)`
    height: 100%;
    width: 100%;
    background-color: black;
`
const SelectClubsListContainer = styled(View)`
    border-radius: 16px;
    display: flex;
    flex: 1;
    justify-content: center;
    margin-top: 16px;
    margin-bottom: 24px;
`
const TitleHeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    padding-left: 16px;
    padding-right: 16px;
    margin-top: 24px;
    margin-bottom: 12px;
`
const TitleInfoContainer = styled(View)`
    margin-left: 10px;
    display: flex;
    flex: 1;
`
const TitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const VenueContainer = styled(View)`
    margin-top: -4px;
    margin-right: 5px;
`
const YearText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-bottom: 4px;
`
const YearVenueContainer = styled(View)`
    flex-direction: row;
    margin-top: 10px;
`

export default SelectDestinationScreen = ({ navigation, route }) => {
    const { titleObj, venue } = route.params;
    const { reelayDBUser } = useContext(AuthContext);
    const myClubs = useSelector(state => state.myClubs);
    const bottomOffset = useSafeAreaInsets().bottom;

    const advancetoCameraScreen = (clubID = null) => {
        navigation.push('ReelayCameraScreen', { clubID, titleObj, topicID: null, venue });
    }

    const ContinueButton = () => {
        return (
            <ContinueButtonContainer bottomOffset={bottomOffset}>
                <ContinueButtonText>
                    {'Continue'}
                </ContinueButtonText>
            </ContinueButtonContainer>
        )
    }

    const SelectClubsList = () => {
        return (
            <SelectClubsListContainer>
                <MyClubsHeaderContainer>
                    <ClubsIconSVG size={24} />
                    <MyClubsHeaderText>{'  My Clubs'}</MyClubsHeaderText>
                </MyClubsHeaderContainer>
                { myClubs.map((club, index) => <SelectClubRow key={club.id} club={club} index={index} />) }
            </SelectClubsListContainer>
        );
    }
    
    const SelectClubRow = ({ club, index }) => {        
        return (
            <RowContainer 
                firstRow={index === 0} 
                lastRow={index === (myClubs.length - 1)}
                onPress={() => advancetoCameraScreen(club?.id)} 
            >
                <ProfilePictureContainer>
                    <ClubPicture club={club} size={32} />
                </ProfilePictureContainer>
                <ClubNameText>{club.name}</ClubNameText>
            </RowContainer>
        );
    }    

    const SelectMyProfileRow = () => {
        return (            
            <React.Fragment>
                <MyClubsHeaderContainer>
                    <Icon type='ionicon' name='earth' color='white' size={24} />
                    <MyClubsHeaderText>{'  Global'}</MyClubsHeaderText>
                </MyClubsHeaderContainer>
                <RowContainer firstRow={true} lastRow={true} onPress={() => advancetoCameraScreen()}>
                    <ProfilePictureContainer>
                        <ProfilePicture user={reelayDBUser} size={32} />
                    </ProfilePictureContainer>
                    <ClubNameText>{'On My Profile'}</ClubNameText>
                </RowContainer>
            </React.Fragment>
        );
    }

    const TitleHeader = () => {
        const displayYear = (titleObj.releaseYear) ? titleObj.releaseYear : '';
        return (
            <TitleHeaderContainer>
                <TitlePoster title={titleObj} width={60} />
                <TitleInfoContainer>
                    <TitleText numberOfLines={2}>{titleObj?.display}</TitleText>
                    <YearVenueContainer>
                        { venue && 
                            <VenueContainer>
                                <VenueIcon venue={venue} size={20} border={1} />
                            </VenueContainer>
                        }
                        { titleObj?.releaseYear?.length > 0 && <YearText>{displayYear}</YearText> }
                    </YearVenueContainer>
                </TitleInfoContainer>
            </TitleHeaderContainer>
        );
    }

    return (
        <ScreenContainer>
            <HeaderWithBackButton navigation={navigation} text={'Where do you want to post?'} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <TitleHeader />
                <SelectClubsList />
                <SelectMyProfileRow />
            </ScrollView>
            {/* <ContinueButton /> */}
        </ScreenContainer>
	);
}