import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import AddTitleOrTopicDrawer from '../../components/clubs/AddTitleOrTopicDrawer';
import ClubActivityCard from "../../components/clubs/ClubActivityCard";
import { useFocusEffect } from "@react-navigation/native";
import BackButton from "../../components/utils/BackButton";
import * as ReelayText from '../../components/global/Text';
import ClubPicture from "../../components/global/ClubPicture";
import { Icon } from 'react-native-elements';

const MAX_ACTIVITY_INDEX = 25;

const AddTitleOrTopicPressable = styled(Pressable)`
    align-items: center;
    justify-content: center;
    margin: 6px;
    margin-right: 4px;
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

    const columnA = displayActivities.filter((activity, index) => index % 2 === 0);
    const columnB = displayActivities.filter((activity, index) => index % 2 === 1);

    const AddTitleOrTopicButton = () => {
        const [titleOrTopicDrawerVisible, setTitleOrTopicDrawerVisible] = useState(false);
        return (
            <AddTitleOrTopicPressable onPress={() => setTitleOrTopicDrawerVisible(true)}>
                <Icon type='ionicon' name='add-circle' color='white' size={40} />
                { titleOrTopicDrawerVisible && (
                    <AddTitleOrTopicDrawer
                        club={club}
                        navigation={navigation}
                        drawerVisible={titleOrTopicDrawerVisible}
                        setDrawerVisible={setTitleOrTopicDrawerVisible}
                    />
                )}
            </AddTitleOrTopicPressable>
        );
    }

    const renderActivity = (activity) => {
        return <ClubActivityCard key={activity.id} activity={activity} navigation={navigation} />
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
                <AddTitleOrTopicButton />
            </HeaderRow>
            <ScrollView 
                bottomOffset={bottomOffset} 
                contentContainerStyle={{ 
                    alignItems: 'center',
                    width: '100%',
                }}
                showVerticalScrollIndicator={false}
            >
                <ColumnsContainer>
                    <ColumnContainer>
                        { columnA.map(renderActivity) }
                    </ColumnContainer>
                    <ColumnContainer>
                        { columnB.map(renderActivity) }
                    </ColumnContainer>
                </ColumnsContainer>
                <Spacer />
            </ScrollView>
        </ScreenContainer>
    )
}