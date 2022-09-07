import React, { Fragment, useState } from 'react';
import { Dimensions, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import ProfilePicture from '../global/ProfilePicture';
import { Icon } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import TopicDotMenuDrawer from './TopicDotMenuDrawer';
import ReelayColors from '../../constants/ReelayColors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faComments, faPlus } from '@fortawesome/free-solid-svg-icons';
import ReelayThumbnail from '../global/ReelayThumbnail';
import TitlePoster from '../global/TitlePoster';

const { height, width } = Dimensions.get('window');
const CARD_WIDTH_CAROUSEL = width - 48;
const CARD_WIDTH_LIST = width - 32;

const getTopicCardWidth = (props) => props.horizontal ? CARD_WIDTH_CAROUSEL : CARD_WIDTH_LIST;
const getContentRowWidth = (props) => getTopicCardWidth(props) - 24;
const getThumbnailWidth = (props) => (getTopicCardWidth(props) - 32) / 2;
const getPosterWidth = (props) => (getThumbnailWidth(props) - 8) / 2;

const AddReelayToTopicPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    height: 40px;
    justify-content: center;
    margin-top: 16px;
    width: 40px;
`
const BottomRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 16px;
    margin-top: 24px;
    margin-bottom: 8px;
    bottom: 16px;
    width: ${props => getContentRowWidth(props)}px;
`
const BottomRowContainerNoReelays = styled(BottomRowContainer)`
    justify-content: center;
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
const CreatorName = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 14px;
    line-height: 20px;
`
const DescriptionLine = styled(View)`
    margin-right: 16px;
    margin-bottom: 9px;
`
const DescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    line-height: 18px;
`
const DividerLine = styled(View)`
    background-color: rgba(255,255,255,0.1);
    height: 1px;
    margin: 10px;
    width: ${width - 56}px;
`
const DotMenuButtonContainer = styled(TouchableOpacity)`
    padding-left: 8px;
    padding-right: 8px;
`
const PlayReelaysButton = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 17px;
    flex-direction: row;
    justify-content: center;
`
const SharedTopicText = styled(ReelayText.Overline)`
    color: white;
`
const StartConvoButton = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 18px;
    flex-direction: row;
    justify-content: center;
    height: 36px;
    width: ${props => getContentRowWidth(props) - 32}px;
`
const StartConvoText = styled(ReelayText.Overline)`
    color: white;
`
const ContentNoReelaysSectionView = styled(View)`
    justify-content: flex-start;
    margin-top: 8px;
    width: ${props => getContentRowWidth(props)}px;
`
const ContentNoReelaysIconView = styled(View)`
    align-items: center;
    height: 160px;
    justify-content: center;
    width: ${props => getContentRowWidth(props)}px;
`
const ContentWithReelaysSectionView = styled(View)`
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 8px;
    width: ${props => getContentRowWidth(props)}px;
`
const TitlePosterView = styled(View)`
    margin-right: 4px;
    margin-bottom: 4px;
`
const ContentWithReelaysPosterGridView = styled(View)`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    height: ${props => props.hasTwoTitles 
        ? getPosterWidth(props) * 1.5
        : getThumbnailWidth(props) * 1.5
    }px;
    padding-top: 4px;
    width: 50%;
`
const ContentWithReelaysThumbnailView = styled(View)`
    display: flex;
    flex-wrap: wrap;
    height: ${props => getThumbnailWidth(props) * 1.5}px;
    padding-right: 8px;
`
const TitleLine = styled(View)`
    display: flex;
    flex-direction: row;
    margin-top: 16px;
    margin-right: 16px;
    margin-bottom: 8px;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 18px;
`
const TopicCardGradient = styled(LinearGradient)`
    border-radius: 11px;
    height: 100%;
    width: 100%;
    position: absolute;
`
const TopicCardPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: black;
    border-radius: 11px;
    height: ${props => props.horizontal ? '480px' : 'auto'};
    justify-content: space-between;
    width: ${props => getTopicCardWidth(props)}px;
`
const TopicCardView = styled(View)`
    align-items: center;
    background-color: black;
    border-radius: 11px;
    height: ${props => props.horizontal ? '480px' : 'auto'};
    justify-content: space-between;
    width: ${props => getTopicCardWidth(props)}px;
`
const TopicOverlineView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 8px;
    margin-bottom: 8px;
    padding-left: 4px;
    width: ${props => getTopicCardWidth(props)}px;
`
const TopicOverlineLeftPressable = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    display: flex;
    flex: 1;
`
const TopicOverlineInfoView = styled(View)`
    margin-left: 8px;
`

export default TopicCard = ({ 
    advanceToFeed, 
    clubID, 
    horizontal = false,
    navigation, 
    source = 'discover',
    topic,
}) => {
    const advanceToCreateReelay = () => navigation.push('SelectTitleScreen', { clubID, topic });
    const canPress = (topic.reelays.length > 0);
    const creator = {
        sub: topic.creatorSub,
        username: topic.creatorName,
    };
    const topicHasReelays = (topic.reelays.length > 0);

    const CardBottomRowNoReelays = () => {
        return (
            <BottomRowContainerNoReelays horizontal={horizontal}>
                <StartConvoButton horizontal={horizontal} onPress={advanceToCreateReelay}>
                    <StartConvoText>{'Start the conversation'}</StartConvoText>
                </StartConvoButton>
            </BottomRowContainerNoReelays>
        );
    }  
    
    const CardBottomRowWithReelays = () => {
        const MAX_DISPLAY_CREATORS = 5;
        const myFollowing = useSelector(state => state.myFollowing);
        const inMyFollowing = (creator) => !!myFollowing.find((followingObj) => followingObj?.creatorSub === creator?.sub);
    
        const getDisplayCreators = () => {
            // list up to five profile pics, first preference towards people you follow
            const uniqueCreatorEntries = topic.reelays.reduce((creatorEntries, nextReelay) => {
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
            <BottomRowContainer horizontal={horizontal}>
                <CreatorProfilePicRow 
                    displayCreators={getDisplayCreators()} 
                    reelayCount={topic.reelays.length} 
                />
                <PlayReelaysButton onPress={advanceToFeed}>
                    <Icon type='ionicon' name='play-circle' color='white' size={30} />
                </PlayReelaysButton>
            </BottomRowContainer>
        );
    }

    const ContentAboveDivider = () => {
        const textWidth = getContentRowWidth({ horizontal }) - 40;

        const AddReelayToTopicButton = () => {
            return (
                <AddReelayToTopicPressable onPress={advanceToCreateReelay}>
                    <FontAwesomeIcon icon={faPlus} size={20} color='white' />
                </AddReelayToTopicPressable>
            );
        }

        const ContentNoReelays = () => {
            return (
                <Fragment>
                    <ContentNoReelaysSectionView horizontal={horizontal}>
                        <TopicTitle />
                        <TopicDescription />
                    </ContentNoReelaysSectionView>
                    <ContentNoReelaysIconView>
                        <FontAwesomeIcon icon={faComments} size={140} color='white' />
                    </ContentNoReelaysIconView>
                </Fragment>
            )
        };

        const ContentWithReelays = () => {

            const MediaSection = () => {
                const thumbnailWidth = getThumbnailWidth({ horizontal });
                const thumbnailHeight = thumbnailWidth * 1.5;   
                
                const reelaysWithDistinctTitles = topic.reelays.filter((reelay, index) => {
                    const matchTitle = (nextReelay) => (nextReelay.title.id === reelay.title.id);
                    return topic.reelays.findIndex(matchTitle) === index;
                });

                const displayTitles = reelaysWithDistinctTitles.filter((reelay, index) => index < 4);
                const hasOneTitle = (displayTitles.length === 1);
                const hasTwoTitles = (displayTitles.length === 2);

                return (
                    <ContentWithReelaysSectionView horizontal={horizontal}>
                        <ContentWithReelaysThumbnailView>
                            <ReelayThumbnail
                                height={thumbnailHeight}
                                margin={0}
                                reelay={topic.reelays[0]}
                                width={thumbnailWidth}
                            />
                        </ContentWithReelaysThumbnailView>
                        <ContentWithReelaysPosterGridView 
                            hasTwoTitles={hasTwoTitles} 
                            horizontal={horizontal}
                        >
                            { displayTitles.map(reelay => {
                                return (
                                    <TopicTitlePoster 
                                        key={reelay.sub} 
                                        doubleSize={hasOneTitle} 
                                        reelay={reelay} 
                                    />
                                );
                            })}
                        </ContentWithReelaysPosterGridView>
                    </ContentWithReelaysSectionView>
                );
            }

            const TopicTitlePoster = ({ reelay, doubleSize }) => {
                let posterWidth = getPosterWidth({ horizontal });
                if (doubleSize) posterWidth *= 2;
                if (!reelay?.title) {
                    console.log('reelay no title: ', reelay);
                    return <View />
                }

                return (
                    <TitlePosterView>
                        <TitlePoster title={reelay?.title} width={posterWidth} />
                    </TitlePosterView>
                )
            }

            const TitleSection = () => {
                return (
                    <ContentWithReelaysSectionView horizontal={horizontal}>
                        <View style={{ flex: 1 }}>
                            <TopicTitle />
                            <TopicDescription />
                        </View>
                        <AddReelayToTopicButton />
                    </ContentWithReelaysSectionView>
                );
            }

            return (
                <Fragment>
                    <TitleSection />
                    <MediaSection />
                </Fragment>
            );
        }

        const TopicDescription = () => {
            if (topic.description.length > 0) {
                return (
                    <DescriptionLine>
                        <DescriptionText numberOfLines={3}>{topic.description}</DescriptionText>
                    </DescriptionLine>
                );
            } else {
                return <View />;
            }
        }

        const TopicTitle = () => {
            return (
                <TitleLine>
                    <TitleText numberOfLines={2}>{topic.title}</TitleText>
                </TitleLine>
            );
        }

        if (topicHasReelays) {
            return <ContentWithReelays />;
        } else {
            return <ContentNoReelays />;
        }
    }

    const ContentBelowDivider = () => {
        return (
            <View>
                <DividerLine />
                { (!topicHasReelays) && <CardBottomRowNoReelays /> }
                { (topicHasReelays) && <CardBottomRowWithReelays /> }
            </View>
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

    const TopicCardContainer = ({ canPress, children, onPress }) => {
        if (canPress) {
            return (
                <TopicCardPressable activeOpacity={0.5} horizontal={horizontal} onPress={onPress}>
                    {children}
                </TopicCardPressable>
            );
        } else {
            return (
                <TopicCardView horizontal={horizontal}>
                    {children}
                </TopicCardView>
            );
        }
    }

    const TopicIcon = () => {
        return (
            <TopicIconView>
                <FontAwesomeIcon icon={faComments} size={140} color='white' />
            </TopicIconView>
        );
    }

    const TopicOverline = () => {
        const advanceToCreatorProfileScreen = () => navigation.push('UserProfileScreen', { creator });

        const DotMenuButton = () => {
            const [topicDotMenuVisible, setTopicDotMenuVisible] = useState(false);
            const openDrawer = () => setTopicDotMenuVisible(true);
            return (
                <DotMenuButtonContainer onPress={openDrawer}>
                    <Icon type='ionicon' name='ellipsis-horizontal' size={20} color='white' />
                    { topicDotMenuVisible && (
                        <TopicDotMenuDrawer 
                            navigation={navigation}
                            topic={topic}
                            drawerVisible={topicDotMenuVisible}
                            setDrawerVisible={setTopicDotMenuVisible}
                        />
                    )}
                </DotMenuButtonContainer>
            );
        }    

        return (
            <TopicOverlineView horizontal={horizontal}>
                <TopicOverlineLeftPressable onPress={advanceToCreatorProfileScreen}>
                    <ProfilePicture user={creator} size={32} />
                    <TopicOverlineInfoView>
                        <CreatorName>{creator.username}</CreatorName>
                        <SharedTopicText>{'SHARED A TOPIC'}</SharedTopicText>
                    </TopicOverlineInfoView>
                </TopicOverlineLeftPressable>
                <DotMenuButton />
            </TopicOverlineView>
        );
    }

    return (
        <Fragment>
            { source !== 'profile' && <TopicOverline /> }
            <TopicCardContainer canPress={canPress} onPress={advanceToFeed}>
                <TopicCardGradient colors={['#3D2F52', ReelayColors.reelayPurple]} start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: -0.5 }} />
                <ContentAboveDivider />
                <ContentBelowDivider />
            </TopicCardContainer>
        </Fragment>
    );
}
