// ------------- FeedVideoPlayer ------------
import React, {
  createContext,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Pressable,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { AuthContext } from "../../context/AuthContext";
import { Video } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";

import { logAmplitudeEventProd } from "../utils/EventLogger";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components/native";
import ShareReelayDrawer from "./ShareReelayDrawer";

const { height, width } = Dimensions.get("window");
const ADD_TO_WATCHLIST_ICON_TIMEOUT_MS = 1200;
const DOUBLE_TAP_TIMEOUT_MS = 250;
const PLAY_PAUSE_ICON_SIZE = 48;
const PLAY_PAUSE_ICON_TIMEOUT_MS = 800;

const IconPressable = styled(Pressable)`
  position: absolute;
  left: ${(width - PLAY_PAUSE_ICON_SIZE) / 2}px;
  opacity: 50;
  top: ${(height - PLAY_PAUSE_ICON_SIZE) / 2}px;
  height: ${PLAY_PAUSE_ICON_SIZE}px;
  width: ${PLAY_PAUSE_ICON_SIZE}px;
  zindex: 3;
`;
const LoadingBackdrop = styled(View)`
  align-items: center;
  height: ${height}px;
  justify-content: center;
  position: absolute;
  width: ${width}px;
`;
const TappableOverlay = styled(Pressable)`
  align-items: center;
`;

// const PlayPauseIcon = ({ onPress, type = 'play' }) => {
//     return (
//         <IconPressable onPress={onPress}>
//             <Icon type='ionicon' name={type} color={'white'} size={PLAY_PAUSE_ICON_SIZE} />
//         </IconPressable>
//     );
// }
const PlayPauseIcon = memo(({ onPress, type = "play" }) => {
  return (
    <IconPressable onPress={onPress}>
      <Icon
        type="ionicon"
        name={type}
        color={"white"}
        size={PLAY_PAUSE_ICON_SIZE}
      />
    </IconPressable>
  );
});

export default FeedVideoPlayer = ({
  gameID = null,
  navigation,
  reelay,
  viewable,
}) => {
  const canOpenTrailer = !gameID && reelay?.titleKey !== "film-0";

  const dispatch = useDispatch();
  const { reelayDBUser } = useContext(AuthContext);

  const [finishedLoading, setFinishedLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playPauseVisible, setPlayPauseVisible] = useState(false);
  const [showShareOutDrawer, setShowShareOutDrawer] = useState(false);
  const statsVisible = useSelector((state) => state.statsVisible);

  const closeShareOutDrawer = () => setShowShareOutDrawer(false);

  const shouldPlay =
    viewable && focused && finishedLoading && !paused && !statsVisible;
  const tapCounter = useRef(0);

  useEffect(() => {
    if (!viewable && paused) {
      setPaused(false);
      setPlayPauseVisible("none");
    }
  }, [viewable, paused, focused]);

  useFocusEffect(
    React.useCallback(() => {
      if (viewable) setFocused(true);
      return () => {
        if (viewable) setFocused(false);
      };
    })
  );

  // const onPlaybackStatusUpdate = (playbackStatus) => {
  // 	if (!finishedLoading && !playbackStatus?.isBuffering) {
  // 		setFinishedLoading(true);
  // 		if (viewable) {
  // 			console.log(`finished loading: ${reelay.creator.username} ${reelay.title.display}`)
  // 		}
  // 	}
  // 	if (playbackStatus?.didJustFinish && viewable) {
  // 		logAmplitudeEventProd('watchedFullReelay', {
  // 			reelayID: reelay.id,
  // 			reelayCreator: reelay.creator.username,
  // 			title: reelay.title.display,
  // 			username: reelayDBUser?.username,
  // 		})
  // 	}
  // }
  const onPlaybackStatusUpdate = useCallback(
    (playbackStatus) => {
      if (!finishedLoading && !playbackStatus?.isBuffering) {
        setFinishedLoading(true);
        if (viewable) {
          console.log(
            `finished loading: ${reelay.creator.username} ${reelay.title.display}`
          );
        }
      }
      if (playbackStatus?.didJustFinish && viewable) {
        logAmplitudeEventProd("watchedFullReelay", {
          reelayID: reelay.id,
          reelayCreator: reelay.creator.username,
          title: reelay.title.display,
          username: reelayDBUser?.username,
        });
      }
    },
    [finishedLoading, viewable, reelay, reelayDBUser]
  );

  const onPlayPause = async () => {
    if (paused) {
      setPaused(false);
      setPlayPauseVisible("pause");
      setTimeout(() => {
        setPlayPauseVisible("none");
      }, PLAY_PAUSE_ICON_TIMEOUT_MS);

      logAmplitudeEventProd("playVideo", {
        creatorName: reelay.creator.username,
        reelayID: reelay.id,
        reelayTitle: reelay.title.display,
        username: reelayDBUser?.username,
      });
    } else {
      setPaused(true);
      setPlayPauseVisible("play");
      setTimeout(() => {
        if (playPauseVisible === "play") {
          setPlayPauseVisible("none");
        }
      }, PLAY_PAUSE_ICON_TIMEOUT_MS);

      logAmplitudeEventProd("pauseVideo", {
        creatorName: reelay.creator.username,
        reelayID: reelay.id,
        reelayTitle: reelay.title.display,
        username: reelayDBUser?.username,
      });
    }
  };

  const onTap = () => {
    if (tapCounter.current === 0) {
      tapCounter.current = 1;
      setTimeout(() => {
        if (tapCounter.current === 1) {
          tapCounter.current = 0;
          onPlayPause();
        }
      }, DOUBLE_TAP_TIMEOUT_MS);
    } else {
      if (canOpenTrailer) {
        dispatch({ type: "setReelayWithVisibleTrailer", payload: reelay });
      }
      tapCounter.current = 0;
    }
    Keyboard.dismiss();
  };

  const onLongPress = () => {
    setShowShareOutDrawer(true);
  };

  return (
    <TappableOverlay onPress={onTap} onLongPress={onLongPress}>
      <LoadingBackdrop>
        <ActivityIndicator />
      </LoadingBackdrop>
      <Video
        isLooping={true}
        isMuted={false}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        progressUpdateIntervalMillis={50}
        rate={1.0}
        resizeMode="cover"
        shouldPlay={shouldPlay}
        source={{ uri: reelay?.content?.videoURI }}
        style={{ height, width }}
        useNativeControls={false}
        volume={1.0}
      />
      {playPauseVisible !== "none" && (
        <PlayPauseIcon onPress={onTap} type={playPauseVisible} />
      )}
      {showShareOutDrawer && (
        <ShareReelayDrawer
          closeDrawer={closeShareOutDrawer}
          navigation={navigation}
          reelay={reelay}
        />
      )}
    </TappableOverlay>
  );
};
