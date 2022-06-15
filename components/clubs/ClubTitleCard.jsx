import React, { useContext, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import ProfilePicture from '../global/ProfilePicture';
import { Icon } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
import TitlePoster from '../global/TitlePoster';
import { getRuntimeString } from '../utils/TitleRuntime';
import ClubTitleDotMenuDrawer from './ClubTitleDotMenuDrawer';
import MarkSeenButton from '../watchlist/MarkSeenButton';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';

const { height, width } = Dimensions.get('window');

const BottomRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 16px;
    margin-bottom: 0px;
    bottom: 12px;
    position: absolute;
    width: ${width - 64}px;
`
const BottomRowLeftText = styled(ReelayText.Subtitle2)`
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
const ContributorRowSpacer = styled(View)`
    margin-right: 6px;
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
    position: absolute;
    top: 32px;
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
    margin-top: 8px;
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
    height: 200px;
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
                <CreateReelayText>{'Add Reelay'}</CreateReelayText>
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
            <ContributorRowSpacer />
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

    const inWatchlist = myWatchlistItems.find((nextItem) => {
        const { tmdbTitleID, titleType, hasAcceptedRec } = nextItem;
        const isSeries = (titleType === 'tv');
        return (tmdbTitleID === title.id) 
            && (isSeries === title.isSeries)
            && (hasAcceptedRec === true);
    });

    const [markedSeen, setMarkedSeen] = useState(inWatchlist && inWatchlist?.hasSeenTitle);
    const advanceToTitleScreen = () => navigation.push('TitleDetailScreen', { 
        titleObj: clubTitle?.title 
    });
    const onPress = () => (clubTitle.reelays.length) ? advanceToFeed() : advanceToTitleScreen();

    const CardTopLine = () => {
        return (
            <CardTopLineContainer>
                <CardTopLineContainerLeft>
                    <FontAwesomeIcon icon={ faListCheck } size={20} color='white' />
                    <View style={{ marginRight: 10 }} />
                    <ProfilePicture user={addedByUser} size={24} />
                    <AddedByUsername>{addedByUsername + ' added'}</AddedByUsername>
                </CardTopLineContainerLeft>
                <CardTopLineContainerRight>
                    <MarkSeenButton markedSeen={markedSeen} setMarkedSeen={setMarkedSeen} titleObj={title} />
                    { dotMenuButtonVisible && <DotMenuButton /> }
                </CardTopLineContainerRight>
            </CardTopLineContainer>
        );
    }

    const DotMenuButton = () => {
        const openDrawer = () => setDotMenuVisible(true);

        const addedByMe = (clubTitle.addedByUserSub === reelayDBUser?.sub);
        const isAdmin = (reelayDBUser?.role === 'admin');
        const canDelete = (clubTitle.reelays.length === 0) && (addedByMe || isAdmin);
        const [dotMenuVisible, setDotMenuVisible] = useState(false);

        if (!canDelete) return <View />;
    
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
        <TitleCardPressable onPress={onPress}>
            <TitleCardGradient colors={['#252527', '#19242E']}  start={{ x: 0.5, y: 0.5 }} end={{ x: 0.5, y: 1 }} />
            <CardTopLine />
            <TitleLine />
            { (!clubTitle.reelays.length) && <CardBottomRowNoStacks navigation={navigation} clubTitle={clubTitle} /> }
            { (clubTitle.reelays.length > 0) && (
                <CardBottomRowWithStacks advanceToFeed={advanceToFeed} clubTitle={clubTitle} />
            )}
        </TitleCardPressable>
    );
}
