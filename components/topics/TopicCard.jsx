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
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import ReelayThumbnail from '../global/ReelayThumbnail';
import TitlePoster from '../global/TitlePoster';
import { TopicsGiantIconSVG } from '../global/SVGs';

const { height, width } = Dimensions.get('window');
const CARD_WIDTH_CAROUSEL = width - 48;
const CARD_WIDTH_LIST = width - 32;

const getTopicCardWidth = (props) => props.horizontal ? CARD_WIDTH_CAROUSEL : CARD_WIDTH_LIST;
const getContentRowWidth = (props) => getTopicCardWidth(props) - 24;
const getThumbnailWidth = (props) => (getTopicCardWidth(props) - 32) / 2;
const getThumbnailHeight = (props) => (getThumbnailWidth(props) * 1.5) + (props?.horizontal ? 10 : 0);
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
const BottomRowContainer = styled(TouchableOpacity)`
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
const ContentNoReelaysSectionView = styled(View)`
    justify-content: flex-start;
    width: ${props => getContentRowWidth(props)}px;
`
const ContentNoReelaysIconView = styled(View)`
    align-items: center;
    height: 160px;
    justify-content: center;
    margin-top: 24px;
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
const ContentWithReelaysPosterGridView = styled(View)`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: 50%;
`
const ContentWithReelaysThumbnailView = styled(View)`
    height: ${props => getThumbnailWidth(props) * 1.5}px;
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.5;
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
const PlayReelaysIconView = styled(View)`
    align-items: center;
    border-radius: 17px;
    flex-direction: row;
    justify-content: center;
`
const SharedTopicText = styled(ReelayText.Overline)`
    color: white;
`
const Spacer = styled(View)`
    width: 10px;
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
const TitleLine = styled(View)`
    display: flex;
    flex-direction: row;
    margin-top: 16px;
    margin-right: 16px;
    margin-bottom: 8px;
`
const TitlePosterView = styled(View)`
    margin-bottom: 4px;
    margin-right: 4px;
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.5;
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
    margin-bottom: 12px;
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
        const inMyFollowing = (creator) => {
            if (!myFollowing) return false;
            return !!myFollowing.find((followingObj) => followingObj?.creatorSub === creator?.sub);
        }
    
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
            <BottomRowContainer horizontal={horizontal} onPress={advanceToFeed}>
                <CreatorProfilePicRow 
                    displayCreators={getDisplayCreators()} 
                    reelayCount={topic.reelays.length} 
                />
                <PlayReelaysIconView>
                    <Icon type='ionicon' name='play-circle' color='white' size={30} />
                </PlayReelaysIconView>
            </BottomRowContainer>
        );
    }

    const ContentAboveDivider = () => {
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
                    <ContentNoReelaysIconView>
                        <TopicsGiantIconSVG />
                    </ContentNoReelaysIconView>
                    <ContentNoReelaysSectionView horizontal={horizontal}>
                        <TopicTitle />
                        <TopicDescription />
                    </ContentNoReelaysSectionView>
                </Fragment>
            )
        };

        const ContentWithReelays = () => {

            const TitleSection = () => {
                return (
                    <ContentWithReelaysSectionView horizontal={horizontal}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity onPress={advanceToFeed}>
                                <TopicTitle />
                                <TopicDescription />
                            </TouchableOpacity>
                        </View>
                        <AddReelayToTopicButton />
                    </ContentWithReelaysSectionView>
                );
            }
            
            const TopicTitlePoster = ({ reelay, doubleSize }) => {
                const matchTitle = (nextReelay) => (nextReelay.title.id === reelay.title.id);
                const topicIndex = topic.reelays.findIndex(matchTitle);
                const onPress = () => advanceToFeed(topicIndex);

                let posterWidth = getPosterWidth({ horizontal });
                if (doubleSize) posterWidth *= 2;
                if (!reelay?.title) {
                    console.log('reelay no title: ', reelay);
                    return <View />
                }

                return (
                    <TitlePosterView>
                        <TitlePoster onPress={onPress} title={reelay?.title} width={posterWidth} />
                    </TitlePosterView>
                )
            }

            const MediaSection = () => {                
                const reelaysWithDistinctTitles = topic.reelays.filter((reelay, index) => {
                    const matchTitle = (nextReelay) => (nextReelay.title.id === reelay.title.id);
                    return topic.reelays.findIndex(matchTitle) === index;
                });

                const displayTitles = reelaysWithDistinctTitles.filter((reelay, index) => index < 4);
                const hasOneTitle = (displayTitles.length === 1);

                let mostPopularReelay = null;
                let mostPopularReelayScore = -1;
                let mostPopularReelayIndex = 0;
                for (const reelayIndex of topic.reelays.keys()) {
                    const reelay = topic.reelays[reelayIndex];
                    const reelayScore = reelay.likes.length + reelay.comments.length;
                    if (reelayScore > mostPopularReelayScore) {
                        mostPopularReelay = reelay;
                        mostPopularReelayScore = reelayScore;
                        mostPopularReelayIndex = reelayIndex;
                    }
                }

                const thumbnailOnPress = () => advanceToFeed(mostPopularReelayIndex);
                const thumbnailWidth = getThumbnailWidth({ horizontal });
                const thumbnailHeight = getThumbnailHeight({ horizontal });

                return (
                    <ContentWithReelaysSectionView horizontal={horizontal}>
                        <ContentWithReelaysThumbnailView>
                            <ReelayThumbnail
                                height={thumbnailHeight}
                                margin={0}
                                onPress={thumbnailOnPress}
                                reelay={mostPopularReelay}
                                showLikes={true}
                                showVenue={false}
                                width={thumbnailWidth}
                            />
                        </ContentWithReelaysThumbnailView>
                        <Spacer />
                        <ContentWithReelaysPosterGridView>
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
            <TopicCardView horizontal={horizontal} onPress={advanceToFeed}>
                <TopicCardGradient colors={['#3D2F52', ReelayColors.reelayPurple]} start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: -0.5 }} />
                <ContentAboveDivider />
                <ContentBelowDivider />
            </TopicCardView>
        </Fragment>
    );
}
