import React, { useContext } from 'react';
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
import ReelayThumbnail from '../global/ReelayThumbnail';
import { ReviewIconSmallSVG } from '../global/SVGs';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const { height, width } = Dimensions.get('window');

const AddReelayToTopicPressable = styled(TouchableOpacity)`
    align-items: center;
    align-self: flex-start;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    height: 36px;
    justify-content: center;
    width: 36px;
`
const AddedByUsername = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 14px;
    line-height: 20px;
`
const BottomRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 16px;
    margin-bottom: 0px;
    bottom: 12px;
    width: ${width - 64}px;
`
const BottomRowLeftText = styled(ReelayText.Subtitle2)`
    color: #86878B;
`
const ContributorPicView = styled(View)`
    margin-left: -10px;
`
const ContributorRowView = styled(View)`
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
const DescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
`
const DotMenuButtonView = styled(TouchableOpacity)`
    right: 8px;
    position: absolute;
`
const AddReelayButtonView = styled(View)`
    align-items: flex-end;
    justify-content: center;
    padding: 5px;
`
const MediaSectionView = styled(View)`
    align-items: center;
    flex-direction: row;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 8px;
`
const MediaSectionSpacer = styled(View)`
    width: 10px;
`
const MediaThumbnailView = styled(View)`
    margin: 2px;
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.5;
`
const MediaThumbnailGridView = styled(View)`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: 50%;
`
const PlayReelaysButton = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 17px;
    flex-direction: row;
    justify-content: center;
`
const SharedTitleText = styled(ReelayText.Overline)`
    color: white;
`
const TitleCardGradient = styled(LinearGradient)`
    border-radius: 11px;
    height: 100%;
    width: ${width-32}px;
    position: absolute;
`
const TitleCardPressable = styled(TouchableOpacity)`
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 11px;
    width: ${width-32}px;
`
const TitleCardOuterView = styled(View)`
    align-items: center;
`
const TitleDetailLine = styled(View)`
    display: flex;
    flex: 1;
    justify-content: center;
    margin-left: 8px;
`
const TitleLineView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin: 8px;
    padding-left: 6px;
`
const TitleOverlineView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-top: 8px;
    margin-bottom: 12px;
    width: ${width-32}px;
`
const TitleOverlineInfoView = styled(View)`
    margin-left: 8px;
`
const TitlePosterView = styled(View)`
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.5;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    color: white;
    display: flex;
    flex-wrap: wrap;
    font-size: 18px;
`

const CARD_WIDTH = width - 32;
const TITLE_POSTER_WIDTH = (CARD_WIDTH - 32) / 2;
const THUMBNAIL_WIDTH = (TITLE_POSTER_WIDTH - 8) / 2;
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * 1.5;

const CardBottomRowNoStacks = ({ navigation, clubTitle }) => {
    const advanceToCreateReelay = () => navigation.push('VenueSelectScreen', { 
        clubID: clubTitle.clubID,
        titleObj: clubTitle.title, 
    });
    return (
        <BottomRowView>
            <BottomRowLeftText>{'0 reelays, be the first!'}</BottomRowLeftText>
            <CreateReelayButton onPress={advanceToCreateReelay}>
                <Icon type='ionicon' name='add' color='white' size={20} />
                <CreateReelayText>{'Add Reelay'}</CreateReelayText>
            </CreateReelayButton>
        </BottomRowView>
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
        <BottomRowView>
            <CreatorProfilePicRow 
                displayCreators={getDisplayCreators()} 
                reelayCount={clubTitle.reelays.length} 
            />
            <PlayReelaysButton onPress={advanceToFeed}>
                <Icon type='ionicon' name='play-circle' color='white' size={30} />
            </PlayReelaysButton>
        </BottomRowView>
    );
}

const CreatorProfilePicRow = ({ displayCreators, reelayCount }) => {
    const pluralCount = (reelayCount > 1) ? 's' : '';
    const reelayCountText = `${reelayCount} reelay${pluralCount}`;
    const renderProfilePic = (creator) => {
        return (
            <ContributorPicView key={creator?.sub}>
                <ProfilePicture user={creator} size={24} />
            </ContributorPicView>
        );
    }
    return (
        <ContributorRowView>
            { displayCreators.map(renderProfilePic) }
            <ContributorRowSpacer />
            <BottomRowLeftText>{reelayCountText}</BottomRowLeftText>
        </ContributorRowView>
    );
}

export default ClubTitleCard = ({ 
    advanceToFeed,
    club, 
    clubTitle, 
    navigation, 
    onRefresh,
    setExpandedTitle,
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
    
    const expandedTitle = inWatchlist ?? {
        title,
        canAddToWatchlist: true,
    };

    const openExpandedTitleDrawer = () => setExpandedTitle(expandedTitle);
    const onPress = () => (clubTitle.reelays.length) ? advanceToFeed() : openExpandedTitleDrawer();

    const DotMenuButton = () => {
        const dispatch = useDispatch();
        const openedActivityDotMenu = useSelector(state => state.openedActivityDotMenu);
        const titleDotMenuVisible = (openedActivityDotMenu && openedActivityDotMenu?.id === clubTitle?.id);
        const openDrawer = () => {
            dispatch({ type: 'setOpenedActivityDotMenu', payload: clubTitle });
        }

        const addedByMe = (clubTitle.addedByUserSub === reelayDBUser?.sub);
        const isAdmin = (reelayDBUser?.role === 'admin');
        const canDelete = (clubTitle.reelays.length === 0) && (addedByMe || isAdmin);

        if (!canDelete) return <View />;
    
        return (
            <DotMenuButtonView onPress={openDrawer}>
                <Icon type='ionicon' name='ellipsis-horizontal' size={20} color='white' />
                { titleDotMenuVisible && (
                    <ClubTitleDotMenuDrawer clubTitle={clubTitle} onRefresh={onRefresh} />
                )}
            </DotMenuButtonView>
        );
    }

    const MediaSection = () => {
        const displayReelays = clubTitle.reelays.filter((reelay, index) => index < 4);
        const hasOneTitle = (displayReelays.length === 1);

        const thisThumbnailHeight = (hasOneTitle) ? THUMBNAIL_HEIGHT * 2 : THUMBNAIL_HEIGHT;
        const thisThumbnailWidth = (hasOneTitle) ? THUMBNAIL_WIDTH * 2 : THUMBNAIL_WIDTH;

        return (
            <MediaSectionView>
                <TitlePosterView>
                    <TitlePoster 
                        onPress={openExpandedTitleDrawer} 
                        title={title} 
                        width={TITLE_POSTER_WIDTH} 
                    />
                </TitlePosterView>
                <MediaSectionSpacer />
                <MediaThumbnailGridView>
                    { displayReelays.map((reelay, index) => {
                        const thumbnailOnPress = () => advanceToFeed(index);
                        return (
                            <MediaThumbnailView key={reelay?.id}>
                                <ReelayThumbnail
                                    height={thisThumbnailHeight}
                                    margin={0}
                                    onPress={thumbnailOnPress}
                                    reelay={reelay}
                                    showIcons={false}
                                    showLikes={false}
                                    showVenue={false}
                                    width={thisThumbnailWidth}
                                />
                            </MediaThumbnailView>
                        );
                    })}
                </MediaThumbnailGridView>
            </MediaSectionView>
        );
    }

    const TitleLine = () => {
        const advanceToCreateReelay = () => navigation.push('VenueSelectScreen', { 
            clubID: clubTitle.clubID,
            titleObj: clubTitle.title, 
        });
        return (
            <TitleLineView>
                <ReviewIconSmallSVG />
                <TitleDetailLine>
                    <TitleText numberOfLines={2}>{title.display}</TitleText>
                    <DescriptionText>{`${releaseYear}    ${runtimeString}`}</DescriptionText>
                </TitleDetailLine>
                <AddReelayButtonView>
                    <AddReelayToTopicPressable onPress={advanceToCreateReelay}>
                        <FontAwesomeIcon icon={faPlus} size={20} color='white' />
                    </AddReelayToTopicPressable>
                </AddReelayButtonView>
            </TitleLineView>
        );
    }

    const TitleOverline = () => {
        return (
            <TitleOverlineView>
                <ProfilePicture user={addedByUser} size={32} />
                <TitleOverlineInfoView>
                    <AddedByUsername>{addedByUsername}</AddedByUsername>
                    <SharedTitleText>{'SHARED A TITLE'}</SharedTitleText>
                </TitleOverlineInfoView>
                { dotMenuButtonVisible && <DotMenuButton /> }
            </TitleOverlineView>
        );
    }

    return (
        <TitleCardOuterView>
            <TitleOverline />
            <TitleCardPressable onPress={onPress}>
                <TitleLine />
                <MediaSection />
                { (!clubTitle.reelays.length) && <CardBottomRowNoStacks navigation={navigation} clubTitle={clubTitle} /> }
                { (clubTitle.reelays.length > 0) && (
                    <CardBottomRowWithStacks advanceToFeed={advanceToFeed} clubTitle={clubTitle} />
                )}
            </TitleCardPressable>
        </TitleCardOuterView>
    );
}
