import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import FollowItem from "./FollowItem";

import styled from 'styled-components/native';

const FollowItemContainer = styled(View)`
    height: 100px;
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;
`

const FollowResults = ({ 
    followType, 
    navigation, 
    onRefresh,
    refreshing, 
    searchResults, 
    setDrawerFollowObj,
    setDrawerOpen,
}) => {
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    return (
        <View>
            { searchResults.length >= 1 && (
                <ScrollView 
                    contentContainerStyle={{ paddingBottom: 300 }}
                    refreshControl={refreshControl}
                >
                    { searchResults.map((followObj, index) => {
                        return (
                            <FollowItemContainer key={index}>
                                <FollowItem
                                    followObj={followObj}
                                    followType={followType}
                                    navigation={navigation}
                                    setDrawerFollowObj={setDrawerFollowObj}
                                    setDrawerOpen={setDrawerOpen}
                                />
                            </FollowItemContainer>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
};

export default FollowResults;
