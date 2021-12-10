import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import FollowItem from "./FollowItem";

import styled from 'styled-components/native';

const FollowItemContainer = styled(View)`
    height: 100px;
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;
`

const FollowResults = ({ navigation, searchResults, followType, refreshing, onRefresh }) => {
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    return (
        <View>
            { searchResults.length >= 1 && (
                <ScrollView refreshControl={refreshControl}>
                    { searchResults.map((result, index) => {
                        return (
                            <FollowItemContainer key={index}>
                                <FollowItem
                                    followObj={result}
                                    navigation={navigation}
                                    followType={followType}
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
