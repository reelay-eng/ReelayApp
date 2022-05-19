import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import ProfilePicture from '../global/ProfilePicture';
import { Icon } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from 'react-redux';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import TitlePoster from '../global/TitlePoster';
import { getRuntimeString } from '../utils/TitleRuntime';
import ClubTitleDotMenuDrawer from './ClubTitleDotMenuDrawer';
import ReelayColors from '../../constants/ReelayColors';
import { getWatchlistItems, markWatchlistItemSeen, markWatchlistItemUnseen } from '../../api/WatchlistApi';
import { showMessageToast } from '../utils/toasts';

const { height, width } = Dimensions.get('window');

const BottomRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 16px;
    margin-bottom: 0px;
    bottom: 16px;
    position: absolute;
    width: ${width - 64}px;
`
const BottomRowLeftText = styled(ReelayText.Subtitle2)`
    margin-left: 8px;
    color: #86878B;
`
const ContributorPicContainer = styled(View)`
    margin-left: -10px;
`
const ContributorRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 10px;
`
const CreateReelayButton = styled(TouchableOpacity)`
    align-items: center;
    background-color: #444950;
    border-radius: 17px;
    flex-direction: row;
    justify-content: center;
    height: 30px;
    padding-left: 8px;
    padding-right: 12px;
`
const CreateReelayText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 12px;
    line-height: 16px;
`
const CardTopLineContainer = styled(View)`
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    margin: 16px;
    margin-bottom: 4px;
`
const CardTopLineContainerLeft = styled(View)`
    align-items: center;
    flex-direction: row;
`
const CardTopLineContainerRight = styled(View)`
    align-items: flex-end;
`
const AddedByUsername = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    margin-left: 8px;
    padding-top: 4px;
`
const DescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
`
const DotMenuButtonContainer = styled(TouchableOpacity)`
    padding-right: 4px;
`
const MarkSeenButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    padding-left: 4px;
`
const MarkSeenText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    padding-right: 6px;
`
const PlayReelaysButton = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 17px;
    flex-direction: row;
    justify-content: center;
`
const TitleDetailLine = styled(View)`
    justify-content: center;
    margin-left: 8px;
    width: ${width - 128}px;
`
const TitleLineContainer = styled(View)`
    flex-direction: row;
    margin-left: 16px;
    margin-right: 16px;
    margin-bottom: 8px;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    color: white;
    display: flex;
    flex-wrap: wrap;
    font-size: 18px;
`
const TitleCardGradient = styled(LinearGradient)`
    border-radius: 11px;
    height: 100%;
    width: 100%;
    position: absolute;
`
const TitleCardPressable = styled(TouchableOpacity)`
    background-color: black;
    border-radius: 11px;
    height: 220px;
    margin-top: 8px;
    width: ${width-32}px;
`

const CardBottomRowNoStacks = ({ navigation, clubTitle }) => {
    const advanceToCreateReelay = () => navigation.push('VenueSelectScreen', { 
        clubID: clubTitle.clubID,
        titleObj: clubTitle.title, 
    });
    return (
        <BottomRowContainer>
            <BottomRowLeftText>{'0 reelays, be the first!'}</BottomRowLeftText>
            <CreateReelayButton onPress={advanceToCreateReelay}>
                <Icon type='ionicon' name='add' color='white' size={20} />
                <CreateReelayText>{'Create Reelay'}</CreateReelayText>
            </CreateReelayButton>
        </BottomRowContainer>
    );
}

const CardBottomRowWithStacks = ({ advanceToFeed, clubTitle }) => {
    const MAX_DISPLAY_CREATORS = 5;
    const myFollowing = useSelector(state => state.myFollowing);
    const inMyFollowing = (creator) => !!myFollowing.find((nextFollowing) => nextFollowing.sub === creator.sub);

    const getDisplayCreators = () => {
        // list up to five profile pics, first preference towards people you follow
        const uniqueCreatorEntries = clubTitle.reelays.reduce((creatorEntries, nextReelay) => {
            const nextCreator = { 
                sub: nextReelay?.creator?.sub,
                username: nextReelay?.creator?.username,
                isFollowing: inMyFollowing(nextReelay?.creator)
            };

            if (!creatorEntries[nextCreator?.sub]) {
                creatorEntries[nextCreator?.sub] = nextCreator;
            }
            return creatorEntries;
        }, {});

        const uniqueCreatorList = Object.values(uniqueCreatorEntries);
        if (uniqueCreatorList.length <= MAX_DISPLAY_CREATORS) return uniqueCreatorList;
        return uniqueCreatorList.slice(MAX_DISPLAY_CREATORS);
    }
    
    return (
        <BottomRowContainer>
            <CreatorProfilePicRow 
                displayCreators={getDisplayCreators()} 
                reelayCount={clubTitle.reelays.length} 
            />
            <PlayReelaysButton onPress={advanceToFeed}>
                <Icon type='ionicon' name='play-circle' color='white' size={30} />
            </PlayReelaysButton>
        </BottomRowContainer>
    );
}

const CreatorProfilePicRow = ({ displayCreators, reelayCount }) => {
    const pluralCount = (reelayCount > 1) ? 's' : '';
    const reelayCountText = `${reelayCount} reelay${pluralCount}`;
    const renderProfilePic = (creator) => {
        return (
            <ContributorPicContainer key={creator?.sub}>
                <ProfilePicture user={creator} size={24} />
            </ContributorPicContainer>
        );
    }
    return (
        <ContributorRowContainer>
            { displayCreators.map(renderProfilePic) }
            <BottomRowLeftText>{reelayCountText}</BottomRowLeftText>
        </ContributorRowContainer>
    );
}

export default ClubTitleCard = ({ 
    advanceToFeed,
    club, 
    clubTitle, 
    navigation, 
    onRefresh,
}) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const { addedByUserSub, addedByUsername, title } = clubTitle;
    const addedByUser = { sub: addedByUserSub, username: addedByUsername };

    const isAddedByMe = (addedByUserSub === reelayDBUser?.sub);
    const isClubOwner = (club.creatorSub === reelayDBUser?.sub);
    const dotMenuButtonVisible = (isAddedByMe || isClubOwner || reelayDBUser?.role === 'admin');

    const releaseYear = (title?.releaseDate && title?.releaseDate.length >= 4) 
        ? title.releaseDate.slice(0,4) : '';
    const runtimeString = getRuntimeString(title?.runtime);

    const CardTopLine = () => {
        return (
            <CardTopLineContainer>
                <CardTopLineContainerLeft>
                    <ProfilePicture user={addedByUser} size={24} />
                    <AddedByUsername>{`Added by ${addedByUsername}`}</AddedByUsername>
                </CardTopLineContainerLeft>
                <CardTopLineContainerRight>
                    <MarkSeenButton />
                    { dotMenuButtonVisible && <DotMenuButton /> }
                </CardTopLineContainerRight>
            </CardTopLineContainer>
        );
    }

    const DotMenuButton = () => {
        const [dotMenuVisible, setDotMenuVisible] = useState(false);
        const openDrawer = () => setDotMenuVisible(true);
        return (
            <DotMenuButtonContainer onPress={openDrawer}>
                <Icon type='ionicon' name='ellipsis-horizontal' size={20} color='white' />
                { dotMenuVisible && (
                    <ClubTitleDotMenuDrawer 
                        navigation={navigation}
                        clubTitle={clubTitle}
                        drawerVisible={dotMenuVisible}
                        setDrawerVisible={setDotMenuVisible}
                        onRefresh={onRefresh}
                    />
                )}
            </DotMenuButtonContainer>
        );
    }

    const MarkSeenButton = () => {
        const inWatchlist = !!myWatchlistItems.find((nextItem) => {
            const { tmdbTitleID, titleType, hasAcceptedRec, hasSeenTitle } = nextItem;
            return (tmdbTitleID === clubTitle.tmdbTitleID) 
                && (titleType === clubTitle.titleType)
                && (hasAcceptedRec)
                && (hasSeenTitle);
        });    
        const [markedSeen, setMarkedSeen] = useState(inWatchlist);

        const updateWatchlistReqBody = { 
            reqUserSub: reelayDBUser?.sub, 
            tmdbTitleID: clubTitle.tmdbTitleID, 
            titleType: clubTitle.titleType,
        };

        const markSeen = async () => {
            setMarkedSeen(true);
            const markSeenResult = await markWatchlistItemSeen(updateWatchlistReqBody);
            console.log('mark seen result: ', markSeenResult);
            // todo: update state in my watchlist
            showMessageToast('Title marked as seen');
    
            logAmplitudeEventProd('markWatchlistItemSeen', {
                username: reelayDBUser?.username,
                title: clubTitle?.title?.display,
                source: 'clubActivityScreen',
                clubName: club?.name,
            });

            const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
            dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })    
        }

        const markUnseen = async () => {
            setMarkedSeen(false);
            const markUnseenResult = await markWatchlistItemUnseen(updateWatchlistReqBody);
            console.log('mark unseen result: ', markUnseenResult);
            // todo: update state in my watchlist
            showMessageToast('Title marked unseen');

            logAmplitudeEventProd('markWatchlistItemUnseen', {
                username: reelayDBUser?.username,
                title: clubTitle?.title?.display,
                source: 'clubActivityScreen',
                clubName: club?.name,
            });

            const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
            dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })    
        }

        return (
            <MarkSeenButtonContainer onPress={(markedSeen) ? markUnseen : markSeen}>
                <MarkSeenText>{'Seen'}</MarkSeenText>
                { markedSeen && <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayBlue} size={30} />}
                { !markedSeen && <Icon type='ionicon' name='ellipse-outline' color={'white'} size={30} />}
            </MarkSeenButtonContainer>
        );
    }

    const TitleLine = () => {
        return (
            <TitleLineContainer>
                <TitlePoster title={title} width={56} />
                <TitleDetailLine>
                    <TitleText numberOfLines={2}>{title.display}</TitleText>
                    <DescriptionText>{`${releaseYear}    ${runtimeString}`}</DescriptionText>
                </TitleDetailLine>
            </TitleLineContainer>
        );
    }

    return (
        <TitleCardPressable onPress={advanceToFeed}>
            <TitleCardGradient colors={['#252527', '#19242E']} />
            <CardTopLine />
            <TitleLine />
            { (!clubTitle.reelays.length) && <CardBottomRowNoStacks navigation={navigation} clubTitle={clubTitle} /> }
            { (clubTitle.reelays.length > 0) && (
                <CardBottomRowWithStacks advanceToFeed={advanceToFeed} clubTitle={clubTitle} />
            )}
        </TitleCardPressable>
    );
}
