import React from "react";
import { SafeAreaView, ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

import { HeaderWithBackButton } from "../../components/global/Headers";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { ClubActivityCard } from "../../components/home/InMyClubs";
import { useFocusEffect } from "@react-navigation/native";

const ColumnsContainer = styled(View)`
    flex-direction: row;
    width: 100%;
`
const ColumnContainer = styled(View)`
    display: flex;
    flex: 1;
    width: 50%;
`
const ScreenContainer = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const Spacer = styled(View)`
    height: 30px;
`

export default NewInMyClubsScreen = ({ navigation }) => {
    const bottomOffset = useSafeAreaInsets().bottom + 20;
    const dispatch = useDispatch();
    const myClubActivities = useSelector(state => state.myClubActivities);
    const filterMemberActivities = (nextActivity) => (nextActivity?.activityType !== 'member');
    const displayActivities = myClubActivities.filter(filterMemberActivities);

    const columnA = displayActivities.filter((activity, index) => index % 2 === 0);
    const columnB = displayActivities.filter((activity, index) => index % 2 === 1);

    const renderActivity = (activity) => {
        return <ClubActivityCard key={activity.id} activity={activity} navigation={navigation} />
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    })

    return (
        <ScreenContainer>
            <SafeAreaView>
                <HeaderWithBackButton navigation={navigation} text={'New in my clubs'} />
            </SafeAreaView>
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