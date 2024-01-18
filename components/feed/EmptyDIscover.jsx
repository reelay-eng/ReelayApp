import { Alert, Dimensions, Pressable, TouchableOpacity, View, Image, ImageBackground, Linking } from 'react-native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { TopicsGiantIconSVG } from '../global/SVGs';

import React from 'react';
import * as ReelayText from '../global/Text';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import ReelayInfo from './ReelayInfo';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faVideo,faAdd, faShare } from '@fortawesome/free-solid-svg-icons';
import ShareOutTopicButton from './ShareOutTopicButton';
import Carousel from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image';
const { height, width } = Dimensions.get('window');
import Constants from 'expo-constants';

const canUseFastImage = (Constants.appOwnership !== 'expo');

const BottomGradient = styled(LinearGradient)`
    position: absolute;
    bottom: 0px;
    opacity: 0.8;
    height: 172px;
    width: 100%;
`
const StartConvoPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 26px;
    height: 52px;
    margin-top:10px;
    flex-direction: row;
    justify-content: center;
    width: 80%;
`
const AddReelayPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 26px;
    height: 52px;
    margin-top:10px;
    flex-direction: row;
    justify-content: center;
    width: 80%;
`
const ShareTopicPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 26px;
    height: 52px;
    margin-top:10px;
    flex-direction: row;
    justify-content: center;
    width: 80%;
`
const StartConvoText = styled(ReelayText.Overline)`
    color: white;
    margin-left: 8px;
`
const TopicCenterView = styled(View)`
    align-items: center;
`
const TopicGradient = styled(LinearGradient)`
    height: ${height}px;
    position: absolute;
    width: 100%;
`
const TopicIconView = styled(View)`
    padding: 10px;
`
const TopicTitleText = styled(ReelayText.Body2Bold)`
    color: white;
    font-size: 22px;
    line-height: 32px;
    text-align: center;
`
const TopicTitleView = styled(View)`
    margin-top: 50px;
    margin-bottom: 50px;
    width: 60%;
`
const TopicView = styled(View)`
    background-color: #121212;
    justify-content: center;
    height: ${height}px;
    width: 100%;
`

const HustleImage = styled(Image)`
    height: 185px;
    width: 130px;
    border-radius:10px;
    `

const ThumbnailImage = styled(canUseFastImage ? FastImage : Image)`
        border-radius:12px;
		height: ${240}px;
	`
const WelcomeText = styled(ReelayText.H5Bold)`
    font-size: 18px;
    margin-left: 2px;
    line-height: 20px;
    color: white;
`
const WelcomeText2 = styled(ReelayText.H5Bold)`
font-size: 14px;
margin-left: 2px;
line-height: 20px;
color: white;
`
const LearnText = styled(ReelayText.H5Bold)`
		font-size: 12px;
		margin-left: 2px;
        line-height: 16px;
		color: white;
	`
const LearnText2 = styled(ReelayText.Subtitle1)`
		font-size: 12px;
		margin-left: 2px;
        line-height: 16px;
        margin-top:10px;
		color: white;
	`

    const ADVERTIS1 = require("../../assets/images/advertise/adv1.jpeg");
    const ADVERTIS2 = require("../../assets/images/advertise/adv2.jpeg");
    const ADVERTIS3 = require("../../assets/images/advertise/adv3.jpeg");

export default EmptyDiscover = ({ navigation, topic }) => {

    const NewAdv = [{key:1, image:ADVERTIS1, url:"https://www.disneyplus.com/"}, {key:2, image:ADVERTIS2, url:"https://www.peacocktv.com/"}, {key:3, image:ADVERTIS3, url:"https://www.max.com/"}, ]

    const Advertise1 = [
        {
            "key": 1,
            "title": "Mission: Impossible - Dead Reckoning Part One",
            "tmdbId": 575264,
            "release_date": 2023,
            "poster_path": "http://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
            "genress": "Action, Adventure, Thriller, Science Fiction",
            "overview": "Ethan Hunt and his IMF team embark on their most dangerous mission yet: To track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands. With control of the future and the world's fate at stake and dark forces from Ethan's past closing in, a deadly race around the globe begins. Confronted by a mysterious, all-powerful enemy, Ethan must consider that nothing can matter more than his mission—not even the lives of those he cares about most.",
            "director": {
                "adult": false,
                "credit_id": "5c3d2a630e0a2655c48e51e4",
                "department": "Directing",
                "gender": 2,
                "id": 9033,
                "job": "Director",
                "known_for_department": "Writing",
                "name": "Christopher McQuarrie",
                "original_name": "Christopher McQuarrie",
                "popularity": 20.381,
                "profile_path": "/82W339V8turXUdaCajqOyekxhmD.jpg",
            },
            "display": "Mission: Impossible - Dead Reckoning Part One",
            "displayActors": [
                {
                    "adult": false,
                    "cast_id": 4,
                    "character": "Ethan Hunt",
                    "credit_id": "5c3d2ae892514156e5ac7c11",
                    "gender": 2,
                    "id": 500,
                    "known_for_department": "Acting",
                    "name": "Tom Cruise",
                    "order": 0,
                    "original_name": "Tom Cruise",
                    "popularity": 95.223,
                    "profile_path": "/8qBylBsQf4llkGrWR3qAsOtOU8O.jpg",
                },
                {
                    "adult": false,
                    "cast_id": 7,
                    "character": "Grace",
                    "credit_id": "5d7306183a4a120011d15a14",
                    "gender": 1,
                    "id": 39459,
                    "known_for_department": "Acting",
                    "name": "Hayley Atwell",
                    "order": 1,
                    "original_name": "Hayley Atwell",
                    "popularity": 178.111,
                    "profile_path": "/jm5pDDjsbgizhxSd7baDxbGYMtW.jpg",
                },
            ],
            "id": 575264,
            "isSeries": false,
            "overview": "Ethan Hunt and his IMF team embark on their most dangerous mission yet: To track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands. With control of the future and the world's fate at stake and dark forces from Ethan's past closing in, a deadly race around the globe begins. Confronted by a mysterious, all-powerful enemy, Ethan must consider that nothing can matter more than his mission—not even the lives of those he cares about most.",
            "posterPath": "/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
            "posterSource": {
                "uri": "http://image.tmdb.org/t/p/w185/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
            },
            "rating": null,
            "releaseDate": "2023-07-08",
            "releaseYear": "2023",
            "runtime": 0,
            "titleKey": "film-575264",
            "titleType": "film",
            "trailerURI": "HurjfO_TDlQ",
        },
        {
            "key": 2,
            "title": "Indiana Jones and the Dial of Destiny",
            "tmdbId": 335977,
            "release_date": 2023,
            "poster_path": "http://image.tmdb.org/t/p/w500/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg",
            "genress": "Adventure, Action, Fantasy",
            "overview": "Finding himself in a new era, and approaching retirement, Indy wrestles with fitting into a world that seems to have outgrown him. But as the tentacles of an all-too-familiar evil return in the form of an old rival, Indy must don his hat and pick up his whip once more to make sure an ancient and powerful artifact doesn't fall into the wrong hands.",
            "director": {
                "adult": false,
                "credit_id": "5e574108a6d93100145c82c6",
                "department": "Directing",
                "gender": 2,
                "id": 366,
                "job": "Director",
                "known_for_department": "Directing",
                "name": "James Mangold",
                "original_name": "James Mangold",
                "popularity": 24.589,
                "profile_path": "/pk0GDjn99crNwR4qgCCEokDYd71.jpg",
            },
            "display": "Indiana Jones and the Dial of Destiny",
            "displayActors": [
                {
                    "adult": false,
                    "cast_id": 0,
                    "character": "Indiana Jones",
                    "credit_id": "56e8490ec3a368408f003646",
                    "gender": 2,
                    "id": 3,
                    "known_for_department": "Acting",
                    "name": "Harrison Ford",
                    "order": 0,
                    "original_name": "Harrison Ford",
                    "popularity": 53.106,
                    "profile_path": "/ActhM39LTxgx3tnJv3s5nM6hGD1.jpg",
                },
                {
                    "adult": false,
                    "cast_id": 19,
                    "character": "Helena Shaw",
                    "credit_id": "60707c53924ce5003f3416e0",
                    "gender": 1,
                    "id": 1023483,
                    "known_for_department": "Acting",
                    "name": "Phoebe Waller-Bridge",
                    "order": 1,
                    "original_name": "Phoebe Waller-Bridge",
                    "popularity": 37.206,
                    "profile_path": "/bkDzGCyE84JpUniL2LP8UKxXGV1.jpg",
                },
            ],
            "id": 335977,
            "isSeries": false,
            "overview": "Finding himself in a new era, approaching retirement, Indy wrestles with fitting into a world that seems to have outgrown him. But as the tentacles of an all-too-familiar evil return in the form of an old rival, Indy must don his hat and pick up his whip once more to make sure an ancient and powerful artifact doesn't fall into the wrong hands.",
            "posterPath": "/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg",
            "posterSource": {
                "uri": "http://image.tmdb.org/t/p/w185/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg",
            },
            "rating": "PG-13",
            "releaseDate": "2023-06-28",
            "releaseYear": "2023",
            "runtime": 155,
            "tagline": "A legend will face his destiny.",
            "titleKey": "film-335977",
            "titleType": "film",
            "trailerURI": "eQfMbSe7F2g",
        },
        {
            "key": 3,
            "title": "Oppenheimer",
            "tmdbId": 872585,
            "release_date": 2023,
            "poster_path": "http://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            "genress": "Drama, History",
            "overview": "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
            "director": {
                "adult": false,
                "credit_id": "613a93cbd38b58005f6a1964",
                "department": "Directing",
                "gender": 2,
                "id": 525,
                "job": "Director",
                "known_for_department": "Directing",
                "name": "Christopher Nolan",
                "original_name": "Christopher Nolan",
                "popularity": 34.803,
                "profile_path": "/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg",
            },
            "display": "Oppenheimer",
            "displayActors": [
                {
                    "adult": false,
                    "cast_id": 3,
                    "character": "J. Robert Oppenheimer",
                    "credit_id": "613a940d9653f60043e380df",
                    "gender": 2,
                    "id": 2037,
                    "known_for_department": "Acting",
                    "name": "Cillian Murphy",
                    "order": 0,
                    "original_name": "Cillian Murphy",
                    "popularity": 127.948,
                    "profile_path": "/dm6V24NjjvjMiCtbMkc8Y2WPm2e.jpg",
                },
                {
                    "adult": false,
                    "cast_id": 161,
                    "character": "Katherine 'Kitty' Oppenheimer",
                    "credit_id": "6328c918524978007e9f1a7f",
                    "gender": 1,
                    "id": 5081,
                    "known_for_department": "Acting",
                    "name": "Emily Blunt",
                    "order": 1,
                    "original_name": "Emily Blunt",
                    "popularity": 70.774,
                    "profile_path": "/2mfJILwVGr4RBha3OihQVfq5nyL.jpg",
                },
            ],
            "id": 872585,
            "isSeries": false,
            "overview": "The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.",
            "posterPath": "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            "posterSource": {
                "uri": "http://image.tmdb.org/t/p/w185/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            },
            "rating": null,
            "releaseDate": "2023-07-19",
            "releaseYear": "2023",
            "runtime": 0,
            "titleKey": "film-872585",
            "titleType": "film",
            "trailerURI": "sOsIKu2VAkM",
        },
    ]
    const Advertise2 = [
        {
            "key": 1,
            "title": "Barbie",
            "tmdbId": 346698,
            "release_date": 2023,
            "poster_path": "http://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
            "genress": "Comedy, Adventure, Fantasy",
            "overview": "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
            "director": {
                "adult": false,
                "credit_id": "5f87d5b52385130036355b3a",
                "department": "Directing",
                "gender": 1,
                "id": 45400,
                "job": "Director",
                "known_for_department": "Acting",
                "name": "Greta Gerwig",
                "original_name": "Greta Gerwig",
                "popularity": 46.078,
                "profile_path": "/nHrWXL1VFaV4a3wRNlhp5NfO98m.jpg",
            },
            "display": "Barbie",
            "displayActors": [
                {
                    "adult": false,
                    "cast_id": 58,
                    "character": "Barbie",
                    "credit_id": "5f88a9d28258fc0036ad14ff",
                    "gender": 1,
                    "id": 234352,
                    "known_for_department": "Acting",
                    "name": "Margot Robbie",
                    "order": 0,
                    "original_name": "Margot Robbie",
                    "popularity": 97.413,
                    "profile_path": "/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg",
                },
                {
                    "adult": false,
                    "cast_id": 59,
                    "character": "Ken",
                    "credit_id": "61732049a217c000434083ec",
                    "gender": 2,
                    "id": 30614,
                    "known_for_department": "Acting",
                    "name": "Ryan Gosling",
                    "order": 1,
                    "original_name": "Ryan Gosling",
                    "popularity": 109.753,
                    "profile_path": "/lyUyVARQKhGxaxy0FbPJCQRpiaW.jpg",
                },
            ],
            "id": 346698,
            "isSeries": false,
            "overview": "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
            "posterPath": "/cgYg04miVQUAG2FKk3amSnnHzOp.jpg",
            "posterSource": {
                "uri": "http://image.tmdb.org/t/p/w185/cgYg04miVQUAG2FKk3amSnnHzOp.jpg",
            },
            "rating": null,
            "releaseDate": "2023-07-19",
            "releaseYear": "2023",
            "runtime": 0,
            "titleKey": "film-346698",
            "titleType": "film",
            "trailerURI": "Y1IgAEejvqM",
        },
        {
            "key": 2,
            "title": "Napoleon",
            "tmdbId": 753342,
            "release_date": 2023,
            "poster_path": "http://image.tmdb.org/t/p/w500/icQpWcVhwHvCRrT53BjDzbYJhJm.jpg",
            "genress": "Drama, History, Action",
            "overview": "A personal look at the French military leader’s origins and swift, ruthless climb to emperor, viewed through the prism of Napoleon’s addictive, volatile relationship with his wife and one true love, Josephine.",
            "director": {
                "adult": false,
                "credit_id": "5f87352ba1c59d00371171c6",
                "department": "Directing",
                "gender": 2,
                "id": 578,
                "job": "Director",
                "known_for_department": "Directing",
                "name": "Ridley Scott",
                "original_name": "Ridley Scott",
                "popularity": 11.881,
                "profile_path": "/zABJmN9opmqD4orWl3KSdCaSo7Q.jpg",
            },
            "display": "Napoleon",
            "displayActors": [
                {
                    "adult": false,
                    "cast_id": 1,
                    "character": "Napoleon Bonaparte",
                    "credit_id": "5f8734f6d4b9d9003726f177",
                    "gender": 2,
                    "id": 73421,
                    "known_for_department": "Acting",
                    "name": "Joaquin Phoenix",
                    "order": 0,
                    "original_name": "Joaquin Phoenix",
                    "popularity": 22.698,
                    "profile_path": "/oe0ydnDvQJCTbAb2r5E1asVXoCP.jpg",
                },
                {
                    "adult": false,
                    "cast_id": 9,
                    "character": "Empress Josephine",
                    "credit_id": "61d4df3cd48cee001ceca299",
                    "gender": 1,
                    "id": 556356,
                    "known_for_department": "Acting",
                    "name": "Vanessa Kirby",
                    "order": 1,
                    "original_name": "Vanessa Kirby",
                    "popularity": 264.259,
                    "profile_path": "/5fbvIkZ02RdcXfZHUUk4cQ9kILK.jpg",
                },
            ],
            "id": 753342,
            "isSeries": false,
            "overview": "A personal look at the French military leader’s origins and swift, ruthless climb to emperor, viewed through the prism of Napoleon’s addictive, volatile relationship with his wife and one true love, Josephine.",
            "posterPath": "/ofXToitZCjAPgadlbQDWM0Uaxa8.jpg",
            "posterSource": {
                "uri": "http://image.tmdb.org/t/p/w185/ofXToitZCjAPgadlbQDWM0Uaxa8.jpg",
            },
            "rating": "R",
            "releaseDate": "2023-11-22",
            "releaseYear": "2023",
            "runtime": 158,
            "tagline": "He came from nothing. He conquered everything.",
            "titleKey": "film-753342",
            "titleType": "film",
            "trailerURI": "CBmWztLPp9c",
        },
    ]
    const StartConvoButton = () => {
        const advanceToCreateReelay = () => navigation.push('SelectTitleScreen', { clubID: topic?.clubID, topic });
        return (
            <StartConvoPressable onPress={advanceToCreateReelay}>
                <FontAwesomeIcon icon={faVideo} color='white' size={20} />
                <StartConvoText>{'Create a Reelay'}</StartConvoText>
            </StartConvoPressable>
        );
    }
    const AddReelayButton = () => {
        const advanceToADDReelay = () => navigation.push('ReelayListScreen', { clubID: topic?.clubID, topic });
        return (
            <AddReelayPressable onPress={advanceToADDReelay}>
                <FontAwesomeIcon icon={faAdd} color='white' size={20} />
                <StartConvoText>{'Add Reelay to topic'}</StartConvoText>
            </AddReelayPressable>
        );
    }

    const ShareTopicButton = () => {
        const shareTheTopic = () => Alert.alert("","Linking to share");
        return (
            // <ShareTopicPressable onPress={shareTheTopic}>
            //     <FontAwesomeIcon icon={faShare} color='white' size={20} />
            //     <StartConvoText>{'Share the Topic'}</StartConvoText>
            // </ShareTopicPressable>
            <ShareOutTopicButton navigation={navigation} topic={topic} type={2}/>
        );
    }

    const TopicIcon = () => {
        return (
            <TopicIconView>
                <TopicsGiantIconSVG />
            </TopicIconView>
        );
    }

    const TopicTitle = () => {
        return (
            <TopicTitleView>
                <TopicTitleText>{topic?.title}</TopicTitleText>
            </TopicTitleView>
        );
    }

    return (
        <TopicView>
            {/* <TopicGradient colors={[ReelayColors.reelayPurple, '#865EE500']} />
            <TopicCenterView>
                <TopicIcon />
                <TopicTitle />
                <ShareTopicButton />
                <AddReelayButton />
                <StartConvoButton />
            </TopicCenterView>
            <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
            <ReelayInfo navigation={navigation} reelay={topic} /> */}
         <TopicGradient colors={[ReelayColors.reelayPurple, '#865EE500']} />
         <TopicCenterView>
            {topic?.valIndex == 0 ?
     <Carousel
        activeSlideAlignment={'center'}
        data={NewAdv} //Advertise1}
        loop={true}
        // activeIndex={2}
        inactiveSlideScale={0.95}
        //  itemHeight={452}
        itemWidth={width}
        itemHeight={height}
        renderItem={({ item, index }) =>

            <Pressable onPress={() =>Linking.openURL(item.url)} //onPress={() => navigation.push('TitleDetailScreen', { titleObj: item })}>
            >
            <ImageBackground
            // source={{ uri: item.poster_path }}    
            source={item.image}
            resizeMode='stretch'
            style={{
                    backgroundColor: item.key == 1 || item.key == 3 ? "#4388F1" : "#1EC072",
                    overflow:"hidden",
                    borderRadius: 10, margin: 10,height:250,justifyContent:"flex-end",
                }}>
                {/* <View style={{  }}>
                    <View style={{ justifyContent: "center", alignSelf: "center" }}>
                        <HustleImage resizeMode='contain' source={{ uri: item.poster_path }} />
                    </View>
                </View> */}
                {/* <View style={{paddingTop: 10, padding: 10, marginLeft: 10 }}>
                    <WelcomeText numberOfLines={2}>{item.title}</WelcomeText>
                    <WelcomeText2>{item.release_date}</WelcomeText2>
                    <LearnText numberOfLines={2}>{item.genres}</LearnText>
                    <LearnText2 numberOfLines={4}>{item.overview}</LearnText2>
                </View> */}
                {/* <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} /> */}
                </ImageBackground>
                
            </Pressable>
        }
        sliderHeight={height}
        sliderWidth={width}
    />

    :
    <Carousel
        activeSlideAlignment={'center'}
        data={Advertise2}
        loop={true}
        inactiveSlideScale={0.95}
        //  itemHeight={452}
        itemWidth={width}
        itemHeight={height}
        renderItem={({ item, index }) =>
            <Pressable onPress={() => navigation.push('TitleDetailScreen', { titleObj: item })} >
            <ImageBackground
            source={{ uri: item.poster_path }}
            
            style={{ backgroundColor: item.key == 2 ? "#4388F1" : "#1EC072",height:height/2, borderRadius: 10
            ,overflow:"hidden", margin: 10,justifyContent:"flex-end"}}>
                
                <View style={{ paddingTop: 10, padding: 10, marginLeft: 10 }}>
                    <WelcomeText numberOfLines={2}>{item.title}</WelcomeText>
                    <WelcomeText2>{item.release_date}</WelcomeText2>
                    <LearnText numberOfLines={2}>{item.genress}</LearnText>
                    <LearnText2 numberOfLines={4}>{item.overview}</LearnText2>
                </View>
                <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
                </ImageBackground>
                </Pressable>
                }
        sliderHeight={height}
        sliderWidth={width}
    />}
                </TopicCenterView>
        </TopicView>
    )
}