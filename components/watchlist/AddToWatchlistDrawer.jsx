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
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addTitleToClub, getClubMembers } from '../../api/ClubsApi';
import { showErrorToast, showMessageToast } from '../utils/toasts';
import ClubPicture from '../global/ClubPicture';
import MarkSeenButton from '../watchlist/MarkSeenButton';

import { AddToClubsIconSVG, ChatsTabIconSVG } from '../global/SVGs';
import ProfilePicture from '../global/ProfilePicture';
import { addToMyWatchlist } from '../../api/WatchlistApi';
import { notifyClubOnTitleAdded } from '../../api/ClubNotifications';
import { notifyOnAddedToWatchlist } from '../../api/WatchlistNotifications';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AddTitleButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 24px;
    flex-direction: row;
    justify-content: center;
    height: 48px;
    width: ${width - 32}px;
`
const AddTitleButtonOuterContainer = styled(View)`
    align-items: center;
    margin-top: 20px;
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
    display: flex;
    flex: 1;
`
const ClubNameText = styled(ReelayText.Subtitle1Emphasized)`
    color: ${(props) => (props.isAlreadyAdded) ? 'gray' : 'white' };
`
const CreateClubView = styled(View)`
    align-items: center;
    border-radius: 8px;
    justify-content: center;
    margin-top: 23px;
    width: 100%;
`
const CreateClubGradient = styled(LinearGradient)`
    border-radius: 24px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const CreateClubPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: rgba(255,255,255,0.25);
    border-radius: 24px;
    height: 48px;
    flex-direction: row;
    justify-content: center;
    margin-top: 12px;
    margin-bottom: 12px;
    width: 240px;
`
const DrawerContainer = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    margin-top: auto;
    max-height: 60%;
    padding-bottom: ${props => props.bottomOffset}px;
    width: 100%;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px;
    padding-bottom: 10px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 20px;
`
const ModalContainer = styled(View)`
    position: absolute;
`
const ProfilePictureContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const PromptHeadingText = styled(ReelayText.H4Bold)`
    color: white;
    font-size: 18px;
    line-height: 30px;
    text-align: center;
`
const PromptButtonText = styled(ReelayText.CaptionEmphasized)`
    color: white;
`
const RowContainer = styled(Pressable)`
    align-items: center;
    background-color: ${(props) => props.backgroundColor};
    flex-direction: row;
    padding: 6px;
    padding-left: 20px;
    padding-right: 20px;
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;    
`
const ScrollViewContainer = styled(ScrollView)`
    margin-bottom: 10px;
`
export default AddToWatchlistDrawer = ({ 
    navigation,
    titleObj, 
    reelay,
    drawerVisible, 
    setDrawerVisible, 
    markedSeen,
    setMarkedSeen,
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
    const dispatch = useDispatch();
    const titleKey = `${titleObj.titleType}-${titleObj.id}`;

    const myClubs = useSelector(state => state.myClubs);
    const clubsToSend = useRef([]);

    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const sendToWatchlist = useRef(false); // todo

    const bottomOffset = useSafeAreaInsets().bottom;
    const closeDrawer = () => setDrawerVisible(false);
    const [addingTitle, setAddingTitle] = useState(false);

    const matchWatchlistItem = (nextWatchlistItem) => {
        if (!nextWatchlistItem.hasAcceptedRec) return false;
        const { titleType, tmdbTitleID } = nextWatchlistItem;
        const watchlistItemTitleKey = `${titleType}-${tmdbTitleID}`;
        return (watchlistItemTitleKey === titleKey);
    }

    const isAlreadyAddedToWatchlist = myWatchlistItems.find(matchWatchlistItem);

    const Header = () => {
        return (
            <HeaderContainer>
                <HeaderText>
                    { isAlreadyAddedToWatchlist ? 'Added to my watchlist' : 'Add to watchlist' }
                </HeaderText>
                <MarkSeenButton markedSeen={markedSeen} setMarkedSeen={setMarkedSeen} titleObj={titleObj} />
            </HeaderContainer>
        );
    }

    const AddTitleButton = () => {
        const addToClubWrapper = async (club) => {
            const addTitleResult = await addTitleToClub({
                authSession,
                addedByUsername: reelayDBUser?.username,
                addedByUserSub: reelayDBUser?.sub,
                clubID: club.id,
                titleType: titleObj.titleType,
                tmdbTitleID: titleObj.id,
            });

            // we need to refresh club membership before sending notifications
            // since a user can share a title before loading the club page
            // (and therefore before loading club membership)
            club.members = await getClubMembers({
                authSession,
                clubID: club.id,
                reqUserSub: reelayDBUser?.sub,
            });

            notifyClubOnTitleAdded({
                club,
                clubTitle: addTitleResult,
                addedByUser: reelayDBUser,
            });

            logAmplitudeEventProd('addedNewTitleToClub', {
                addedBy: reelayDBUser?.username,
                clubID: club?.id,
                clubName: club?.name,
                title: titleObj?.display,
            });

            club.titles = [addTitleResult, ...club.titles];
            dispatch({ type: 'setUpdatedClub', payload: club });
            return addTitleResult;
        }

        const addTitleToAllSelectedClubs = async () => {
            try {
                if (addingTitle) return;
                setAddingTitle(true);
                const addTitleResults = await Promise.all(clubsToSend.current.map(addToClubWrapper));
                if (sendToWatchlist.current) await addToWatchlistWrapper();
                setAddingTitle(false);
                const clubsWord = (addTitleResults.length > 1) ? 'clubs' : 'club';
                if (addTitleResults?.length > 0) {
                    showMessageToast(`Added ${titleObj.display} to ${addTitleResults.length} ${clubsWord}`);
                } else if (sendToWatchlist.current) {
                    showMessageToast(`Added ${titleObj.display} to your watchlist`);
                }
                
            } catch (error) {
                console.log(error);
                showErrorToast('Ruh roh! Couldn\'t add to clubs. Try again?');
                setAddingTitle(false);
            }
        } 

        const addToWatchlistWrapper = async () => {
            if (isAlreadyAddedToWatchlist) return;
            const addToWatchlistResult = await addToMyWatchlist({
                authSession,
                reqUserSub: reelayDBUser?.sub,
                reelaySub: reelay?.sub,
                creatorName: reelay?.creator?.username,
                tmdbTitleID: titleObj.id,
                titleType: titleObj.titleType,
            });
            const nextWatchlistItems = [addToWatchlistResult, ...myWatchlistItems];

            // todo: should also be conditional based on user settings
            if (reelay?.creator) {
                notifyOnAddedToWatchlist({
                    reelayedByUserSub: reelay?.creator?.sub,
                    addedByUserSub: reelayDBUser?.sub,
                    addedByUsername: reelayDBUser?.username,
                    watchlistItem: addToWatchlistResult,
                });    
            }

            logAmplitudeEventProd('addToMyWatchlist', {
                title: titleObj?.display,
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
            });
            dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems });
            showMessageToast(`Added ${titleObj.display} to your watchlist`);
        }

        return (
            <AddTitleButtonOuterContainer bottomOffset={bottomOffset}>
                <AddTitleButtonContainer onPress={addTitleToAllSelectedClubs}>
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

    const CreateClubPrompt = () => {
        const headingText = 'Watchlist too long?';
        const advanceToCreateClubScreen = () => {
            closeDrawer();
            navigation.push('CreateClubScreen');
        }

        const CreateClubButton = () => {
            return (
                <CreateClubPressable onPress={advanceToCreateClubScreen}>
                    <CreateClubGradient 
                        colors={[ReelayColors.reelayBlue, ReelayColors.reelayRed]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                    <PromptButtonText>{'Start a club'}</PromptButtonText>
                </CreateClubPressable>
            );
        }
        
        return (
            <CreateClubView>
                <PromptHeadingText>{headingText}</PromptHeadingText>
                <CreateClubButton />
            </CreateClubView>
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

        const isAlreadyAddedToClub = club.titles.find(findTitleInClub);
        const iconName = (isAlreadyAddedToClub) ? 'checkmark-done' : 'checkmark';
        const iconColor = (isAlreadyAddedToClub) ? 'gray' : 'white';    

        const markRow = () => {
            if (isAlreadyAddedToClub) return;
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

        if (club?.id === reelay?.clubID) return <View />;

        return (
            <RowContainer backgroundColor={backgroundColor} onPress={markRow}>
                <ClubRowContainer>
                    <ProfilePictureContainer>
                        <ClubPicture club={club} size={32} />
                    </ProfilePictureContainer>
                    <ClubNameText isAlreadyAdded={isAlreadyAddedToClub}>{club.name}</ClubNameText>
                </ClubRowContainer>
                { (rowHighlighted || isAlreadyAddedToClub) && (
                    <CheckmarkIconContainer>
                        <Icon type='ionicon' name={iconName} size={30} color={iconColor} />
                    </CheckmarkIconContainer>                        
                )}
                {(!rowHighlighted && !isAlreadyAddedToClub) && (
                    <CheckmarkIconContainer>
                        <ChatsTabIconSVG />
                    </CheckmarkIconContainer>
                )}
            </RowContainer>
        );
    }

    const AddToMyWatchlistRow = () => {
        const [rowHighlighted, setRowHighlighted] = useState(sendToWatchlist.current);
        const backgroundColor = (rowHighlighted) ? ReelayColors.reelayBlue : '#1a1a1a';

        const markSendToWatchlist = () => {
            if (isAlreadyAddedToWatchlist) return;
            if (sendToWatchlist.current) {
                sendToWatchlist.current = false;
                setRowHighlighted(false);
            } else {
                sendToWatchlist.current = true;
                setRowHighlighted(true);
            }
        }

        const iconName = (isAlreadyAddedToWatchlist) ? 'checkmark-done' : 'checkmark';
        const iconColor = (isAlreadyAddedToWatchlist) ? 'gray' : 'white';    

        return (
            <RowContainer backgroundColor={backgroundColor} onPress={markSendToWatchlist}>
                <ClubRowContainer>
                    <ProfilePictureContainer>
                        <ProfilePicture user={reelayDBUser} size={32} />
                    </ProfilePictureContainer>
                    <ClubNameText isAlreadyAdded={isAlreadyAddedToWatchlist}>{'My Watchlist'}</ClubNameText>
                </ClubRowContainer>
                { (rowHighlighted || isAlreadyAddedToWatchlist) && (
                    <CheckmarkIconContainer>
                        <Icon type='ionicon' name={iconName} size={30} color={iconColor} />
                    </CheckmarkIconContainer>                        
                )}
                {(!rowHighlighted && !isAlreadyAddedToWatchlist) && (
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
                <DrawerContainer bottomOffset={bottomOffset}>
                    <Header />
                    <ScrollViewContainer contentContainerStyle={{ alignItems: 'center' }}>
                        <AddToMyWatchlistRow />
                        { myClubs.length > 1 && <SelectClubsList /> }
                    </ScrollViewContainer>
                    { myClubs.length > 1 && <AddTitleButton /> }
                    { myClubs.length === 0 && <CreateClubPrompt /> }
                </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
}
