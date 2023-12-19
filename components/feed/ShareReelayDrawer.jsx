import React, { Fragment, useContext, useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  Share,
  TouchableOpacity,
  View,
} from "react-native";

import Constants from "expo-constants";
import * as Clipboard from "expo-clipboard";
import * as ReelayText from "../global/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// import Share from 'react-native-share';
import styled from "styled-components/native";
import { createDeeplinkPathToReelay } from "../../api/ReelayDBApi";
import { AuthContext } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLink, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { ShareOutSVG } from "../global/SVGs";
import { showMessageToast } from "../utils/toasts";
import { logAmplitudeEventProd } from "../utils/EventLogger";

const { height, width } = Dimensions.get("window");

const BUTTON_MARGIN_WIDTH = 10;
const BUTTON_WIDTH = (width - BUTTON_MARGIN_WIDTH * 5) / 3;
const REELAY_WEB_BASE_URL = Constants.manifest.extra.reelayWebBaseUrl;

const Backdrop = styled(Pressable)`
  background-color: transparent;
  bottom: 0px;
  height: 100%;
  position: absolute;
  width: 100%;
`;
const CloseDrawerButton = styled(TouchableOpacity)`
  padding: 10px;
`;
const DrawerView = styled(View)`
  background-color: #1a1a1a;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  height: auto;
  margin-top: auto;
  max-height: 70%;
  padding-top: 8px;
  padding-bottom: ${(props) => props.bottomOffset + 12}px;
  width: 100%;
`;
const DrawerHeaderView = styled(View)`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 16px;
`;
const HeaderText = styled(ReelayText.H6)`
  color: white;
  font-size: 18px;
`;
const LeftSpacer = styled(View)`
  width: 40px;
`;
const ShareOptionPressable = styled(TouchableOpacity)`
  align-items: center;
  background-color: #222529;
  border-radius: 12px;
  height: ${BUTTON_WIDTH}px;
  justify-content: center;
  margin: ${BUTTON_MARGIN_WIDTH / 2}px;
  width: ${BUTTON_WIDTH}px;
`;
const ShareOptionText = styled(ReelayText.CaptionEmphasized)`
  color: white;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 12px;
`;
const ShareOptionTextView = styled(View)`
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  position: absolute;
  width: 100%;
`;
const ShareOptionView = styled(View)`
  align-items: center;
`;
const ShareOptionsRowView = styled(View)`
  align-items: center;
  flex-direction: row;
  justify-content: center;
  padding-left: ${BUTTON_MARGIN_WIDTH}px;
  padding-right: ${BUTTON_MARGIN_WIDTH}px;
`;
const ShareOptionIconPad = styled(View)`
  height: 25px;
`;

export default ShareReelayDrawer = ({ closeDrawer, navigation, reelay }) => {
  const bottomOffset = useSafeAreaInsets().bottom;
  const [deeplinkObj, setDeeplinkObj] = useState(null);
  const { reelayDBUser } = useContext(AuthContext);

  const url = deeplinkObj ? REELAY_WEB_BASE_URL + deeplinkObj?.publicPath : "";

  const createOrLoadDeeplinkObj = async () => {
    const deeplinkObj = await createDeeplinkPathToReelay(
      reelayDBUser?.sub,
      reelayDBUser?.username,
      reelay?.sub
    );
    setDeeplinkObj(deeplinkObj);
  };

  useEffect(() => {
    createOrLoadDeeplinkObj();
  }, []);

  const DrawerHeader = () => {
    return (
      <DrawerHeaderView>
        <LeftSpacer />
        <HeaderText>{"Share reelay"}</HeaderText>
        <CloseDrawerButton onPress={closeDrawer}>
          <FontAwesomeIcon icon={faXmark} size={20} color="white" />
        </CloseDrawerButton>
      </DrawerHeaderView>
    );
  };

  const CopyLinkButton = () => {
    const copyLink = () => {
      Clipboard.setStringAsync(url).then((onfulfilled) => {
        showMessageToast("Shareable link copied to clipboard");
      });
    };

    return (
      <ShareOptionView>
        <ShareOptionPressable onPress={copyLink}>
          <FontAwesomeIcon icon={faLink} color="white" size={30} />
          <ShareOptionIconPad />
          <ShareOptionTextView>
            <ShareOptionText>{"Copy link"}</ShareOptionText>
          </ShareOptionTextView>
        </ShareOptionPressable>
      </ShareOptionView>
    );
  };

  const ShareOutButton = () => {
    const shareReelay = async () => {
      const title = `${reelay?.creator?.username} on ${reelay?.title?.display}`;
      const content = { title, url };
      const options = {};
      console.log("shareReelay", content, options);
      const sharedAction = await Share.share(content, options);
      logAmplitudeEventProd("openedShareDrawer", {
        username: reelayDBUser?.username,
        title: reelay.title.display,
        source: "shareOutButton",
      });
    };

    return (
      <ShareOptionView>
        <ShareOptionPressable onPress={shareReelay}>
          <ShareOutSVG />
          <ShareOptionIconPad />
          <ShareOptionTextView>
            <ShareOptionText>{"Share"}</ShareOptionText>
          </ShareOptionTextView>
        </ShareOptionPressable>
      </ShareOptionView>
    );
  };

  const ShareToInstaStoryButton = () => {
    const openShareInstaStoryScreen = () => {
      closeDrawer();
      navigation.push("InstaStoryReelayScreen", { reelay, url });
    };

    return (
      <ShareOptionView>
        <ShareOptionPressable onPress={openShareInstaStoryScreen}>
          <FontAwesomeIcon icon={faInstagram} color="white" size={30} />
          <ShareOptionIconPad />
          <ShareOptionTextView>
            <ShareOptionText>{"Insta story"}</ShareOptionText>
          </ShareOptionTextView>
        </ShareOptionPressable>
      </ShareOptionView>
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true}>
      <Backdrop onPress={closeDrawer} />
      <DrawerView bottomOffset={bottomOffset}>
        <DrawerHeader />
        <ShareOptionsRowView>
          {deeplinkObj && (
            <Fragment>
              <CopyLinkButton />
              <ShareOutButton />
              <ShareToInstaStoryButton />
            </Fragment>
          )}
        </ShareOptionsRowView>
      </DrawerView>
    </Modal>
  );
};
