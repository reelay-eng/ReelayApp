import React from "react";
import { ScrollView, View } from "react-native";
import UserSearchResultItem from "./UserSearchResultItem";

import styled from "styled-components/native";

const FollowItemContainer = styled(View)`
    height: 100px;
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;
`;

const UserSearchResults = ({ navigation, searchResults, setCreatorFollowers, setDrawerFollowObj, setDrawerOpen }) => {
    return (
        <View>
            {searchResults.length >= 1 && (
                <ScrollView>
                    {searchResults.map((result, index) => {
                        return (
                          <FollowItemContainer key={index}>
                            {console.log(result)}
                            <UserSearchResultItem
                              result={result}
                              navigation={navigation}
                              setCreatorFollowers={setCreatorFollowers}
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

export default UserSearchResults;
