import React from "react";
import { ScrollView, View } from "react-native";
import FollowReqItem from "./FollowReqItem";

const FollowReqResults = ({ navigation, searchResults }) => {
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
                <FollowReqItem result={result} navigation={navigation} />
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default FollowReqResults;
