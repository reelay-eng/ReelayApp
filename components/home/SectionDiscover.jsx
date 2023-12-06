import React, {
  memo,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Image,
  Pressable,
  View,
  Animated,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  RefreshControl,
  Linking,
  Platform,
} from "react-native";
import { Icon } from "react-native-elements";
import { AuthContext } from "../../context/AuthContext";
import {
  firebaseCrashlyticsError,
  firebaseCrashlyticsLog,
  logAmplitudeEventProd,
} from "../utils/EventLogger";
import styled from "styled-components";
import * as ReelayText from "../../components/global/Text";
import SeeMore from "../global/SeeMore";
import { useDispatch, useSelector } from "react-redux";
import TitlePoster from "../global/TitlePoster";
import { TouchableOpacity } from "react-native-gesture-handler";
import PagerView from "react-native-pager-view";
import TopOfTheWeek from "./TopOfTheWeek";
import ReelayThumbnailWithMovie from "../global/ReelayThumbnailWithMovie";
import ReelayFeedNew from "../feed/ReelayFeedNew";
import {
  getDiscoverFeed,
  getDiscoverFeedLatest,
  getDiscoverFeedNew,
} from "../../api/FeedApi";
import { getFeed } from "../../api/ReelayDBApi";
import { coalesceFiltersForAPI } from "../utils/FilterMappings";
import AllFeedFilters from "../feed/AllFeedFilters";
import ReelayTile from "./ReelayTile";
import { Ionicons } from "@expo/vector-icons";
import {
  faEdit,
  faPencil,
  faShare,
  fas,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import ReelayColors from "../../constants/ReelayColors";
import ReelayDiscVideo from "../global/ReelayDiscVideo";
import { Video } from "expo-av";
import VideoPlayer from "expo-video-player";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview";
import TitleBannerDiscover from "../feed/TitleBannerDiscover";
import StarRating from "../global/StarRating";
import { FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import FastImage from "react-native-fast-image";
import Constants from "expo-constants";
import {
  generateThumbnail,
  getThumbnailURI,
  saveThumbnail,
} from "../../api/ThumbnailApi";
import SplashImage from "../../assets/images/reelay-splash-with-dog-black.png";
import DogWithGlasses from "../../assets/images/dog-with-glasses.png";
import Hustle from "../../assets/images/home/hustle.png";
import UploadProgressBar from "../global/UploadProgressBar";
import { ResizeMode } from "expo-av";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Carousel } from "react-native-snap-carousel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GuessingGames from "./GuessingGames";
import moment from "moment";
import _ from "lodash";

const { height, width } = Dimensions.get("window");

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);
const POSTER_WIDTH = width * 0.5;
const POSTER_WIDTH2 = width * 0.46;
// const POSTER_WIDTH = Platform.isPad ? width *0.47 :width *0.445;
const canUseFastImage = Constants.appOwnership !== "expo";

const InTheatersContainer = styled(View)`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;
const HeaderContainer = styled(View)`
  align-items: flex-end;
  flex-direction: row;
  margin-top: 0px;
`;
const HeaderText = styled(ReelayText.H5Bold)`
  color: white;
  font-size: 18px;
  margin-left: 12px;
`;
const FilterPressable = styled(TouchableOpacity)`
  align-items: center;
  border-width: ${(props) => (props.isSelected ? 1 : 0)};
  border-color: #fff;
  border-radius: 8px;
  justify-content: center;
  margin-right: 8px;
  padding: 6px;
  flex-direction: row;
`;
const FilterRowView = styled(View)`
  align-items: center;
  justify-content: center;
  flex-direction: row;
  padding: 10px;
  padding-top: 0px;
  width: 100%;
`;
const FilterText = styled(ReelayText.CaptionEmphasized)`
  color: white;
`;

const TopReelaysContainer = styled(View)`
  width: 100%;
`;
const TopReelaysHeader = styled(ReelayText.H5Emphasized)`
  padding: 10px;
  color: white;
`;

const CreatorLineContainer = styled(View)`
  align-items: center;
  flex-direction: row;
  margin-left: 5px;
`;
const GradientContainer = styled(View)`
  align-items: flex-start;
  border-radius: 8px;
  height: 100%;
  justify-content: flex-end;
  position: absolute;
  width: 100%;
`;

const TItleContainer = styled(View)`
  align-items: flex-start;
  flex-direction: row;
  position: absolute;
  top: 0px;
  left: 0px;
`;
const StarRatingContainer = styled(View)`
  align-items: center;
  flex-direction: row;
  margin-top: -15px;
  margin-bottom: 6px;
`;
const ThumbnailContainer = styled(Pressable)`
  justify-content: center;
  border-radius: 12px;
  width: ${POSTER_WIDTH};
`;
const ThumbnailGradient = styled(LinearGradient)`
  border-radius: 0px;
  flex: 1;
  opacity: 0.6;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;
const UsernameText = styled(ReelayText.Subtitle2)`
  line-height: 18px;
  margin-top: 3px;
  font-size: 14px;
  color: white;
  flex: 1;
`;
const DogWithGlassesImage = styled(Image)`
  height: 125px;
  width: 100px;
  border-radius: 10px;
`;

const HustleImage = styled(Image)`
  height: 185px;
  width: 130px;
  border-radius: 10px;
`;

const ThumbnailImage = styled(canUseFastImage ? FastImage : Image)`
  border-radius: 12px;
  height: ${240}px;
`;
const WelcomeText = styled(ReelayText.H5Bold)`
  font-size: 18px;
  margin-left: 2px;
  line-height: 20px;
  color: white;
`;
const WelcomeText2 = styled(ReelayText.H5Bold)`
  font-size: 14px;
  margin-left: 2px;
  line-height: 20px;
  color: white;
`;
const LearnText = styled(ReelayText.H5Bold)`
  font-size: 12px;
  margin-left: 2px;
  line-height: 16px;
  color: white;
`;
const LearnText2 = styled(ReelayText.Subtitle1)`
  font-size: 12px;
  margin-left: 2px;
  line-height: 16px;
  margin-top: 10px;
  color: white;
`;
const filterKeys = ["Newest", "Following", "Watchlist", "More Filters"];
const SectionDiscover = ({ navigation, route, refreshControl }) => {
  try {
    firebaseCrashlyticsLog("SectionDiscover screen mounted");
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const isGuestUser = reelayDBUser?.username === "be_our_guest";

    const [selectedSection, setSelectedSection] = useState("Newest");
    const [activeIndex, setActiveIndex] = useState(0);
    const [displayItems, setDisplayItems] = useState([]);
    const pager = useRef(null);
    const topOfTheWeek = useSelector((state) => state.myHomeContent?.global);
    const [showAllFilters, setShowAllFilters] = useState(false);

    const isFocused = useIsFocused();

    const myStreamingVenues = useSelector(
      (state) => state.myStreamingSubscriptions
    ).map((subscription) => subscription.platform);

    const feedSource = route?.params?.feedSource ?? "discover";
    const initialFeedFilters = route?.params?.initialFeedFilters ?? [];
    const initialFeedPos = route?.params?.initialFeedPos ?? 0;
    const initialStackPos = route?.params?.initialStackPos ?? 0;
    const forceRefresh = route?.params?.forceRefresh ?? null;
    const pinnedReelay = route?.params?.pinnedReelay ?? null;
    const preloadedStackList = route?.params?.preloadedStackList ?? [];
    const s3Client = useSelector((state) => state.s3Client);

    const authSession = useSelector((state) => state.authSession);

    const discoverMostRecent = useSelector((state) => state.discoverMostRecent);
    const discoverThisWeek = useSelector((state) => state.discoverThisWeek);
    const discoverThisMonth = useSelector((state) => state.discoverThisMonth);
    const discoverAllTime = useSelector((state) => state.discoverAllTime);

    const newestReels = useSelector((state) => state.newestReels);
    const followingReels = useSelector((state) => state.followingReels);
    const watchlistReels = useSelector((state) => state.watchlistReels);
    const moreFiltersReels = useSelector((state) => state.moreFiltersReels);

    const sortedThreadData = {
      mostRecent: discoverMostRecent,
      thisWeek: discoverThisWeek,
      thisMonth: discoverThisMonth,
      allTime: discoverAllTime,
    };
    const [sortMethod, setSortMethod] = useState("mostRecent");
    const isFirstRender = useRef(true);
    const initNextPage =
      feedSource === "discover" ? sortedThreadData[sortMethod].nextPage : 1;
    const nextPage = useRef(initNextPage);

    const initReelayThreads =
      feedSource === "discover"
        ? sortedThreadData[sortMethod].content
        : preloadedStackList;
    const [selectedFilters, setSelectedFilters] = useState(initialFeedFilters);
    const [feedLoad, setFeedLoad] = useState(false);
    const [videoLoad, setVideoLoad] = useState(true);

    const [reelayThreads, setReelayThreads] = useState(initReelayThreads);
    const [extendLoad, setExtendLoad] = useState(false);
    const [endLoop, setEndLoop] = useState(false);
    const [onActive, setActive] = useState(true);
    const [muteIndex, setMuteIndex] = useState(0);
    const [focusedIndex, setFocusedIndex] = useState();
    const [impressionAdv, setImpressionAdv] = useState(0);
    const [gameImp, setGameImp] = useState(false);
    const videoRef = useRef(null);
    const flatRef = useRef(null);
    const uploadStage = useSelector((state) => state.uploadStage);
    const followingData = useSelector((state) => state.followingData);
    const [initialRender, setInitialRender] = useState(true);

    const showProgressBarStages = [
      "uploading",
      "upload-complete",
      "upload-failed-retry",
    ];
    const showProgressBar = showProgressBarStages.includes(uploadStage);

    const Advertise1 = [
      {
        key: 1,
        title: "Mission: Impossible - Dead Reckoning Part One",
        tmdbId: 575264,
        release_date: 2023,
        poster_path:
          "http://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
        genress: "Action, Adventure, Thriller, Science Fiction",
        overview:
          "Ethan Hunt and his IMF team embark on their most dangerous mission yet: To track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands. With control of the future and the world's fate at stake and dark forces from Ethan's past closing in, a deadly race around the globe begins. Confronted by a mysterious, all-powerful enemy, Ethan must consider that nothing can matter more than his mission—not even the lives of those he cares about most.",
        director: {
          adult: false,
          credit_id: "5c3d2a630e0a2655c48e51e4",
          department: "Directing",
          gender: 2,
          id: 9033,
          job: "Director",
          known_for_department: "Writing",
          name: "Christopher McQuarrie",
          original_name: "Christopher McQuarrie",
          popularity: 20.381,
          profile_path: "/82W339V8turXUdaCajqOyekxhmD.jpg",
        },
        display: "Mission: Impossible - Dead Reckoning Part One",
        displayActors: [
          {
            adult: false,
            cast_id: 4,
            character: "Ethan Hunt",
            credit_id: "5c3d2ae892514156e5ac7c11",
            gender: 2,
            id: 500,
            known_for_department: "Acting",
            name: "Tom Cruise",
            order: 0,
            original_name: "Tom Cruise",
            popularity: 95.223,
            profile_path: "/8qBylBsQf4llkGrWR3qAsOtOU8O.jpg",
          },
          {
            adult: false,
            cast_id: 7,
            character: "Grace",
            credit_id: "5d7306183a4a120011d15a14",
            gender: 1,
            id: 39459,
            known_for_department: "Acting",
            name: "Hayley Atwell",
            order: 1,
            original_name: "Hayley Atwell",
            popularity: 178.111,
            profile_path: "/jm5pDDjsbgizhxSd7baDxbGYMtW.jpg",
          },
        ],
        id: 575264,
        isSeries: false,
        overview:
          "Ethan Hunt and his IMF team embark on their most dangerous mission yet: To track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands. With control of the future and the world's fate at stake and dark forces from Ethan's past closing in, a deadly race around the globe begins. Confronted by a mysterious, all-powerful enemy, Ethan must consider that nothing can matter more than his mission—not even the lives of those he cares about most.",
        posterPath: "/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
        posterSource: {
          uri: "http://image.tmdb.org/t/p/w185/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
        },
        rating: null,
        releaseDate: "2023-07-08",
        releaseYear: "2023",
        runtime: 0,
        titleKey: "film-575264",
        titleType: "film",
        trailerURI: "HurjfO_TDlQ",
      },
      {
        key: 2,
        title: "Indiana Jones and the Dial of Destiny",
        tmdbId: 335977,
        release_date: 2023,
        poster_path:
          "http://image.tmdb.org/t/p/w500/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg",
        genress: "Adventure, Action, Fantasy",
        overview:
          "Finding himself in a new era, and approaching retirement, Indy wrestles with fitting into a world that seems to have outgrown him. But as the tentacles of an all-too-familiar evil return in the form of an old rival, Indy must don his hat and pick up his whip once more to make sure an ancient and powerful artifact doesn't fall into the wrong hands.",
        director: {
          adult: false,
          credit_id: "5e574108a6d93100145c82c6",
          department: "Directing",
          gender: 2,
          id: 366,
          job: "Director",
          known_for_department: "Directing",
          name: "James Mangold",
          original_name: "James Mangold",
          popularity: 24.589,
          profile_path: "/pk0GDjn99crNwR4qgCCEokDYd71.jpg",
        },
        display: "Indiana Jones and the Dial of Destiny",
        displayActors: [
          {
            adult: false,
            cast_id: 0,
            character: "Indiana Jones",
            credit_id: "56e8490ec3a368408f003646",
            gender: 2,
            id: 3,
            known_for_department: "Acting",
            name: "Harrison Ford",
            order: 0,
            original_name: "Harrison Ford",
            popularity: 53.106,
            profile_path: "/ActhM39LTxgx3tnJv3s5nM6hGD1.jpg",
          },
          {
            adult: false,
            cast_id: 19,
            character: "Helena Shaw",
            credit_id: "60707c53924ce5003f3416e0",
            gender: 1,
            id: 1023483,
            known_for_department: "Acting",
            name: "Phoebe Waller-Bridge",
            order: 1,
            original_name: "Phoebe Waller-Bridge",
            popularity: 37.206,
            profile_path: "/bkDzGCyE84JpUniL2LP8UKxXGV1.jpg",
          },
        ],
        id: 335977,
        isSeries: false,
        overview:
          "Finding himself in a new era, approaching retirement, Indy wrestles with fitting into a world that seems to have outgrown him. But as the tentacles of an all-too-familiar evil return in the form of an old rival, Indy must don his hat and pick up his whip once more to make sure an ancient and powerful artifact doesn't fall into the wrong hands.",
        posterPath: "/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg",
        posterSource: {
          uri: "http://image.tmdb.org/t/p/w185/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg",
        },
        rating: "PG-13",
        releaseDate: "2023-06-28",
        releaseYear: "2023",
        runtime: 155,
        tagline: "A legend will face his destiny.",
        titleKey: "film-335977",
        titleType: "film",
        trailerURI: "eQfMbSe7F2g",
      },
      {
        key: 3,
        title: "Oppenheimer",
        tmdbId: 872585,
        release_date: 2023,
        poster_path:
          "http://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        genress: "Drama, History",
        overview:
          "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
        director: {
          adult: false,
          credit_id: "613a93cbd38b58005f6a1964",
          department: "Directing",
          gender: 2,
          id: 525,
          job: "Director",
          known_for_department: "Directing",
          name: "Christopher Nolan",
          original_name: "Christopher Nolan",
          popularity: 34.803,
          profile_path: "/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg",
        },
        display: "Oppenheimer",
        displayActors: [
          {
            adult: false,
            cast_id: 3,
            character: "J. Robert Oppenheimer",
            credit_id: "613a940d9653f60043e380df",
            gender: 2,
            id: 2037,
            known_for_department: "Acting",
            name: "Cillian Murphy",
            order: 0,
            original_name: "Cillian Murphy",
            popularity: 127.948,
            profile_path: "/dm6V24NjjvjMiCtbMkc8Y2WPm2e.jpg",
          },
          {
            adult: false,
            cast_id: 161,
            character: "Katherine 'Kitty' Oppenheimer",
            credit_id: "6328c918524978007e9f1a7f",
            gender: 1,
            id: 5081,
            known_for_department: "Acting",
            name: "Emily Blunt",
            order: 1,
            original_name: "Emily Blunt",
            popularity: 70.774,
            profile_path: "/2mfJILwVGr4RBha3OihQVfq5nyL.jpg",
          },
        ],
        id: 872585,
        isSeries: false,
        overview:
          "The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.",
        posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        posterSource: {
          uri: "http://image.tmdb.org/t/p/w185/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        },
        rating: null,
        releaseDate: "2023-07-19",
        releaseYear: "2023",
        runtime: 0,
        titleKey: "film-872585",
        titleType: "film",
        trailerURI: "sOsIKu2VAkM",
      },
    ];
    const Advertise2 = [
      {
        key: 1,
        title: "Barbie",
        tmdbId: 346698,
        release_date: 2023,
        poster_path:
          "http://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        genress: "Comedy, Adventure, Fantasy",
        overview:
          "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
        director: {
          adult: false,
          credit_id: "5f87d5b52385130036355b3a",
          department: "Directing",
          gender: 1,
          id: 45400,
          job: "Director",
          known_for_department: "Acting",
          name: "Greta Gerwig",
          original_name: "Greta Gerwig",
          popularity: 46.078,
          profile_path: "/nHrWXL1VFaV4a3wRNlhp5NfO98m.jpg",
        },
        display: "Barbie",
        displayActors: [
          {
            adult: false,
            cast_id: 58,
            character: "Barbie",
            credit_id: "5f88a9d28258fc0036ad14ff",
            gender: 1,
            id: 234352,
            known_for_department: "Acting",
            name: "Margot Robbie",
            order: 0,
            original_name: "Margot Robbie",
            popularity: 97.413,
            profile_path: "/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg",
          },
          {
            adult: false,
            cast_id: 59,
            character: "Ken",
            credit_id: "61732049a217c000434083ec",
            gender: 2,
            id: 30614,
            known_for_department: "Acting",
            name: "Ryan Gosling",
            order: 1,
            original_name: "Ryan Gosling",
            popularity: 109.753,
            profile_path: "/lyUyVARQKhGxaxy0FbPJCQRpiaW.jpg",
          },
        ],
        id: 346698,
        isSeries: false,
        overview:
          "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
        posterPath: "/cgYg04miVQUAG2FKk3amSnnHzOp.jpg",
        posterSource: {
          uri: "http://image.tmdb.org/t/p/w185/cgYg04miVQUAG2FKk3amSnnHzOp.jpg",
        },
        rating: null,
        releaseDate: "2023-07-19",
        releaseYear: "2023",
        runtime: 0,
        titleKey: "film-346698",
        titleType: "film",
        trailerURI: "Y1IgAEejvqM",
      },
      {
        key: 2,
        title: "Napoleon",
        tmdbId: 753342,
        release_date: 2023,
        poster_path:
          "http://image.tmdb.org/t/p/w500/icQpWcVhwHvCRrT53BjDzbYJhJm.jpg",
        genress: "Drama, History, Action",
        overview:
          "A personal look at the French military leader’s origins and swift, ruthless climb to emperor, viewed through the prism of Napoleon’s addictive, volatile relationship with his wife and one true love, Josephine.",
        director: {
          adult: false,
          credit_id: "5f87352ba1c59d00371171c6",
          department: "Directing",
          gender: 2,
          id: 578,
          job: "Director",
          known_for_department: "Directing",
          name: "Ridley Scott",
          original_name: "Ridley Scott",
          popularity: 11.881,
          profile_path: "/zABJmN9opmqD4orWl3KSdCaSo7Q.jpg",
        },
        display: "Napoleon",
        displayActors: [
          {
            adult: false,
            cast_id: 1,
            character: "Napoleon Bonaparte",
            credit_id: "5f8734f6d4b9d9003726f177",
            gender: 2,
            id: 73421,
            known_for_department: "Acting",
            name: "Joaquin Phoenix",
            order: 0,
            original_name: "Joaquin Phoenix",
            popularity: 22.698,
            profile_path: "/oe0ydnDvQJCTbAb2r5E1asVXoCP.jpg",
          },
          {
            adult: false,
            cast_id: 9,
            character: "Empress Josephine",
            credit_id: "61d4df3cd48cee001ceca299",
            gender: 1,
            id: 556356,
            known_for_department: "Acting",
            name: "Vanessa Kirby",
            order: 1,
            original_name: "Vanessa Kirby",
            popularity: 264.259,
            profile_path: "/5fbvIkZ02RdcXfZHUUk4cQ9kILK.jpg",
          },
        ],
        id: 753342,
        isSeries: false,
        overview:
          "A personal look at the French military leader’s origins and swift, ruthless climb to emperor, viewed through the prism of Napoleon’s addictive, volatile relationship with his wife and one true love, Josephine.",
        posterPath: "/ofXToitZCjAPgadlbQDWM0Uaxa8.jpg",
        posterSource: {
          uri: "http://image.tmdb.org/t/p/w185/ofXToitZCjAPgadlbQDWM0Uaxa8.jpg",
        },
        rating: "R",
        releaseDate: "2023-11-22",
        releaseYear: "2023",
        runtime: 158,
        tagline: "He came from nothing. He conquered everything.",
        titleKey: "film-753342",
        titleType: "film",
        trailerURI: "CBmWztLPp9c",
      },
    ];

    useEffect(() => {
      Syncc();
    }, []);
    const Syncc = async () => {
      const advertiseImpression = await AsyncStorage.getItem(
        "advertiseImpression"
      );
      const advertiseGame = await AsyncStorage.getItem("advertiseGame");
      const todaysData = moment().format("DD-MM-YYYY");
      console.log("advertiseImpression", advertiseImpression);
      if (!advertiseImpression) {
        setImpressionAdv(0);
        await AsyncStorage.setItem("advertiseImpression", "0");
      } else if (advertiseImpression && advertiseImpression == "0") {
        // if (!advertiseGame) {
        //     setGameImp(true)
        //     await AsyncStorage.setItem('advertiseGame', todaysData);
        // }else if(advertiseGame && moment(advertiseGame).isSame(todaysData)){
        //     setGameImp(false)
        // }else{
        //     setGameImp(true)
        //     await AsyncStorage.setItem('advertiseGame', todaysData);
        // }
        setImpressionAdv(1);
        await AsyncStorage.setItem("advertiseImpression", "1");
      } else if (advertiseImpression && advertiseImpression == "1") {
        setImpressionAdv(0);
        await AsyncStorage.setItem("advertiseImpression", "0");
      }
    };

    const FilterButton = ({ filterKey }) => {
      const isSelected = selectedSection.includes(filterKey);

      const getOppositeKey = () => {
        if (filterKey === "Newest") return 0;
        if (filterKey === "Following") return 1;
        if (filterKey === "Watchlist") return 2;
        if (filterKey === "More Filters") return 3;
        return "";
      };

      const onPress = () => {
        const oppositeKey = getOppositeKey();
        if (oppositeKey == 3) {
          setShowAllFilters(true);
        }
        // if (flatRef?.current) {
        //     flatRef?.current?.scrollToIndex({ animated: true, index: 0 });
        // }
        if (activeIndex !== oppositeKey) {
          setDisplayItems([]);
          setActiveIndex(oppositeKey);
          setSelectedSection(filterKey);
          pager.current?.setPage?.(oppositeKey);
          setMuteIndex(0);
          setEndLoop(false);
        }
      };

      return (
        <FilterPressable isSelected={isSelected} onPress={onPress}>
          <FilterText>{filterKey}</FilterText>
          {/* {filterKey == "More Filters" &&
                    <TouchableOpacity onPress={() => setShowAllFilters(true)}>
                        <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faPencil} color={ReelayColors.reelayBlue} size={14} />
                    </TouchableOpacity>} */}
        </FilterPressable>
      );
    };

    useFocusEffect(
      React.useCallback(() => {
        console.log("inside");
        setActive(true);
        // setMuteIndex(0)
        return () => {
          console.log("outside");
          setActive(false);
          setMuteIndex(-1);
        };
      }, [])
    );

    const WatchlistFilters = () => {
      const filterKeys = ["Newest", "Following", "Watchlist", "More Filters"];
      return (
        <FilterRowView>
          {filterKeys.map((key) => (
            <FilterButton key={key} filterKey={key} />
          ))}
        </FilterRowView>
      );
    };

    const goToReelay = (item, index) => {
      console.log("goToReelay", index);

      if (index !== 0) return;

      navigation.push("TitleFeedScreen", {
        initialStackPos: index,
        fixedStackList: item,
      });
    };

    var dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });

    useEffect(() => {
      loadFeed("Newest");
      loadFeed("Following");
      loadFeed("Watchlist");
      loadFeed("More Filters");
    }, []);

    useEffect(() => {
      console.log("selectFil inside");

      if (selectedSection == "More Filters") loadFeed("More Filters");
    }, [selectedFilters]);

    const loadFeed = async (items) => {
      // console.log("Load feed executed--------");
      setFeedLoad(true);
      const silSelect =
        items == "Following"
          ? [
              {
                category: "community",
                display: "my friends",
                option: "following",
              },
            ]
          : items == "Watchlist"
          ? [
              {
                category: "watchlist",
                display: "on my watchlist",
                option: "on_my_watchlist",
              },
            ]
          : items == "Newest"
          ? []
          : selectedFilters;

      var fetchedThreads;
      if (items == "Following") {
        // console.log("followingData",followingData)
        if (followingData?.length < 50) {
          fetchedThreads = await getDiscoverFeed({
            authSession,
            filters: coalesceFiltersForAPI(silSelect, myStreamingVenues),
            page: 0,
            reqUserSub: reelayDBUser?.sub,
            sortMethod,
          });
        } else {
          fetchedThreads = await getDiscoverFeedLatest({
            authSession,
            filters: coalesceFiltersForAPI(silSelect, myStreamingVenues),
            page: 0,
            reqUserSub: reelayDBUser?.sub,
            sortMethod,
          });
        }
      } else {
        fetchedThreads = await getDiscoverFeedLatest({
          authSession,
          filters: coalesceFiltersForAPI(silSelect, myStreamingVenues),
          page: 0,
          reqUserSub: reelayDBUser?.sub,
          sortMethod,
        });
      }
      // items == "Newest" ?
      //     await getDiscoverFeedNew({
      //         authSession,
      //         filters: coalesceFiltersForAPI(silSelect, myStreamingVenues),
      //         page: 0,
      //         reqUserSub: reelayDBUser?.sub,
      //         sortMethod,
      //     })
      //     :

      // console.log("fetchedThreads",fetchedThreads)

      if (feedSource === "discover") {
        let dispatchAction = "setDiscoverMostRecent";
        if (sortMethod === "thisWeek") dispatchAction = "setDiscoverThisWeek";
        if (sortMethod === "thisMonth") dispatchAction = "setDiscoverThisMonth";
        if (sortMethod === "allTime") dispatchAction = "setDiscoverAllTime";

        const payload = {
          content: fetchedThreads,
          filters: {},
          nextPage: 1,
        };
        dispatch({ type: dispatchAction, payload });
      }

      nextPage.current = 1;
      if (items == "Newest") {
        // console.log("fetchedThreads",fetchedThreads[1])
        // console.error("reelData?.length",fetchedThreads.length)
        // const FetThread = removeDuplicates(fetchedThreads)
        fetchedThreads.splice(6, 0, { advertise: true, valIndex: 0 }); // n is declared and is the index where to add the object
        dispatch({ type: "setNewestReels", payload: fetchedThreads });
        // dataProvider = dataProvider.cloneWithRows(fetchedThreads);
      }
      if (items == "Following") {
        dispatch({ type: "setFollowingReels", payload: fetchedThreads });
      }
      if (items == "Watchlist") {
        dispatch({ type: "setWatchlistReels", payload: fetchedThreads });
      }
      if (items == "More Filters") {
        dispatch({ type: "setMoreFiltersReels", payload: fetchedThreads });
        // closeAllFiltersList()
      }

      setFeedLoad(false);
    };
    //------- Old Code starts---------
    // const extendFeed = async (items) => {
    //   if (extendLoad) {
    //     console.log("Already extending feed. Skipping...");
    //     return;
    //   }

    //   setExtendLoad(true);

    //   console.log("extendFeed ", nextPage.current, items);
    //   const page =
    //     feedSource === "discover"
    //       ? discoverMostRecent.nextPage
    //       : nextPage.current;
    //   const silSelect =
    //     items == "Following"
    //       ? [
    //           {
    //             category: "community",
    //             display: "my friends",
    //             option: "following",
    //           },
    //         ]
    //       : items == "Watchlist"
    //       ? [
    //           {
    //             category: "watchlist",
    //             display: "on my watchlist",
    //             option: "on_my_watchlist",
    //           },
    //         ]
    //       : items == "Newest"
    //       ? []
    //       : selectedFilters;

    //   let fetchedThreads;
    //   // items == "Newest" ?
    //   //     await getDiscoverFeedNew({
    //   //         authSession,
    //   //         filters: coalesceFiltersForAPI(silSelect, myStreamingVenues),
    //   //         page,
    //   //         reqUserSub: reelayDBUser?.sub,
    //   //         sortMethod,
    //   //     }) :

    //   // if (items == "Following") {
    //   //   if (followingData?.length < 50) {
    //   //     fetchedThreads = await getDiscoverFeed({
    //   //       authSession,
    //   //       filters: coalesceFiltersForAPI(silSelect, myStreamingVenues),
    //   //       page,
    //   //       reqUserSub: reelayDBUser?.sub,
    //   //       sortMethod,
    //   //     });
    //   //   } else {
    //   //     console.log("getDiscoverFeedLatest called 123");
    //   //     fetchedThreads = await getDiscoverFeedLatest({
    //   //       authSession,
    //   //       filters: coalesceFiltersForAPI(silSelect, myStreamingVenues),
    //   //       page,
    //   //       reqUserSub: reelayDBUser?.sub,
    //   //       sortMethod,
    //   //     });
    //   //   }
    //   // } else {
    //   //   console.log("getDiscoverFeedLatest called 456");
    //   //   fetchedThreads = await getDiscoverFeedLatest({
    //   //     authSession,
    //   //     filters: coalesceFiltersForAPI(silSelect, myStreamingVenues),
    //   //     page,
    //   //     reqUserSub: reelayDBUser?.sub,
    //   //     sortMethod,
    //   //   });
    //   // }

    //   const shouldUseFollowingData =
    //     items === "Following" && followingData?.length < 50;

    //   if (shouldUseFollowingData) {
    //     fetchedThreads = await getDiscoverFeed({
    //       authSession,
    //       filters: coalesceFiltersForAPI(silSelect, myStreamingVenues),
    //       page,
    //       reqUserSub: reelayDBUser?.sub,
    //       sortMethod,
    //     });
    //   } else {
    //     fetchedThreads = await getDiscoverFeedLatest({
    //       authSession,
    //       filters: coalesceFiltersForAPI(silSelect, myStreamingVenues),
    //       page,
    //       reqUserSub: reelayDBUser?.sub,
    //       sortMethod,
    //     });
    //     console.log("-----fetchedThreads-----", fetchedThreads);
    //   }

    //   // probably don't need to create this every time, but we want to avoid unnecessary state
    //   const threadEntries = {};
    //   const addToThreadEntries = (fetchedThread) => {
    //     const reelay =
    //       items == "Following" && followingData?.length < 50
    //         ? fetchedThread[0]
    //         : fetchedThread; //items == "Newest" ? fetchedThread : fetchedThread[0];
    //     threadEntries[reelay?.sub ?? reelay?.id] = 1;
    //   };
    //   const reelayThread =
    //     items == "Watchlist"
    //       ? watchlistReels
    //       : items == "Following"
    //       ? followingReels
    //       : items == "Newest"
    //       ? newestReels
    //       : moreFiltersReels;
    //   // reelayThread?.forEach(addToThreadEntries);

    //   const notAlreadyInStack = (fetchedThread) => {
    //     const reelay = fetchedThread; //items == "Newest" ? fetchedThread : fetchedThread[0];
    //     const alreadyInStack = threadEntries[reelay?.sub ?? reelay?.id];
    //     if (alreadyInStack)
    //       console.log("Filtering stack ", reelay?.sub ?? reelay?.id);
    //     return !alreadyInStack;
    //   };

    //   const filteredThreads = fetchedThreads; //items == "Newest" ? fetchedThreads : fetchedThreads.filter(notAlreadyInStack);
    //   const allThreads = [...reelayThread, ...filteredThreads];
    //   if (allThreads?.length == reelayThread?.length) {
    //     setEndLoop(true);
    //   }
    //   setExtendLoad(false);

    //   if (feedSource === "discover") {
    //     let dispatchAction = "setDiscoverMostRecent";
    //     if (sortMethod === "thisWeek") dispatchAction = "setDiscoverThisWeek";
    //     if (sortMethod === "thisMonth") dispatchAction = "setDiscoverThisMonth";
    //     if (sortMethod === "allTime") dispatchAction = "setDiscoverAllTime";

    //     const payload = {
    //       content: allThreads,
    //       filters: {},
    //       nextPage: page + 1,
    //     };
    //     console.log("dispatching payload with threads: ", allThreads.length);
    //     console.log("extendFeed 123ß");
    //     dispatch({ type: dispatchAction, payload });
    //   }

    //   nextPage.current = page + 1;

    //   // if (items == "Newest") {
    //   //   console.log("allThreads.length", allThreads.length);
    //   //   if (allThreads.length <= 17) {
    //   //     allThreads.splice(13, 0, { advertise: true, valIndex: 1 }); // n is declared and is the index where to add the object
    //   //     dispatch({ type: "setNewestReels", payload: allThreads });
    //   //   } else {
    //   //     dispatch({ type: "setNewestReels", payload: allThreads });
    //   //   }
    //   // }
    //   // if (items == "Following") {
    //   //   dispatch({ type: "setFollowingReels", payload: allThreads });
    //   // }
    //   // if (items == "Watchlist") {
    //   //   dispatch({ type: "setWatchlistReels", payload: allThreads });
    //   // }
    //   // if (items == "More Filters") {
    //   //   dispatch({ type: "setMoreFiltersReels", payload: allThreads });
    //   //   // closeAllFiltersList()
    //   // }
    //   let updateType;
    //   switch (items) {
    //     case "Newest":
    //       if (allThreads.length <= 17) {
    //         allThreads.splice(13, 0, { advertise: true, valIndex: 1 });
    //       }
    //       updateType = "setNewestReels";
    //       break;
    //     case "Following":
    //       updateType = "setFollowingReels";
    //       break;
    //     case "Watchlist":
    //       updateType = "setWatchlistReels";
    //       break;
    //     case "More Filters":
    //       updateType = "setMoreFiltersReels";
    //       // closeAllFiltersList()
    //       break;
    //     default:
    //       break;
    //   }

    //   dispatch({ type: updateType, payload: allThreads });
    // };
    //  -------Old code ends------

    // ----- New code extendFeed starts -----
    const extendFeed = async (items = "") => {
      if (extendLoad) {
        return;
      }

      setExtendLoad(true);

      const calculatedPage =
        feedSource === "discover"
          ? discoverMostRecent.nextPage
          : nextPage.current;

      const queryParams = {
        authSession,
        filters: coalesceFiltersForAPI(setSilSelect(items), myStreamingVenues),
        page: calculatedPage,
        reqUserSub: reelayDBUser?.sub,
        sortMethod,
      };

      const fetchedThreads =
        items === "Following" && followingData?.length < 50
          ? await getDiscoverFeed(queryParams)
          : await getDiscoverFeedLatest(queryParams);

      let combinedThreads = [...setReelayThread(items), ...fetchedThreads];
      setEndLoop(combinedThreads.length === setReelayThread(items).length);
      setExtendLoad(false);

      if (feedSource === "discover") {
        const payload = {
          content: combinedThreads,
          filters: {},
          nextPage: calculatedPage + 1,
        };

        dispatch({ type: setDispatchAction(items), payload });
      }

      nextPage.current = calculatedPage + 1;

      if (items === "Newest" && combinedThreads.length <= 17) {
        combinedThreads.splice(13, 0, { advertise: true, valIndex: 1 });
      }

      dispatch({ type: setUpdateType(items), payload: combinedThreads });
    };

    // Helper functions
    const setSilSelect = (items) => {
      const filterObj = {
        Following: [
          { category: "community", display: "my friends", option: "following" },
        ],
        Watchlist: [
          {
            category: "watchlist",
            display: "on my watchlist",
            option: "on_my_watchlist",
          },
        ],
        Newest: [],
      };

      return filterObj[items] || selectedFilters;
    };

    const setReelayThread = (items) => {
      const reelayObj = {
        Watchlist: watchlistReels,
        Following: followingReels,
        Newest: newestReels,
      };

      return reelayObj[items] || moreFiltersReels;
    };

    const setUpdateType = (items) => {
      const updateObj = {
        Newest: "setNewestReels",
        Following: "setFollowingReels",
        Watchlist: "setWatchlistReels",
        "More Filters": "setMoreFiltersReels",
      };

      return updateObj[items];
    };

    const setDispatchAction = (items) => {
      const dispatchObj = {
        thisWeek: "setDiscoverThisWeek",
        thisMonth: "setDiscoverThisMonth",
        allTime: "setDiscoverAllTime",
      };

      return dispatchObj[sortMethod] || "setDiscoverMostRecent";
    };
    // ----- New code extendFeed ends -----

    const getOppositeKey = (item) => {
      if (item === 0) return "Newest";
      if (item === 1) return "Following";
      if (item === 2) return "Watchlist";
      if (item === 3) return "More Filters";
      return "";
    };

    const onPressS = (item) => {
      console.log(item, activeIndex);
      if (activeIndex == item) {
        return false;
      }
      setActiveIndex(item);
      const oppositeKey = getOppositeKey(item);
      // const filterOppositeKey = (key) => key !== oppositeKey;
      setDisplayItems([]);
      setSelectedSection(oppositeKey);
      pager.current?.setPage?.(item);
    };
    const closeAllFiltersList = () => setShowAllFilters(false);
    const closeAllFilters = () => {};

    const layoutProvider = new LayoutProvider(
      (index) => {
        return index;
      },
      (type, dimension) => {
        dimension.height = 240;
        dimension.width = 180;
      }
    );

    const rowRenderer = ({ item, index }) => {
      const reelay =
        selectedSection == "Following" && followingData?.length < 50
          ? isGuestUser
            ? item
            : item[0]
          : item; //selectedSection == "Newest" ? item : item[0];

      const starRating =
        (reelay?.starRating ?? 0) + (reelay?.starRatingAddHalf ? 0.5 : 0);
      // var muteIndex = 0;
      const onPlaybackStatusUpdate = (playbackStatus, index) => {
        if (playbackStatus?.positionMillis > 6000) {
          // setMuteIndex(index + 1)
          videoRef.current.stopAsync();
        }
      };
      const gotoDetail = (reelay) => {
        setMuteIndex(-1);
        navigation.push("SingleReelayScreen", { reelaySub: reelay?.sub });
        // navigation.push('TitleDiscoverReelayScreen', { reelaySub: reelay?.sub })
      };

      const generateAndSaveThumbnail = async () => {
        console.log("ON ERROR TRIGGERED: ", getThumbnailURI(reelay));
        const thumbnailObj = await generateThumbnail(reelay);
        if (thumbnailObj && !thumbnailObj.error) {
          const bnail = saveThumbnail(reelay, s3Client, thumbnailObj);
          return bnail;
        } else {
          return SplashImage;
        }
        return thumbnailObj;
      };

      const renderMediaContent = (reelay, index) => {
        if (onActive && muteIndex === index) {
          return (
            <View
              style={{
                borderRadius: 12,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <VideoPlayer
                videoProps={{
                  shouldPlay: true,
                  isMuted: false,
                  isLooping: false,
                  useNativeControls: false,
                  timeVisible: false,
                  defaultControlsVisible: false,
                  resizeMode: ResizeMode.COVER,
                  source: {
                    uri: reelay?.content?.videoURI,
                  },
                }}
                playbackCallback={(e) => {
                  if (e.isLoaded) {
                    if (e.didJustFinish) {
                      setMuteIndex(-1);
                    }
                  }
                }}
                slider={{ visible: false }}
                timeVisible={false}
                defaultControlsVisible={false}
                useNativeControls={false}
                showControlsOnLoad={false}
                style={{
                  height: 240,
                  width: POSTER_WIDTH2,
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                }}
              />
            </View>
          );
        } else {
          return (
            <ThumbnailImage
              onError={() => generateAndSaveThumbnail(reelay)}
              source={{ uri: getThumbnailURI(reelay) }}
            />
          );
        }
      };

      return !reelay?.advertise ? (
        <ThumbnailContainer key={index} onPress={() => gotoDetail(reelay)}>
          <View style={{ margin: 10 }}>
            {renderMediaContent(reelay, index)}
            <TItleContainer>
              <TitleBannerDiscover titleObj={reelay?.title} reelay={reelay} />
            </TItleContainer>
            <GradientContainer>
              {/* <ThumbnailGradient colors={["transparent", "#0B1424"]} /> */}
              <BlurView
                intensity={15}
                tint="dark"
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  height: 40,
                  borderBottomRightRadius: 12,
                  borderBottomLeftRadius: 12,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{ flexDirection: "row", height: 40, width: "80%" }}
                >
                  <>
                    <CreatorLineContainer>
                      <ProfilePicture user={reelay?.creator} size={26} border />
                    </CreatorLineContainer>
                  </>
                  <View style={{ marginLeft: 5, width: "70%" }}>
                    <UsernameText numberOfLines={2}>
                      {reelay?.creator?.username}
                    </UsernameText>
                    {starRating > 0 && (
                      <StarRatingContainer>
                        <StarRating
                          disabled={true}
                          rating={starRating}
                          starSize={12}
                          starStyle={{ paddingRight: 2 }}
                        />
                      </StarRatingContainer>
                    )}
                  </View>
                </View>
                <View style={{ width: "25%", justifyContent: "center" }}>
                  {muteIndex !== index ? (
                    <Pressable
                      onPress={() => setMuteIndex(index)}
                      style={{
                        marginLeft: -5,
                        height: 40,
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="volume-mute"
                        color={"#fff"}
                        size={24}
                        style={{ paddingRight: 8, textAlign: "center" }}
                      />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => setMuteIndex(-1)}
                      style={{
                        marginLeft: -5,
                        height: 40,
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="volume-high"
                        color={"#fff"}
                        size={24}
                        style={{ paddingRight: 8, textAlign: "center" }}
                      />
                    </Pressable>
                  )}
                </View>
              </BlurView>
            </GradientContainer>
          </View>
        </ThumbnailContainer>
      ) : (
        <>
          {reelay?.valIndex == 0 ? (
            //    ( !gameImp ?
            <Carousel
              activeSlideAlignment={"center"}
              data={Advertise1}
              loop={true}
              // activeIndex={2}
              inactiveSlideScale={0.95}
              //  itemHeight={452}
              firstItem={impressionAdv}
              itemWidth={width}
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() =>
                    navigation.push("TitleDetailScreen", { titleObj: item })
                  }
                  style={{
                    backgroundColor:
                      item.key == 1 || item.key == 3 ? "#4388F1" : "#1EC072",
                    flexDirection: "row",
                    borderRadius: 10,
                    margin: 10,
                    padding: 10,
                  }}
                >
                  <View style={{ width: "35%" }}>
                    <View
                      style={{ justifyContent: "center", alignSelf: "center" }}
                    >
                      <HustleImage
                        resizeMode="contain"
                        source={{ uri: item.poster_path }}
                      />
                    </View>
                  </View>
                  <View
                    style={{ width: "62%", paddingTop: 10, marginLeft: 10 }}
                  >
                    <WelcomeText numberOfLines={2}>{item.title}</WelcomeText>
                    <WelcomeText2>{item.release_date}</WelcomeText2>
                    <LearnText numberOfLines={2}>{item.genres}</LearnText>
                    <LearnText2 numberOfLines={4}>{item.overview}</LearnText2>
                  </View>
                </Pressable>
              )}
              sliderHeight={452}
              sliderWidth={width}
            />
          ) : (
            //  :
            //  <GuessingGames navigation={navigation} advertise={true} />)

            <Carousel
              activeSlideAlignment={"center"}
              data={Advertise2}
              loop={true}
              firstItem={impressionAdv}
              inactiveSlideScale={0.95}
              //  itemHeight={452}
              itemWidth={width}
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() =>
                    navigation.push("TitleDetailScreen", { titleObj: item })
                  }
                  style={{
                    backgroundColor: item.key == 2 ? "#4388F1" : "#1EC072",
                    flexDirection: "row",
                    borderRadius: 10,
                    margin: 10,
                    marginRight: 20,
                    padding: 10,
                  }}
                >
                  <View style={{ width: "35%" }}>
                    <View
                      style={{ justifyContent: "center", alignSelf: "center" }}
                    >
                      <HustleImage
                        resizeMode="contain"
                        source={{ uri: item.poster_path }}
                      />
                    </View>
                  </View>
                  <View
                    style={{ width: "62%", paddingTop: 10, marginLeft: 10 }}
                  >
                    <WelcomeText numberOfLines={2}>{item.title}</WelcomeText>
                    <WelcomeText2>{item.release_date}</WelcomeText2>
                    <LearnText numberOfLines={2}>{item.genress}</LearnText>
                    <LearnText2 numberOfLines={4}>{item.overview}</LearnText2>
                  </View>
                </Pressable>
              )}
              sliderHeight={452}
              sliderWidth={width}
            />
          )}
        </>
      );
    };
    const refreshControls = (
      <RefreshControl
        tintColor={"#fff"}
        refreshing={feedLoad}
        onRefresh={() => loadFeed(selectedSection)}
      />
    );
    const handleScroll = React.useCallback(
      ({
        nativeEvent: {
          contentOffset: { y },
        },
      }) => {
        // const a = muteIndex <= 10 ? y:y-400
        // alert("hi")
        // console.log(onActive)
        if (onActive) {
          const offset = Math.round(y / 240);
          let calOffset = muteIndex <= 12 ? offset * 2 : offset * 2 - 2;
          if (offset * 2 !== setMuteIndex) {
            setMuteIndex(calOffset); //offset * 2)
          }
          setFocusedIndex(offset);
        }
      },
      [focusedIndex]
    );
    const flatListData = useMemo(() => {
      return selectedSection === "Watchlist"
        ? watchlistReels
        : selectedSection === "Following"
        ? followingReels
        : selectedSection === "Newest"
        ? newestReels
        : moreFiltersReels;
    }, [
      selectedSection,
      watchlistReels,
      followingReels,
      newestReels,
      moreFiltersReels,
    ]);

    // const extraDa = selectedSection === "Watchlist" ? watchlistReels : selectedSection === "Following" ? followingReels : selectedSection === "Newest" ? newestReels : moreFiltersReels;
    return (
      <InTheatersContainer>
        <HeaderContainer>
          <WatchlistFilters />
        </HeaderContainer>
        {!feedLoad ? (
          <View style={{}}>
            <FlatList
              // data={selectedSection === "Watchlist" ? watchlistReels : selectedSection === "Following" ? followingReels : selectedSection === "Newest" ? newestReels : moreFiltersReels}
              data={flatListData}
              refreshControl={refreshControls}
              onScroll={handleScroll}
              contentContainerStyle={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingBottom: 300,
              }}
              initialNumToRender={2}
              ref={flatRef}
              // extraData={extraDa}
              removeClippedSubviews={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={(item, index) => rowRenderer(item, index)}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                extendLoad && (
                  <View style={{ width: width }}>
                    <ActivityIndicator
                      style={{ margin: 10 }}
                      size={"small"}
                      color={"#fff"}
                    />
                  </View>
                )
              }
              onEndReached={() => !endLoop && extendFeed(selectedSection)}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ) : null}

        {showProgressBar && (
          <UploadProgressBar
            mountLocation={"Discover"}
            onRefresh={() => loadFeed("Newest")}
          />
        )}

        {selectedSection == "More Filters" && showAllFilters && (
          <Modal animationType="slide" transparent={true} visible={true}>
            <SafeAreaView style={{ marginTop: 25 }}>
              <AllFeedFilters
                closeAllFiltersList={closeAllFiltersList}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                newDiscover={true}
              />
            </SafeAreaView>
          </Modal>
        )}

        {feedLoad && (
          <ActivityIndicator
            style={{ marginTop: height * 0.3 }}
            size={"small"}
            color={"#fff"}
          />
        )}
      </InTheatersContainer>
    );
  } catch (error) {
    firebaseCrashlyticsError(error);
  }
};

export default memo(SectionDiscover);

{
  /* <AnimatedPagerView
                style={{height:"100%",width:"100%"}} 
                ref={pager} layoutDirection="ltr"
                onPageSelected={({ nativeEvent }) => onPressS(nativeEvent.position)}
                orientation="horizontal" scrollEnabled={false} initialPage={0}> */
}
{
  /* {filterKeys.map((items, index) => */
}

{
  /* <Pressable onPress={() => Linking.openURL("https://www.reelay.app/")} style={{ backgroundColor: "#4388F1", flexDirection: "row", borderRadius: 10, margin: 10, marginRight: 20, padding: 10 }}>
<View style={{ width: "35%" }}>
    <View style={{ justifyContent: "center", alignSelf: "center" }}>
        <LinearGradient style={{ margin: 10, padding: 10, paddingBottom: 30 }} colors={["#0B1424", "transparent"]} >
            <DogWithGlassesImage resizeMode='contain' source={DogWithGlasses} />
        </LinearGradient>
    </View>
</View>
<View style={{ width: "62%", paddingTop: 10, marginLeft: 10 }}>
    <WelcomeText>WELCOME TO REELAY!</WelcomeText>
    <LearnText>LEARN HOW TO GET STARTED</LearnText>
    <LearnText2>Clicking on anything here will take the user to Reelay's official account and their videos. Since it’s not technically a reelay, we should expand the “Tutorial” section within the app to include different videos and have the content basically be the same as the blog.</LearnText2>
</View>
</Pressable> */
}
