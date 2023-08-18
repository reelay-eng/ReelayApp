import React, { useContext, useEffect, useState, useRef, Fragment } from "react";
import { ActivityIndicator, Dimensions, SafeAreaView,Image, TouchableOpacity,Text, View, ImageBackground, ViewBase, Share } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as Clipboard from 'expo-clipboard';

// Components
import { HeaderWithBackButton } from '../../components/global/Headers'
import SearchField from "../../components/create-reelay/SearchField";
import TitleSearchResults from "../../components/search/TitleSearchResults";
import UserSearchResults from "../../components/search/UserSearchResults";
import { ToggleSelector } from '../../components/global/Buttons';
import ClubSearchResults from "../../components/search/ClubSearchResults";
import SuggestedTitlesGrid from "../../components/search/SuggestedTitlesGrid";
import InstaStoryBackground from '../../assets/icons/reelay-icon-with-dog-black.png';

// Context
import { AuthContext } from "../../context/AuthContext";

// Logging
import { logAmplitudeEventProd } from "../../components/utils/EventLogger";

// API
import { searchTitles, searchUsers } from "../../api/ReelayDBApi";
import { searchPublicClubs } from "../../api/ClubsApi";
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';

// Styling
import styled from "styled-components/native";
import { useFocusEffect } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import { showMessageToast } from "../../components/utils/toasts";

const { width } = Dimensions.get('window');

const SearchScreenView = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const SelectorBarView = styled(View)`
    height: 40px;
    width: ${width - 24}px;
`
const TextMiddle = styled(Text)`
    align-items: center;
    justify-content: center;
    padding-left: 2px;
    padding-right: 2px;
    width: 100%;
`
const MiddleView = styled(View)`
    align-items: center;
    margin: 12px;
    height:83%;
    border-radius:20px;
    justify-content:center;
    
`
const MyReferShareView = styled(View)`
    align-items: center;
    border-radius: 30px;
    position:absolute;
    justify-content: center;
    margin: 16px;
    bottom:0;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width - 52}px;
`
const MyWatchlistPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 30px;
    height: 50px;
    justify-content: center;
    margin: 16px;
    bottom:0;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width - 52}px;
`
const ReferText = styled(Text)`
	color: white;
	font-size: 48px;
    font-family:Outfit-Bold;
	font-style: normal;
	text-align: center;
    margin-bottom:0px;
`
const ReferName = styled(Text)`
color: white;
font-size: 24px;
font-family:Outfit-Bold;
font-style: normal;
text-align: center;
align-self:center;
margin-right:2px
`

const RefeNameView = styled(TouchableOpacity)`
flex-direction:row;
align-items:center;
margin-bottom:10px;
justify-content:center;

`

const MyWatchlistText = styled(ReelayText.Overline)`
    color: white;
    font-size:14px;
`
const StoryBackplateImage = styled(ImageBackground)`
    height: 100%;
    width: 100%;
`
export default ReferShareScreen = ({ navigation, route }) => {

    const goBack = () => {
            navigation.goBack();
    }

    return (
		<SearchScreenView>
			<HeaderWithBackButton 
                onPressOverride={goBack}
                navigation={navigation} 
                text={'refer & share'} 
            />
            <SearchBarWithResults navigation={navigation}/>
		</SearchScreenView>
	);
};

const SearchBarWithResults = ({ navigation }) => {
    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    
    // useEffect(() => {
    //     logAmplitudeEventProd('openSearchScreen', {
    //         username: reelayDBUser?.username,
    //         userSub: reelayDBUser?.sub,
    //         source: 'search',
    //     });
    // }, [navigation]);


    const TopBar = () => {
        const copyLink = () => {
            Clipboard.setStringAsync(reelayDBUser.referralcode).then(onfulfilled => {
                showMessageToast('referral code copied to clipboard');
            });
        }

        const shareGame = async () => {
            const title = `Reelay referral`;
            const message = 
            `Hey there! I'm using Reelay to discover movies and decide which one is right for tonight. Join me by clicking here; https://apps.apple.com/us/app/reelay-saving-movie-night/id1578117492 and don't forget to enter the referral code "${reelayDBUser.referralcode}"`
            const content = { title, message };
            const options = {};
            const sharedAction = await Share.share(content, options);
        }

        return (
            <MiddleView>

                    <Image
                    style={{height:150,width:150,marginTop:-100}}
                    source={require('../../assets/icons/reelay-icon-with-dog-black.png')}
                    />
                <ReferText>Reelay is better with Friends</ReferText>
                <MyReferShareView>
                    <RefeNameView onPress={copyLink}>
                    <ReferName>{reelayDBUser?.referralcode}</ReferName>
                        <Icon type='ionicon' name='copy' size={20} style={{alignSelf:"center",}} color={'white'} />
                    </RefeNameView>
                <MyWatchlistPressable onPress={shareGame}>
                    <MyWatchlistText>{'Share My Code'}</MyWatchlistText>
                </MyWatchlistPressable>
                </MyReferShareView>
               
            </MiddleView>
        );
    }

    return (
        <React.Fragment>
            <TopBar/>
            { loading && <ActivityIndicator /> }
        </React.Fragment>
    )
}
