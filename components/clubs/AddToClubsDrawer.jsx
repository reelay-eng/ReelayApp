import React, { useContext, useRef, useState } from 'react';
import { 
    ActivityIndicator, 
    Dimensions, 
    Image,
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
import { addTitleToClub, getClubMembers } from '../../api/ClubsApi';
import { showErrorToast, showMessageToast } from '../utils/toasts';
import ClubPicture from '../global/ClubPicture';
import DogWithGlasses from '../../assets/images/dog-with-glasses.png';
import MarkSeenButton from '../watchlist/MarkSeenButton';

import { AddToClubsIconSVG, AddedToClubsIconSVG } from '../global/SVGs';
import ProfilePicture from '../global/ProfilePicture';
import { addToMyWatchlist } from '../../api/WatchlistApi';
import { notifyClubOnTitleAdded } from '../../api/ClubNotifications';
import { notifyOnAddedToWatchlist } from '../../api/WatchlistNotifications';
import { LinearGradient } from 'expo-linear-gradient';

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
    display: flex;
    flex: 1;
`
const ClubNameText = styled(ReelayText.Subtitle1Emphasized)`
    color: ${(props) => (props.isAlreadyAdded) ? 'gray' : 'white' };
`
const CreateClubView = styled(View)`
    align-items: center;
    border-radius: 8px;
    height: 248px;
    margin-top: 23px;
    width: 90%;
`
const CreateClubGradient = styled(LinearGradient)`
    border-radius: 8px;
    height: 248px;
    position: absolute;
    width: 100%;
`
const DogWithGlassesImage = styled(Image)`
    height: 57px;
    width: 57px;
`
const DogWithGlassesContainer = styled(View)`
    align-items: center;
    justify-content: center;
    margin: 20px;
    margin-bottom: 10px;
`
const DrawerContainer = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    margin-top: auto;
    max-height: 60%;
    padding-bottom: 80px;
    width: 100%;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px;
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
const PromptHeadingText = styled(ReelayText.H4Bold)`
    color: white;
    font-size: 24px;
    line-height: 30px;
    text-align: center;
`
const PromptBodyText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    margin: 6px;
    text-align: center;
    width: 75%;
`
const PromptButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: white;
    border-radius: 40px;
    flex-direction: row;
    justify-content: center;
    margin-top: 8px;
    padding: 8px;
    padding-left: 12px;
    padding-right: 14px;
`
const PromptButtonText = styled(ReelayText.CaptionEmphasized)`
    color: black;
    margin-left: 4px;
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
export default AddToClubsDrawer = ({ 
    navigation,
    titleObj, 
    reelay,
    drawerVisible, 
    setDrawerVisible, 
    setIsAddedToWatchlist,
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

    const Header = () => {
        return (
            <HeaderContainer>
                <HeaderText>{'Add to a club'}</HeaderText>
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

        const addToWatchlistWrapper = async () => {
            setIsAddedToWatchlist(true);
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
        }

        const addTitleToAllSelectedClubs = async () => {
            try {
                if (addingTitle) return;
                setAddingTitle(true);
                const addTitleResults = await Promise.all(clubsToSend.current.map(addToClubWrapper))
                if (sendToWatchlist.current) {
                    addToWatchlistWrapper();
                }
                setAddingTitle(false);
                const clubsWord = (addTitleResults.length > 1) ? 'clubs' : 'club';
                if (addTitleResults.length > 1) {
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
        const headingText = 'watchlist too long?';
        const bodyText1 = 'create a club and separate your watchlist by vibe or audience!';
        const bodyText2 = `(You don’t need to invite anyone)`;

        const advanceToCreateClubScreen = () => {
            closeDrawer();
            navigation.push('CreateClubScreen');
        }

        const PromptButton = () => {
            return (
                <PromptButtonPressable onPress={advanceToCreateClubScreen}>
                    <Icon type='ionicon' name='add' color='black' size={20} />
                    <PromptButtonText>
                        {'Create a club'}
                    </PromptButtonText>
                </PromptButtonPressable>
            );
        }
        
        return (
            <CreateClubView>
                <CreateClubGradient colors={['#FF4848', '#038AFF']} />
                <DogWithGlassesContainer>
                    <DogWithGlassesImage source={DogWithGlasses} />
                </DogWithGlassesContainer>
                <PromptHeadingText>{headingText}</PromptHeadingText>
                <PromptBodyText>{bodyText1}</PromptBodyText>
                <PromptBodyText>{bodyText2}</PromptBodyText>
                <PromptButton />
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
            if (nextClubTitleKey === titleKey) console.log('found!');
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

        if (club?.id === reelay?.clubID) return <View />;

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

        const matchWatchlistItem = (nextWatchlistItem) => {
            if (!nextWatchlistItem.hasAcceptedRec) return false;
            const { titleType, tmdbTitleID } = nextWatchlistItem;
            const watchlistItemTitleKey = `${titleType}-${tmdbTitleID}`;
            return (watchlistItemTitleKey === titleKey);
        }

        const isAlreadyAdded = myWatchlistItems.find(matchWatchlistItem);
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
                    <ScrollViewContainer contentContainerStyle={{ alignItems: 'center' }}>
                        <SelectMyWatchlistRow />
                        { myClubs.length > 1 && <SelectClubsList /> }
                        { myClubs.length === 0 && <CreateClubPrompt /> }
                    </ScrollViewContainer>
                    <AddTitleButton />
                </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
}
