import React from "react";
import { ScrollView, View } from "react-native";
import UserSearchResultItem from "./UserSearchResultItem";

const UserSearchResults = ({ navigation, searchResults }) => {
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
                <UserSearchResultItem result={result} navigation={navigation} />
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default UserSearchResults;
