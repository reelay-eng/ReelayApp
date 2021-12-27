import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import FollowItem from "./FollowItem";

import styled from 'styled-components/native';

const FollowResults = ({ 
    followType, 
    navigation, 
    onRefresh,
    refreshing, 
    searchResults, 
    setDrawerFollowObj,
    setDrawerOpen,
}) => {

    const ROW_HEIGHT = 100;
    const FollowItemContainer = styled(View)`
        height: 100px;
        border-bottom-color: #505050;
        border-bottom-width: 0.3px;
    `;
    const FollowScrollContainer = styled(ScrollView)`
        margin-bottom: ${ROW_HEIGHT + 185}px;
    `;

    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;
    

    return (
        <View>
            {searchResults.length >= 1 && (
                <FollowScrollContainer refreshControl={refreshControl}>
                    {searchResults.map((followObj) => {
                        return (
                            <FollowItemContainer key={followObj?.id}>
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
                </FollowScrollContainer>
            )}
        </View>
    );
};

export default FollowResults;
