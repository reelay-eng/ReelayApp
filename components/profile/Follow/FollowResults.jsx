import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import FollowItem from "./FollowItem";
import styled from 'styled-components/native';

const ROW_HEIGHT = 100;
const FollowItemContainer = styled(View)`
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;
`;
const FollowScrollContainer = styled(ScrollView)`
    margin-bottom: ${ROW_HEIGHT + 185}px;
`;

const FollowResults = ({ 
    followType, 
    navigation, 
    onRefresh,
    refreshing, 
    searchResults
}) => {
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
