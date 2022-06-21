import React from "react";
import { SafeAreaView, ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

import { HeaderWithBackButton } from "../../components/global/Headers";
import { TopicBanner } from "../../components/home/NewInMyClubs";
import TitleBanner from "../../components/feed/TitleBanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BannerContainer = styled(View)`
    align-items: center;
    margin-top: 6px;
    margin-bottom: 6px;
`
const ScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const ScrollContainer = styled(ScrollView)`
    display: flex;
    flex: 1;
    margin-bottom: ${props => props.bottomOffset}px;
`

export default NewInMyClubsScreen = ({ navigation, route }) => {
    const bottomOffset = useSafeAreaInsets().bottom + 20;
    const { mostRecentActivity } = route?.params;

    const advanceToClubActivityScreen = (clubID) => {
        const club = myClubs.find(nextClub => nextClub?.id === clubID);
        if (!club) {
            showErrorToast('Ruh roh! Couldn`t load that page. Try again?');
            return;
        }
        navigation.navigate('ClubActivityScreen', { club });
    }

    const renderActivity = (activity) => {
        const { id, clubID, activityType, reelays, title } = activity;
        const onPress = () => advanceToClubActivityScreen(clubID);
        if (activityType === 'title') {
            return (
                <BannerContainer key={id}>
                    <TitleBanner
                        backgroundColor={'#191919'}
                        clubActivity={activity}
                        navigation={navigation}
                        onPress={onPress}
                        posterWidth={60}
                        stack={reelays}
                        titleObj={title}
                    />
                </BannerContainer>
            )
        } else if (activityType === 'topic') {
            return <TopicBanner key={id} onPress={onPress} topic={activity} />;
        } else {
            return <View key={id} />;
        }
    }

    return (
        <ScreenContainer>
            <HeaderWithBackButton text="New in my clubs" navigation={navigation} />
            <ScrollContainer bottomOffset={bottomOffset}>
                { mostRecentActivity.map(renderActivity) }
            </ScrollContainer>
        </ScreenContainer>
    );
}