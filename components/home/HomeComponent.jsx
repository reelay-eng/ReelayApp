import React, {
  Fragment,
  memo,
  useContext,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { RefreshControl, SafeAreaView, ScrollView, View } from "react-native";
import styled from "styled-components";

import HomeHeader from "./HomeHeader";
import TopicsCarousel from "../topics/TopicsCarousel";
import OnStreaming from "./OnStreaming";

import {
  getFeed,
  getHomeContent,
  getLatestAnnouncement,
} from "../../api/ReelayDBApi";
import { getAllMyNotifications } from "../../api/NotificationsApi";
import { AuthContext } from "../../context/AuthContext";

import { useDispatch, useSelector } from "react-redux";
import TopOfTheWeek from "./TopOfTheWeek";
import { useFocusEffect } from "@react-navigation/native";
import AppUpdateOverlay from "../overlay/AppUpdateOverlay";
import NoticeOverlay from "../overlay/NoticeOverlay";
import AnnouncementsAndNotices from "./AnnouncementsAndNotices";
import PopularTitles from "./PopularTitles";

import { LinearGradient } from 'expo-linear-gradient';
import DiscoverSearch from './DiscoverSearch';
import RecommendedForYou from './RecommendedForYou';
import GuessingGames from './GuessingGames';
import { getGuessingGamesPublished } from '../../api/GuessingGameApi';
import HomeWatchlistCard from './HomeWatchlistCard';
import SectionDiscover from './SectionDiscover';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../utils/EventLogger';
import GuessingGamesRandom from './GuessingGamesRandom';

const BottomBar = styled(LinearGradient)`
  height: 100px;
  width: 100%;
  position: absolute;
  bottom: 0px;
`;
const HomeContainer = styled(View)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const ScrollContainer = styled(ScrollView)`
  width: 100%;
  height: auto;
`;
const Spacer = styled(View)`
  height: 120px;
`;

const HomeComponent = ({ navigation }) => {
  try {
    firebaseCrashlyticsLog("Home Component Mounted - Navigation");
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector((state) => state.authSession);
    const scrollRef = useRef(null);
    const showWatchlistCard = reelayDBUser?.username !== "be_our_guest";

    const [selectedTab, setSelectedTab] = useState("discover");
    // old code starts
    // const tabOptions = ["discover", "my stuff"];
    // old code ends

    const tabOptions = useMemo(() => ["discover", "my stuff"], []);

    // useFocusEffect(() => {
    //     const unsubscribe = navigation.getParent().addListener('tabPress', e => {
    //         e.preventDefault();
    //         if (scrollRef.current) {
    //             scrollRef.current.scrollTo({ y: 0, animated: false });
    //             onRefresh();
    //         }
    //     });
    //     return () => unsubscribe();
    // })

    const onRefresh = useCallback(async () => {
      try {
        setRefreshing(true);
        const reqUserSub = reelayDBUser?.sub;

        const [latestAnnouncement, myHomeContent, myNotifications] =
          await Promise.all([
            getLatestAnnouncement({ authSession, reqUserSub, page: 0 }),
            getHomeContent({ authSession, reqUserSub }),
            getAllMyNotifications(reelayDBUser?.sub),
          ]);

        //old code starts
        // const myFollowing = myHomeContent?.profile?.myFollowing;
        // const myStreamingSubscriptions =
        //   myHomeContent?.profile?.myStreamingSubscriptions;
        // old code ends

        const myFollowing = useMemo(
          () => myHomeContent?.profile?.myFollowing,
          [myHomeContent]
        );
        const myStreamingSubscriptions = useMemo(
          () => myHomeContent?.profile?.myStreamingSubscriptions,
          [myHomeContent]
        );

        dispatch({
          type: "setLatestAnnouncement",
          payload: latestAnnouncement,
        });
        dispatch({ type: "setMyHomeContent", payload: myHomeContent });
        dispatch({ type: "setMyNotifications", payload: myNotifications });
        dispatch({
          type: "setMyStreamingSubscriptions",
          payload: myStreamingSubscriptions,
        });
        dispatch({ type: "setMyFollowing", payload: myFollowing });
        dispatch({
          type: "setMyStreamingSubscriptions",
          payload: myStreamingSubscriptions,
        });

        setRefreshing(false);

        // deferred load
        const [
          homeFollowingFeed,
          homeGuessingGames,
          homeInTheatersFeed,
          homeOnStreamingFeed,
          homeTopOfTheWeekFeed,
        ] = await Promise.all([
          getFeed({
            authSession,
            feedSource: "following",
            reqUserSub,
            page: 0,
          }),
          getGuessingGamesPublished({ authSession, reqUserSub, page: 0 }),
          getFeed({ authSession, feedSource: "theaters", reqUserSub, page: 0 }),
          getFeed({
            authSession,
            feedSource: "streaming",
            reqUserSub,
            page: 0,
          }),
          getFeed({ authSession, feedSource: "trending", reqUserSub, page: 0 }),
        ]);

        dispatch({
          type: "setHomeFollowingFeed",
          payload: {
            content: homeFollowingFeed,
            nextPage: 1,
          },
        });
        dispatch({
          type: "setHomeGuessingGames",
          payload: {
            content: homeGuessingGames,
            nextPage: 1,
          },
        });
        dispatch({
          type: "setHomeInTheatersFeed",
          payload: {
            content: homeInTheatersFeed,
            nextPage: 1,
          },
        });
        dispatch({
          type: "setHomeOnStreamingFeed",
          payload: {
            content: homeOnStreamingFeed,
            nextPage: 1,
          },
        });
        dispatch({
          type: "setHomeTopOfTheWeekFeed",
          payload: {
            content: homeTopOfTheWeekFeed,
            nextPage: 1,
          },
        });
      } catch (error) {
        firebaseCrashlyticsError(error);
      }
    }, [authSession, reelayDBUser, dispatch, setRefreshing]);

    useFocusEffect(
      useCallback(() => {
        const unsubscribe = navigation
          .getParent()
          .addListener("tabPress", (e) => {
            e.preventDefault();
            if (scrollRef.current) {
              scrollRef.current.scrollTo({ y: 0, animated: false });
              onRefresh();
            }
          });

        return () => {
          // Clean up the subscription or any other side effects.
          unsubscribe();
        };
      }, [navigation, onRefresh, scrollRef])
    );

    const [refreshing, setRefreshing] = useState(false);
    const refreshControl = (
      <RefreshControl
        tintColor={"#fff"}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );

    return (
      <HomeContainer selectedTab={selectedTab}>
        <SafeAreaView>
          <HomeHeader
            navigation={navigation}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            tabOptions={tabOptions}
          />
        </SafeAreaView>

        {/* <ScrollContainer ref={scrollRef} refreshControl={refreshControl} showsVerticalScrollIndicator={false}> */}
        <SectionDiscover
          key={1}
          navigation={navigation}
          refreshControl={refreshControl}
        />
        {/* <AnnouncementsAndNotices navigation={navigation} /> */}
        {/* { showWatchlistCard && <HomeWatchlistCard navigation={navigation} /> } */}
        {/* <GuessingGames navigation={navigation} /> */}
        {/* <RecommendedForYou navigation={navigation} /> */}
        {/* <PopularTitles navigation={navigation} /> */}
        {/* <TopOfTheWeek navigation={navigation} /> */}
        {/* <TopicsCarousel navigation={navigation} source='discover' /> // Hidden 1.08.04 */}
        {/* <OnStreaming navigation={navigation} source='discover' /> // Hidden 1.08.04 */}
        {/* <DiscoverSearch navigation={navigation} /> */}
        <Spacer />
        {/* </ScrollContainer> */}
        <BottomBar
          colors={["transparent", "#000000"]}
          locations={[0.05, 0.95]}
          end={{ x: 0.5, y: 1 }}
        />
        <NoticesAndAnnouncements navigation={navigation} />
      </HomeContainer>
    );
  } catch (error) {
    firebaseCrashlyticsError(error);
  }
};

const NoticesAndAnnouncements = React.memo(({ navigation }) => {
  const dispatch = useDispatch();
  const { reelayDBUser } = useContext(AuthContext);
  const isGuestUser = reelayDBUser?.username === "be_our_guest";

  const justShowMeSignupVisible = useSelector(
    (state) => state.justShowMeSignupVisible
  );
  const latestNotice = useSelector((state) => state.latestNotice);
  const latestNoticeDismissed = useSelector(
    (state) => state.latestNoticeDismissed
  );
  const latestNoticeSkipped = useSelector((state) => state.latestNoticeSkipped);
  const showNoticeAsOverlay =
    latestNotice &&
    !latestNoticeSkipped &&
    !latestNoticeDismissed &&
    !isGuestUser;

  const appUpdateRequired = useSelector((state) => state.appUpdateRequired);
  const appUpdateRecommended = useSelector(
    (state) => state.appUpdateRecommended
  );
  const appUpdateIgnored = useSelector((state) => state.appUpdateIgnored);
  const showAppUpdatePopup =
    (appUpdateRequired || appUpdateRecommended) && !appUpdateIgnored;
  // old code starts
  //   const showTabBar = !(showNoticeAsOverlay || showAppUpdatePopup);
  // old code ends
  const showTabBar = useMemo(
    () => !(showNoticeAsOverlay || showAppUpdatePopup),
    [showNoticeAsOverlay, showAppUpdatePopup]
  );

  useFocusEffect(
    React.useCallback(() => {
      dispatch({ type: "setTabBarVisible", payload: showTabBar });
    }, [dispatch, showTabBar])
  );
  return (
    <React.Fragment>
      {justShowMeSignupVisible && (
        <JustShowMeSignupDrawer navigation={navigation} />
      )}
      {showNoticeAsOverlay && <NoticeOverlay navigation={navigation} />}
      {showAppUpdatePopup && <AppUpdateOverlay />}
    </React.Fragment>
  );
});

export default memo(HomeComponent);
