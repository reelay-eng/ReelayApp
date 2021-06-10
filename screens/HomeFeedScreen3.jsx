import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Video, AVPlaybackStatus } from "expo-av";
import { Storage, Auth, API, DataStore, graphqlOperation } from 'aws-amplify';
import * as queries from '../src/graphql/queries';
import * as mutations from '../src/graphql/mutations';
import * as subscriptions from '../src/graphql/subscriptions';

import EditScreenInfo from '../components/EditScreenInfo';
import ReelayCard from '../components/discover/ReelayCard';
import { Text, View } from '../components/Themed';

// https://scotch.io/tutorials/implementing-an-infinite-scroll-list-in-react-native

import {
  Button,
  // StyleSheet,
  Dimensions,
  // View,
  // Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { FlatList } from 'react-native-gesture-handler';

export default function HomeFeedScreen3({ navigation }) {
  const [reelayList, setReelayList] = useState([]);
  const [videoSource, setVideoSource] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    // fetch reelays on page load or update
    (async () => {
      await fetchReelays();
    })();

    // fetch reelays every time the user navigates back to this tab
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("on home screen");
      if (reelayList.length == 0) {
        fetchReelays();
      }
    });
  }, [navigation]);

  let fetchedReelayList = [];
  const fetchReelays = async () => {

    // get a list of reelays from the datastore
    const queryResponse = await API.graphql(queries.reelayList);
    if (!queryResponse) {
      setReelayList([]);
      return;
    }

    // for each reelay fetched
    await queryResponse.data.listReelays.items.map(async (reelayObject) => {

      // get the video URL from S3
      const signedVideoURL = await Storage.get(reelayObject.videoS3Key, {
        contentType: "video/mp4"
      });

      // create the reelay object
      fetchedReelayList.push({
        id: reelayObject.id,
        creatorUsername: String(reelayObject.owner),
        creatorAvatar: '../assets/images/icon.png',
        movieTitle: String(reelayObject.movieID),
        videoURL: signedVideoURL,
        postedDateTime: Date(reelayObject.createdAt),
      });
    });

    await setReelayList(fetchedReelayList);
    console.log("Reelays found: " + fetchedReelayList.length);
    console.log("Reelays in feed: " + reelayList.length);
  }

  const renderReelayFeed = () => (
    <View style={styles.container}>
      <FlatList 
        data={reelayList}
        renderItem={renderReelay}
        keyExtractor={reelay => reelay.id}
      />
    </View>
  );

  const renderReelay = ({
    item,
    index,
    separators
  }) => (
    <View style={styles.container}>
      <ReelayCard style={styles.reelayCard}
        username={item.creatorUsername} 
        movieTitle={item.movieTitle} 
        videoURL={item.videoURL} 
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderReelayFeed()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 4,
  },
  card: {
    margin: 4,
  },
});
