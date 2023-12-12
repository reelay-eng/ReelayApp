import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, View } from "react-native";
import { useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import FixedReelayFeed from "../../components/feed/FixedReelayFeed";
import styled from "styled-components/native";

import { getReelay, prepareReelay } from "../../api/ReelayDBApi";

const LoadingContainer = styled(View)`
  align-items: center;
  justify-content: center;
  background-color: black;
  height: 100%;
  width: 100%;
`;

const TitleFeedContainer = styled(View)`
  height: 100%;
  width: 100%;
  background-color: black;
`;

export default SingleReelayScreen = ({ navigation, route }) => {
  const { preparedReelay, reelaySub } = route.params;

  const dispatch = useDispatch();
  const [singleReelay, setSingleReelay] = useState(preparedReelay);

  // const loadSingleReelay = useCallback(async () => {
  //   if (!singleReelay) {
  //     const fetchedReelay = await getReelay(reelaySub ?? preparedReelay?.sub);
  //     const preparedReelay = await prepareReelay(fetchedReelay);
  //     // const [fetchedReelay, preparedFetchedReelay] = await Promise.all([
  //     //   getReelay(reelaySub ?? preparedReelay?.sub),
  //     //   prepareReelay(preparedReelay),
  //     // ]);
  //     setSingleReelay(preparedReelay);
  //     // setSingleReelay(preparedFetchedReelay || fetchedReelay);
  //   }
  // }, [reelaySub, singleReelay, preparedReelay]);
  const loadSingleReelay = useCallback(() => {
    if (!singleReelay) {
      getReelay(reelaySub ?? preparedReelay?.sub)
        .then((fetchedReelay) => prepareReelay(fetchedReelay))
        .then((preparedReelay) => setSingleReelay(preparedReelay));
    }
  }, [reelaySub, singleReelay, preparedReelay]);

  useEffect(() => {
    loadSingleReelay();
  }, [loadSingleReelay]);

  useFocusEffect(
    useCallback(() => {
      dispatch({ type: "setTabBarVisible", payload: true });
    }, [dispatch])
  );

  if (!singleReelay) {
    return (
      <LoadingContainer>
        <ActivityIndicator accessibilityLabel="Loading content" />
      </LoadingContainer>
    );
  }

  return (
    <TitleFeedContainer>
      <FixedReelayFeed
        headerDisplayText={preparedReelay?.creator?.username}
        fixedStackList={[[singleReelay]]}
        feedSource="single"
        initialStackPos={0}
        navigation={navigation}
      />
    </TitleFeedContainer>
  );
};
