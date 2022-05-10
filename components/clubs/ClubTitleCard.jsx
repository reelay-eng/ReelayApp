import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import ProfilePicture from '../global/ProfilePicture';
import { Icon } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from 'react-redux';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import TitlePoster from '../global/TitlePoster';
import { getRuntimeString } from '../utils/TitleRuntime';

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
const AddedByLine = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 16px;
`
const AddedByLineLeft = styled(View)`
    align-items: center;
    flex-direction: row;
`
const AddedByUsername = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    margin-left: 8px;
    padding-top: 4px;
`
const DescriptionLine = styled(View)`
    margin-left: 16px;
    margin-right: 16px;
    margin-bottom: 9px;
`
const DescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
`
const DotMenuButtonContainer = styled(TouchableOpacity)`
    padding-left: 4px;
    padding-right: 4px;
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
const TitleLine = styled(View)`
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
    margin-bottom: 8px;
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

const CardBottomRowWithStacks = ({ advanceToClubTitleFeed, clubTitle }) => {
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
                reelayCount={topic.reelays.length} 
            />
            <PlayReelaysButton onPress={advanceToClubTitleFeed}>
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

export default ClubTitleCard = ({ navigation, clubTitle }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const { addedByUserSub, addedByUsername, clubID, title } = clubTitle;
    const addedByUser = { sub: addedByUserSub, username: addedByUsername };

    const releaseYear = (title?.releaseDate && title?.releaseDate.length >= 4) 
        ? title.releaseDate.slice(0,4) : '';
    const runtimeString = getRuntimeString(title?.runtime);


    // const canPress = (topic.reelays.length > 0);
    // const creator = {
    //     sub: topic.creatorSub,
    //     username: topic.creatorName,
    // };

    // const globalTopicsWithReelays = useSelector(state => state.globalTopicsWithReelays);
    // const topicFeedIndex = globalTopicsWithReelays.findIndex((nextTopic) => nextTopic.id === topic.id);

    const advanceToClubTitleFeed = () => {
        if (clubTitle.reelays.length) {
            navigation.push('ClubTitleFeedScreen', { 
                initClubTitleIndex: 0,
            });    
            logAmplitudeEventProd('openedClubTitleFeed', {
                title: title.display,
                username: reelayDBUser?.username,
            });
        }
    }

    // const DotMenuButton = () => {
    //     const [topicDotMenuVisible, setTopicDotMenuVisible] = useState(false);
    //     const openDrawer = () => setTopicDotMenuVisible(true);
    //     return (
    //         <DotMenuButtonContainer onPress={openDrawer}>
    //             <Icon type='ionicon' name='ellipsis-horizontal' size={20} color='white' />
    //             { topicDotMenuVisible && (
    //                 <TopicDotMenuDrawer 
    //                     navigation={navigation}
    //                     topic={topic}
    //                     drawerVisible={topicDotMenuVisible}
    //                     setDrawerVisible={setTopicDotMenuVisible}
    //                 />
    //             )}
    //         </DotMenuButtonContainer>
    //     );
    // }

    return (
        <TitleCardPressable onPress={() => {}}>
            <TitleCardGradient colors={['#252527', '#19242E']} />
            <AddedByLine>
                <AddedByLineLeft>
                    <ProfilePicture user={addedByUser} size={24} />
                    <AddedByUsername>{`Added by ${addedByUsername}`}</AddedByUsername>
                </AddedByLineLeft>
                {/* <DotMenuButton /> */}
            </AddedByLine>
            <TitleLine>
                <TitlePoster title={title} width={56} />
                <TitleDetailLine>
                    <TitleText numberOfLines={2}>{title.display}</TitleText>
                    <DescriptionText>{`${releaseYear}    ${runtimeString}`}</DescriptionText>
                </TitleDetailLine>
            </TitleLine>
            { (!clubTitle.reelays.length) && <CardBottomRowNoStacks navigation={navigation} clubTitle={clubTitle} /> }
            { (clubTitle.reelays.length > 0) && (
                <CardBottomRowWithStacks advanceToClubTitleFeed={advanceToClubTitleFeed} clubTitle={clubTitle} />
            )}
        </TitleCardPressable>
    );
}
