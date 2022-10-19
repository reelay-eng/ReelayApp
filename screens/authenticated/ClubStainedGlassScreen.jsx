import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import AddToClubsDrawer from '../../components/clubs/AddToClubsDrawer';
import ClubActivityCard from "../../components/clubs/ClubActivityCard";
import { useFocusEffect } from "@react-navigation/native";
import BackButton from "../../components/utils/BackButton";
import * as ReelayText from '../../components/global/Text';
import ClubPicture from "../../components/global/ClubPicture";
import { Icon } from 'react-native-elements';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ReelayColors from "../../constants/ReelayColors";

const MAX_ACTIVITY_INDEX = 25;

const AddToClubsPressable = styled(Pressable)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    justify-content: center;
    height: 36px;
    width: 36px;
    margin: 10px;
    margin-right: 4px;
    padding: 6px;
`
const AddToClubsText = styled(ReelayText.Overline)`
    color: white;
`
const ColumnsContainer = styled(View)`
    flex-direction: row;
    width: 100%;
`
const ColumnContainer = styled(View)`
    display: flex;
    flex: 1;
    width: 50%;
`
const HeaderRowLeft = styled(SafeAreaView)`
    align-items: center;
    flex-direction: row;
`
const HeaderRow = styled(HeaderRowLeft)`
    justify-content: space-between;
`
const HeaderText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    margin-left: 8px;
`
const ScreenContainer = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const Spacer = styled(View)`
    height: 30px;
`

export default ClubStainedGlassScreen = ({ navigation, route }) => {
    const club = route?.params?.club ?? null;

    const bottomOffset = useSafeAreaInsets().bottom + 20;
    const dispatch = useDispatch();
    const myClubActivities = useSelector(state => state.myClubActivities);
    const filterMemberActivities = (nextActivity) => (nextActivity?.activityType !== 'member');
    const filterJustThisClub = (nextActivity) => (nextActivity?.clubID === club.id);
    const filterMostRecentActivities = (nextActivity, index) => index < MAX_ACTIVITY_INDEX;

    const displayActivities = myClubActivities
        .filter(filterMemberActivities)
        .filter(filterJustThisClub)
        .filter(filterMostRecentActivities);

    const activitiesColumnA = displayActivities.filter((item, index) => index % 2 === 0);
    const activitiesColumnB = displayActivities.filter((item, index) => index % 2 === 1);

    const itemHeightsColumnA = [];
    const itemHeightsColumnB = [];

    const getItemLayout = (item, index) => {
        const accumulate = (sum, next) => sum + next;
        const isColumnA = (index % 2 === 0);

        const getCachedItemHeight = (isColumnA) => {
            return (isColumnA) ? itemHeightsColumnA[index] : itemHeightsColumnB[index];
        }

        const length = getCachedItemHeight() ?? 0;

        const offset = (isColumnA) 
            ? itemHeightsColumnA.slice(0, index).reduce(accumulate, 0)
            : itemHeightsColumnB.slice(0, index).reduce(accumulate, 0);

        const itemLayout = { length, offset, index };
        return itemLayout;
    }

    const renderActivity = ({ item, index }) => {
        const activity = item;
        const isColumnA = (index % 2 === 0);
        const onLayout = ({ nativeEvent }) => (isColumnA) 
            ? itemHeightsColumnA[index] = nativeEvent?.layout?.height
            : itemHeightsColumnB[index] = nativeEvent?.layout?.height;
        return <ClubActivityCard activity={activity} navigation={navigation} onLayout={onLayout} />
    }


    const ActivityColumn = ({ isColumnA }) => {
        return (
            <ColumnContainer>
                <FlatList
                    bottomOffset={bottomOffset}
                    data={isColumnA ? activitiesColumnA : activitiesColumnB}
                    getItemLayout={getItemLayout}
                    keyExtractor={activity => activity?.id}
                    renderItem={renderActivity}
                    showsVerticalScrollIndicator={false}
                />
            </ColumnContainer>
        );
    }

    const AddToClubsButton = () => {
        const [titleOrTopicDrawerVisible, setTitleOrTopicDrawerVisible] = useState(false);
        return (
            <AddToClubsPressable onPress={() => setTitleOrTopicDrawerVisible(true)}>
                <FontAwesomeIcon icon={faPlus} color='white' size={20} />
                { titleOrTopicDrawerVisible && (
                    <AddToClubsDrawer
                        club={club}
                        navigation={navigation}
                        drawerVisible={titleOrTopicDrawerVisible}
                        setDrawerVisible={setTitleOrTopicDrawerVisible}
                    />
                )}
            </AddToClubsPressable>
        );
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    })

    return (
        <ScreenContainer>
            <HeaderRow>
                <HeaderRowLeft>
                    <BackButton navigation={navigation}/>
                    <ClubPicture club={club} size={30} />
                    <HeaderText>{club?.name}</HeaderText>
                </HeaderRowLeft>
                <AddToClubsButton />
            </HeaderRow>
            <ScrollView 
                bottomOffset={bottomOffset} 
                contentContainerStyle={{ 
                    alignItems: 'center',
                    width: '100%',
                }}
                showsVerticalScrollIndicator={false}
            >
                <ColumnsContainer>
                    <ActivityColumn isColumnA={true} />
                    <ActivityColumn isColumnA={false} />
                </ColumnsContainer>
                <Spacer />
            </ScrollView>
        </ScreenContainer>
    )
}