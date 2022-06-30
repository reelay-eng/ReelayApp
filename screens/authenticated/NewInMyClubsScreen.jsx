import React from "react";
import { SafeAreaView, ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

import { HeaderWithBackButton } from "../../components/global/Headers";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { ClubActivityCard } from "../../components/home/InMyClubs";

const ColumnsContainer = styled(View)`
    flex-direction: row;
    width: 100%;
`
const ColumnContainer = styled(View)`
    display: flex;
    flex: 1;
    width: 50%;
`
const ScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const ScrollContainer = styled(ScrollView)`
    margin-bottom: ${props => props.bottomOffset}px;
`

export default NewInMyClubsScreen = ({ navigation }) => {
    const bottomOffset = useSafeAreaInsets().bottom + 20;
    const myClubActivities = useSelector(state => state.myClubActivities);
    const filterMemberActivities = (nextActivity) => (nextActivity?.activityType !== 'member');
    const displayActivities = myClubActivities.filter(filterMemberActivities);

    const columnA = displayActivities.filter((activity, index) => index % 2 === 0);
    const columnB = displayActivities.filter((activity, index) => index % 2 === 1);

    const renderActivity = (activity) => {
        return <ClubActivityCard activity={activity} navigation={navigation} />
    }

    return (
        <ScreenContainer>
            <HeaderWithBackButton navigation={navigation} text={'New in my clubs'} />
            <ScrollContainer 
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
            </ScrollContainer>
        </ScreenContainer>
    )
}