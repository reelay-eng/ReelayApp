import React from "react";
import { ScrollView, View, Button } from "react-native";
import FollowItem from "./FollowItem";

const FollowResults = ({ navigation, searchResults, type }) => {
return (
    <View>
    {searchResults.length >= 1 && (
        <ScrollView>
        {searchResults.map((result, index) => {
            return (
            <View
                key={index}
                style={{
                height: 100,
                borderBottomColor: "#505050",
                borderBottomWidth: 0.3,
                }}
            >
                {console.log(result)}
                <FollowItem
                result={result}
                navigation={navigation}
                type={type}
                />
            </View>
            );
        })}
        </ScrollView>
    )}
    </View>
);
};

export default FollowResults;
