import React, { useContext, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import {
  logAmplitudeEventProd,
  firebaseCrashlyticsLog,
  firebaseCrashlyticsError,
} from "../utils/EventLogger";
import * as ReelayText from "../global/Text";

import styled from "styled-components/native";
import { useDispatch, useSelector } from "react-redux";
import {
  addToMyWatchlist,
  removeFromMyWatchlist,
} from "../../api/WatchlistApi";
import { notifyOnAddedToWatchlist } from "../../api/WatchlistNotifications";
import { showMessageToast } from "../utils/toasts";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import ReelayColors from "../../constants/ReelayColors";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import * as RegularIcons from "@fortawesome/free-regular-svg-icons";
import * as SolidIcons from "@fortawesome/free-solid-svg-icons";

const LabelText = styled(ReelayText.H6Emphasized)`
  color: white;
  font-size: 16px;
  margin-right: 10px;
`;
const SeenCheckmarkView = styled(View)`
  align-items: flex-end;
  height: 100%;
  justify-content: flex-end;
  right: 5px;
  bottom: 5px;
  position: absolute;
  width: 100%;
`;
const ShareButtonBackground = styled(LinearGradient)`
  border-radius: 50px;
  height: ${(props) => props.buttonSize}px;
  opacity: 0.9;
  position: absolute;
  right: 6px;
  width: ${(props) => props.buttonSize}px;
`;
const WatchlistButtonCircleView = styled(View)`
  align-items: center;
  border-radius: 50px;
  height: ${(props) => props.buttonSize}px;
  justify-content: center;
  overflow: hidden;
  shadow-offset: 2px 2px;
  shadow-color: black;
  shadow-opacity: 0.3;
  width: ${(props) => props.buttonSize}px;
`;
const WatchlistButtonOuterView = styled(TouchableOpacity)`
  align-items: center;
  justify-content: center;
  flex-direction: row;
  padding-right: 6px;
`;

export default AddToWatchlistButton = ({
  buttonSize = 45,
  iconSize = 22,
  shouldGoToWatchlist = false,
  showLabel = false,
  titleObj,
  reelay,
}) => {
  try {
    firebaseCrashlyticsLog("Add to watch list button");
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const myWatchlistItems = useSelector((state) => state.myWatchlistItems);
    const seenCheckmarkSize = iconSize;
    const [reelAddedToWatchList, setReelAddedToWatchList] = useState(false);
    // const [currentInWatchlist, setCurrentInWatchlist] = useState(inWatchlist);

    const matchWatchlistItem = (nextItem) => {
      const { tmdbTitleID, titleType, hasAcceptedRec } = nextItem;
      const isSeries = titleType === "tv";
      return (
        tmdbTitleID === titleObj.id &&
        isSeries === titleObj.isSeries &&
        hasAcceptedRec === true
      );
    };

    const watchlistItem = useSelector((state) =>
      state.myWatchlistItems.find(matchWatchlistItem)
    );
    const inWatchlist = !!watchlistItem;
    const hasSeenTitle = watchlistItem?.hasSeenTitle;
    const markedSeen = inWatchlist && watchlistItem?.hasSeenTitle;

    const getGradientColors = () => {
      if (hasSeenTitle)
        return [ReelayColors.reelayGreen, ReelayColors.reelayGreen];
      if (inWatchlist || reelAddedToWatchList)
        return [ReelayColors.reelayGreen, "#0789FD"];
      return ["#0789FD", "#0789FD"];
    };

    const gradientColors = getGradientColors();
    const showMeSignupIfGuest = () => {
      if (reelayDBUser?.username === "be_our_guest") {
        dispatch({ type: "setJustShowMeSignupVisible", payload: true });
        return true;
      }
      return false;
    };

    const addToWatchlistOnPress = async () => {
      if (shouldGoToWatchlist) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        showMessageToast(`Added ${titleObj?.display} to your watchlist`);
      }
      setReelAddedToWatchList(true);
      // setCurrentInWatchlist(true);
      try {
        const addToWatchlistResult = await addToMyWatchlist({
          reqUserSub: reelayDBUser?.sub,
          reelaySub: reelay?.sub ?? null,
          creatorName: reelay?.creator?.username ?? null,
          tmdbTitleID: titleObj?.id,
          titleType: titleObj?.titleType,
        });
        dispatch({ type: "setMyWatchlistItems", payload: [] });
        dispatch({ type: "setItemAddRemoveToWatchList", payload: true });
        const nextWatchlistItems = [addToWatchlistResult, ...myWatchlistItems];

        // todo: should also be conditional based on user settings
        if (reelay?.creator) {
          notifyOnAddedToWatchlist({
            reelayedByUserSub: reelay?.creator?.sub,
            addedByUserSub: reelayDBUser?.sub,
            addedByUsername: reelayDBUser?.username,
            watchlistItem: addToWatchlistResult,
          });
        }

        logAmplitudeEventProd("addToMyWatchlist", {
          title: titleObj?.display,
          username: reelayDBUser?.username,
          userSub: reelayDBUser?.sub,
        });

        dispatch({ type: "setMyWatchlistItems", payload: nextWatchlistItems });
      } catch (error) {
        console.error("Error while adding to watchlist:", error);
        // showMessageToast("An error occurred. Please try again.");
      } finally {
        setReelAddedToWatchList(false);
      }
    };

    const removeFromWatchlistOnPress = async () => {
      logAmplitudeEventProd("removeItemFromWatchlist", {
        username: reelayDBUser?.username,
        title: titleObj?.display,
        source: "feed",
      });

      const nextWatchlistItems = myWatchlistItems.filter((nextItem) => {
        const matchTitleID = nextItem?.tmdbTitleID === titleObj?.id;
        const matchTitleType = nextItem?.titleType === titleObj?.titleType;
        return !(matchTitleID && matchTitleType);
      });

      dispatch({ type: "setMyWatchlistItems", payload: nextWatchlistItems });
      dispatch({ type: "setItemAddRemoveToWatchList", payload: true });
      const removeFromWatchlistResult = await removeFromMyWatchlist({
        reqUserSub: reelayDBUser?.sub,
        tmdbTitleID: titleObj?.id,
        titleType: titleObj?.titleType,
      });
      // setCurrentInWatchlist(false);
      console.log("remove from watchlist result: ", removeFromWatchlistResult);
    };

    const onPress = async () => {
      if (showMeSignupIfGuest()) return;
      if (inWatchlist) {
        console.log("******** removeFromWatchlistOnPress clicked ******* ");
        removeFromWatchlistOnPress();
      } else {
        console.log("******** addToWatchlistOnPress clicked ******* ");
        addToWatchlistOnPress();
      }
    };

    const Label = () => {
      if (!showLabel) return <View />;
      const label = inWatchlist ? "In watchlist" : "Add to watchlist";
      return <LabelText>{label}</LabelText>;
    };

    return (
      <WatchlistButtonOuterView onPress={onPress}>
        <Label />
        <ShareButtonBackground
          buttonSize={buttonSize}
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <WatchlistButtonCircleView buttonSize={buttonSize}>
          {reelAddedToWatchList && (
            <FontAwesomeIcon
              icon={SolidIcons.faBookmark}
              size={iconSize}
              color="white"
            />
          )}
          {!reelAddedToWatchList && inWatchlist && (
            <FontAwesomeIcon
              icon={SolidIcons.faBookmark}
              size={iconSize}
              color="white"
            />
          )}
          {!reelAddedToWatchList && !inWatchlist && !hasSeenTitle && (
            <FontAwesomeIcon
              icon={RegularIcons.faBookmark}
              size={iconSize}
              color="white"
            />
          )}
        </WatchlistButtonCircleView>
      </WatchlistButtonOuterView>
    );
  } catch (error) {
    firebaseCrashlyticsError(error);
  }
};
