import React, { useState } from "react";
import { Dimensions, FlatList, Pressable, View } from 'react-native';
import styled from 'styled-components/native';

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ToggleSelector } from "../../components/global/Buttons";
import TitlePoster from "../../components/global/TitlePoster";
import ClubBanner from "../../components/clubs/ClubBanner";
import moment from "moment";
import TopicCard from "../../components/topics/TopicCard";

const { width } = Dimensions.get('window');

const TITLE_CARD_SIDE_MARGIN = 4;
const TITLE_CARD_WIDTH = (width / 3) - (2 * TITLE_CARD_SIDE_MARGIN);
const TOGGLE_BAR_WIDTH = width - (2 * TITLE_CARD_SIDE_MARGIN);

const MediaListView = styled(View)`
    align-items: flex-start;
    width: 100%;
`
const ScreenView = styled(View)`
    align-items: center;
    background-color: black;
    height: 100%;
    width: 100%;
`
const TitleCardView = styled(Pressable)`
    border-radius: 12px;
    margin: ${TITLE_CARD_SIDE_MARGIN}px;
    width: ${TITLE_CARD_WIDTH}px;
`
const TopicCardView = styled(View)`
    margin-bottom: 10px;
`
const ToggleSelectorView = styled(View)`
    margin-top: ${props => props.topOffset + 80}px;
    margin-bottom: 20px;
    width: ${TOGGLE_BAR_WIDTH}px;
`


export default ClubMediaScreen = ({ navigation, route }) => {
    const club = route?.params?.club;
    const [selectedOption, setSelectedOption] = useState('titles');
    const onSelect = (option) => setSelectedOption(option);
    const topOffset = useSafeAreaInsets().top;

    const removeEmptyTitles = (titleOrTopic) => {
        return (titleOrTopic.activityType === 'topic' || titleOrTopic?.reelays?.length > 0);
    }
    const sortClubTitlesAndTopics = (titleOrTopic0, titleOrTopic1) => {
        const lastActivity0 = moment(titleOrTopic0?.lastUpdatedAt);
        const lastActivity1 = moment(titleOrTopic1?.lastUpdatedAt);
        return lastActivity0.diff(lastActivity1, 'seconds') < 0;
    }

    const feedTitlesAndTopics = [...club.titles, ...club.topics]
        .sort(sortClubTitlesAndTopics)
        .filter(removeEmptyTitles);

    const getClubFeedIndex = (activity) => {
        const matchActivity = (nextActivity) => nextActivity.id === activity.id
        return feedTitlesAndTopics.findIndex(matchActivity);            
    }

    const TitlesList = () => {
        const renderTitlePoster = ({ item, index }) => {
            const clubTitle = item;
            const clubFeedIndex = getClubFeedIndex(clubTitle);

            const advanceToClubFeedScreen = () => {
                navigation.push('ClubFeedScreen', {
                    club,
                    initFeedIndex: clubFeedIndex,
                });
            }

            const advanceToTitlePage = () => {
                navigation.push('TitleDetailScreen', { titleObj: clubTitle?.title });
            }

            const onPress = (clubFeedIndex === -1) 
                ? advanceToTitlePage 
                : advanceToClubFeedScreen;

            return (
                <TitleCardView onPress={onPress}>
                    <TitlePoster title={clubTitle.title} width={TITLE_CARD_WIDTH} />
                </TitleCardView>    
            )
        }

        return (
            <MediaListView>
                <FlatList
                    contentContainerStyle={{ paddingBottom: 300 }}
                    data={club.titles ?? []}
                    estimatedItemSize={TITLE_CARD_WIDTH * 1.5}
                    keyExtractor={(item) => item?.id}
                    numColumns={3}
                    renderItem={renderTitlePoster}
                    showsVerticalScrollIndicator={false}
                />
            </MediaListView>
        );
    }

    const TopicsList = () => {
        const renderTopicCard = ({ item, index }) => {
            const topic = item;
            const clubFeedIndex = getClubFeedIndex(topic);
            const advanceToFeed = (initStackIndex = 0) => {
                navigation.push('ClubFeedScreen', {
                    club,
                    initFeedIndex: clubFeedIndex,
                    initStackIndex,
                })
            }

            return (
                <TopicCardView>
                    <TopicCard 
                        advanceToFeed={advanceToFeed}
                        clubID={club?.id}
                        horizontal={false}
                        navigation={navigation}
                        source={'clubs'}
                        topic={topic}       
                    />
                </TopicCardView>
            );
        }

        return (
            <MediaListView>
                <FlatList
                    contentContainerStyle={{ paddingBottom: 300 }}
                    data={club.topics ?? []}
                    estimatedItemSize={400}
                    keyExtractor={(item) => item?.id}
                    renderItem={renderTopicCard}
                    showsVerticalScrollIndicator={false}
                />
            </MediaListView>
        )
    }

    return (
        <ScreenView topOffset={topOffset}>
            <ClubBanner club={club} navigation={navigation} source={'media'} /> 
            <ToggleSelectorView topOffset={topOffset}>
                <ToggleSelector 
                    displayOptions={['Titles', 'Topics']} 
                    options={['titles', 'topics']} 
                    selectedOption={selectedOption}
                    onSelect={onSelect}
                />
            </ToggleSelectorView>
            { selectedOption === 'titles' && <TitlesList /> }
            { selectedOption === 'topics' && <TopicsList /> }
        </ScreenView>
    )
}