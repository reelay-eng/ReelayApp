import React, { useContext, useState } from 'react';
import { 
    Dimensions, 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    ScrollView,
    TouchableOpacity, 
    View,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const DrawerContainer = styled(View)`
    align-items: center;
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    margin-top: auto;
    max-height: 70%;
    padding-bottom: ${props => props.bottomOffset}px;
    width: 100%;
`
const ModalContainer = styled(View)`
    position: absolute;
`
const OptionText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
`
const PostButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 24px;
    height: 48px;
    justify-content: center;
    margin: 5%;
    width: 90%;
`
const ProfilePictureContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const ProfileRowContainer = styled(TouchableOpacity)`
    display: flex;
    align-items: center;
    background-color: ${props => (props.selected) 
        ? ReelayColors.reelayBlue 
        : '#1a1a1a'
    };
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;    
    border-radius: 12px;
    flex-direction: row;
    margin-left: 16px;
    margin-right: 16px;
    margin-top: 16px;
    padding: 6px;
    padding-left: 20px;
    padding-right: 20px;
`
const RowContainer = styled(TouchableOpacity)`
    display: flex;
    align-items: center;
    background-color: ${props => (props.selected) 
        ? ReelayColors.reelayBlue 
        : '#1a1a1a'
    };
    border-radius: 12px;
    flex-direction: row;
    margin-left: 16px;
    margin-right: 16px;
    padding: 6px;
    padding-left: 20px;
    padding-right: 20px;
`
const SelectClubsListContainer = styled(View)`
    border-radius: 16px;
    display: flex;
    flex: 1;
    justify-content: center;
    margin-top: 16px;
    width: 100%;
`

export default PostDestinationDrawer = ({ publishReelay, drawerVisible, setDrawerVisible }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [selectedClubID, setSelectedClubID] = useState(null);    
    const myClubs = useSelector(state => state.myClubs);

    const bottomOffset = useSafeAreaInsets().bottom;
    const closeDrawer = () => setDrawerVisible(false);

    const PostButton = () => {
        return (
            <PostButtonContainer onPress={() => publishReelay(selectedClubID)}>
                <OptionText>{'Post'}</OptionText>
            </PostButtonContainer>
        );
    }

    const SelectClubsList = () => {
        return (
            <SelectClubsListContainer>
                { myClubs.map((club, index) => <SelectClubRow key={club.id} club={club} index={index} />) }
            </SelectClubsListContainer>
        );
    }
    
    const SelectClubRow = ({ club, index }) => {     
        const clubIsSelected = (selectedClubID === club.id); 
        const selectClub = () => setSelectedClubID(club.id); 

        return (
            <RowContainer onPress={selectClub} selected={clubIsSelected}>
                <ProfilePictureContainer>
                    <ClubPicture club={club} size={32} />
                </ProfilePictureContainer>
                <OptionText>{club.name}</OptionText>
            </RowContainer>
        );
    }    

    const SelectMyProfileRow = () => {
        const profileIsSelected = (selectedClubID === null); 
        const selectMyProfile = () => setSelectedClubID(null);
        return (            
            <ProfileRowContainer onPress={selectMyProfile} selected={profileIsSelected}>
                <ProfilePictureContainer>
                    <ProfilePicture user={reelayDBUser} size={32} />
                </ProfilePictureContainer>
                <OptionText>{'On My Public Profile'}</OptionText>
            </ProfileRowContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerVisible}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <Backdrop onPress={closeDrawer}/>
                <DrawerContainer bottomOffset={bottomOffset}>
                    <ScrollView 
                        contentContainerStyle={{ width: width }}
                        showsVerticalScrollIndicator={false}>
                        <SelectMyProfileRow />
                        <SelectClubsList />
                        <PostButton />
                    </ScrollView>
                </DrawerContainer>
            </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
}