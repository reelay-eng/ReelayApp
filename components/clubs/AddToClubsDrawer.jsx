import React, { useContext, useRef, useState } from 'react';
import { 
    ActivityIndicator, 
    Dimensions, 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    ScrollView,
    TouchableOpacity, 
    View,
} from 'react-native';
import { Icon } from 'react-native-elements';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addMemberToClub, addTitleToClub } from '../../api/ClubsApi';
import { showErrorToast, showMessageToast } from '../utils/toasts';
import ClubPicture from '../global/ClubPicture';

import { AddToClubsIconSVG, AddedToClubsIconSVG } from '../global/SVGs';
import ProfilePicture from '../global/ProfilePicture';

const { width } = Dimensions.get('window');

const AddTitleButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    width: ${width - 32}px;
`
const AddTitleButtonOuterContainer = styled(View)`
    align-items: center;
    bottom: ${(props) => props.bottomOffset ?? 0}px;
    position: absolute;
    width: 100%;
`
const AddTitleButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`
const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const CheckmarkIconContainer = styled(View)`
    align-items: center;
    justify-content: center;
    height: 30px;
    width: 30px;
`
const ClubRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`
const ClubNameText = styled(ReelayText.Subtitle1Emphasized)`
    color: ${(props) => (props.isAlreadyAdded) ? 'gray' : 'white' };
`
const DrawerContainer = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    margin-top: auto;
    max-height: 70%;
    padding-bottom: 80px;
    width: 100%;
`
const HeaderContainer = styled(View)`
    align-items: center;
    padding: 12px;
`
const HeaderText = styled(ReelayText.CaptionEmphasized)`
    color: white;
`
const ModalContainer = styled(View)`
    position: absolute;
`
const ProfilePictureContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const RowContainer = styled(Pressable)`
    display: flex;
    align-items: center;
    background-color: ${(props) => props.backgroundColor};
    flex-direction: row;
    justify-content: space-between;
    padding: 6px;
    padding-left: 20px;
    padding-right: 20px;
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;    
`
const ScrollViewContainer = styled(ScrollView)`
    margin-bottom: 10px;
`
export default AddToClubsDrawer = ({ drawerVisible, setDrawerVisible, titleObj, reelay }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const myClubs = useSelector(state => state.myClubs);
    const clubsToSend = useRef([]);
    const sendToWatchlist = useRef(false); // todo
    const titleKey = `${titleObj.titleType}-${titleObj.id}`;

    const bottomOffset = useSafeAreaInsets().bottom;
    const closeDrawer = () => setDrawerVisible(false);
    const [addingTitle, setAddingTitle] = useState(false);

    const Header = () => {
        return (
            <HeaderContainer>
                <HeaderText>{'Add to a club'}</HeaderText>
            </HeaderContainer>
        );
    }

    const AddTitleButton = () => {
        const addTitleAsync = async (club) => {
            const addTitleResult = await addTitleToClub({
                addedByUsername: reelayDBUser?.username,
                addedByUserSub: reelayDBUser?.sub,
                clubID: club.id,
                titleType: titleObj.titleType,
                tmdbTitleID: titleObj.tmdbTitleID,
            });
            console.log('added title to club: ', club.name, addTitleResult);
            return addTitleResult;
        }

        const addTitleToSelectedClubs = async () => {
            try {
                if (addingTitle) return;
                setAddingTitle(true);
                const addTitleResults = await Promise.all(clubsToSend.map(addTitleAsync))
                console.log('Add results: ', addTitleResults);
                setAddingTitle(false);
                const clubsWord = (addTitleResults.length > 1) ? 'clubs' : 'club';
                showMessageToast(`Added ${titleObj.display} to ${addTitleResults.length} ${clubsWord}`);
                onRefresh();
            } catch (error) {
                console.log(error);
                showErrorToast('Ruh roh! Couldn\'t add to clubs. Try again?');
                setAddingTitle(false);
            }
        } 

        return (
            <AddTitleButtonOuterContainer bottomOffset={bottomOffset}>
                <AddTitleButtonContainer onPress={addTitleToSelectedClubs}>
                    { addingTitle && <ActivityIndicator /> }
                    { !addingTitle && (
                        <React.Fragment>
                            <Icon type='ionicon' name='bookmark' size={16} color='white' />                 
                            <AddTitleButtonText>{'Add title'}</AddTitleButtonText>   
                        </React.Fragment>
                    )}
                </AddTitleButtonContainer>
            </AddTitleButtonOuterContainer>
        );
    }

    const SelectClubsList = () => {
        return (
            <React.Fragment>
                { myClubs.map(club => <SelectClubRow key={club.id} club={club} />) }
            </React.Fragment>
        );
    }

    const SelectClubRow = ({ club }) => {
        const findClubMarked = (nextClub) => nextClub.id === club.id;
        const hasMarkedToSend = clubsToSend.current.find(findClubMarked);
        const [rowHighlighted, setRowHighlighted] = useState(hasMarkedToSend);
        const backgroundColor = (rowHighlighted) ? ReelayColors.reelayBlue : '#1a1a1a';

        const findTitleInClub = (nextClubTitle) => {
            const nextClubTitleKey = `${nextClubTitle.titleType}-${nextClubTitle.tmdbTitleID}`;
            return (nextClubTitleKey === titleKey);
        }

        const isAlreadyAdded = club.titles.find(findTitleInClub);
        const iconName = (isAlreadyAdded) ? 'checkmark-done' : 'checkmark';
        const iconColor = (isAlreadyAdded) ? 'gray' : 'white';    

        const markRow = () => {
            if (isAlreadyAdded) return;
            if (rowHighlighted) {
                unmarkClubToSend(club);
                setRowHighlighted(false);
            } else {
                markClubToSend(club);
                setRowHighlighted(true);
            }    
        }

        const markClubToSend = () => {
            clubsToSend.current.push(club);
            return true;
        }

        const unmarkClubToSend = () => {
            clubsToSend.current = clubsToSend.current.filter((nextClub) => {
                return nextClub.id !== club.id;
            })
            return false;
        }    

        return (
            <RowContainer backgroundColor={backgroundColor} onPress={markRow}>
                <ClubRowContainer>
                    <ProfilePictureContainer>
                        <ClubPicture club={club} size={32} />
                    </ProfilePictureContainer>
                    <ClubNameText isAlreadyAdded={isAlreadyAdded}>{club.name}</ClubNameText>
                </ClubRowContainer>
                { (rowHighlighted || isAlreadyAdded) && (
                    <CheckmarkIconContainer>
                        <Icon type='ionicon' name={iconName} size={30} color={iconColor} />
                    </CheckmarkIconContainer>                        
                )}
                {(!rowHighlighted && !isAlreadyAdded) && (
                    <CheckmarkIconContainer>
                        <AddToClubsIconSVG size={30} />
                    </CheckmarkIconContainer>
                )}
            </RowContainer>
        );
    }

    const SelectMyWatchlistRow = () => {
        const [rowHighlighted, setRowHighlighted] = useState(false);
        const backgroundColor = (rowHighlighted) ? ReelayColors.reelayBlue : '#1a1a1a';
        const isAlreadyAdded = false;

        const iconName = (isAlreadyAdded) ? 'checkmark-done' : 'checkmark';
        const iconColor = (isAlreadyAdded) ? 'gray' : 'white';    

        const markRow = () => {
            if (isAlreadyAdded) return;
            if (rowHighlighted) {
                sendToWatchlist.current = false;
                setRowHighlighted(false);
            } else {
                sendToWatchlist.current = true;
                setRowHighlighted(true);
            }    
        }

        return (
            <RowContainer backgroundColor={backgroundColor} onPress={markRow}>
                <ClubRowContainer>
                    <ProfilePictureContainer>
                        <ProfilePicture user={reelayDBUser} size={32} />
                    </ProfilePictureContainer>
                    <ClubNameText isAlreadyAdded={isAlreadyAdded}>{'My Watchlist'}</ClubNameText>
                </ClubRowContainer>
                { (rowHighlighted || isAlreadyAdded) && (
                    <CheckmarkIconContainer>
                        <Icon type='ionicon' name={iconName} size={30} color={iconColor} />
                    </CheckmarkIconContainer>                        
                )}
                {(!rowHighlighted && !isAlreadyAdded) && (
                    <CheckmarkIconContainer>
                        <AddToClubsIconSVG size={30} />
                    </CheckmarkIconContainer>
                )}
            </RowContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerVisible}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <Backdrop onPress={closeDrawer}/>
                <DrawerContainer>
                    <Header />
                    <ScrollViewContainer>
                        <SelectMyWatchlistRow />
                        <SelectClubsList />
                    </ScrollViewContainer>
                    <AddTitleButton />
                </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
}
