import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { Video, AVPlaybackStatus } from "expo-av";
import { Storage, Auth, API, DataStore } from 'aws-amplify';
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

export default function HomeFeedScreen({ navigation }) {
  const [reelayList, setReelayList] = useState([]);
  const [videoSource, setVideoSource] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      console.log('Fetching Reelays for the Home Feed');
      await fetchReelays();
      console.log(reelayList);
      console.log('Finished fetching.');  
    })();
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("on home screen");
      fetchReelays();
    });
  }, [navigation]);

  const fetchReelays = async () => {
    const queryResponse = await API.graphql({ query: queries.listReelays });
    if (!queryResponse) {
      setReelayList([]);
      console.log("No query response");
      return;
    } else {
      console.log("Query response exists.")
    }

    let fetchedReelayList = [];

    // for each reelay fetched
    await queryResponse.data.listReelays.items.map(async (reelayObject) => {
      console.log(reelayObject);

      // get the video URL from S3
      const signedVideoURL = await Storage.get(reelayObject.videoS3Key, {
        contentType: "video/mp4"
      });

      fetchedReelayList.push({
        id: reelayObject.id,
        creatorUsername: String(reelayObject.owner),
        movieTitle: String(reelayObject.movieID),
        videoURL: signedVideoURL,
        postedDateTime: Date(reelayObject.createdAt),
      })
    });
    setReelayList(fetchedReelayList);
    console.log(fetchedReelayList);
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelayCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 300
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
});
