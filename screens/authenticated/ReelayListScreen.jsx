import React, { useContext, useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Pressable, Text, ActivityIndicator,Image, TouchableOpacity, Dimensions } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from "react-redux";
import { Icon } from 'react-native-elements';

import { HeaderWithBackButton } from '../../components/global/Headers';
import * as ReelayText from '../../components/global/Text';
import SearchField from '../../components/create-reelay/SearchField';
import TitleSearchResults from '../../components/search/TitleSearchResults';
import { ToggleSelector } from '../../components/global/Buttons';

import styled from 'styled-components/native';
import { getReelsByCreator, getStacksByCreator, searchTitles } from '../../api/ReelayDBApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';
import { useFocusEffect } from '@react-navigation/native';
import SuggestedTitlesGrid from '../../components/search/SuggestedTitlesGrid';
import { TopicsBannerIconSVG } from '../../components/global/SVGs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyTitleObject } from '../../api/TMDbApi';
import * as Haptics from 'expo-haptics';
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import { FlatList } from 'react-native-gesture-handler';
import { Video } from 'expo-av'
import ReelayColors from '../../constants/ReelayColors';
import BackButton from '../../components/utils/BackButton';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { showErrorToast } from '../../components/utils/toasts';
import { editReelstoTopic, getTopics } from '../../api/TopicsApi';

const { height, width } = Dimensions.get('window');

const TopBarView = styled(View)`
    align-items: center;
    background-color: black;
    flex-direction: row;
    justify-content: space-between;
    position: absolute;
    padding-top: ${props => props.topOffset}px;
    padding-bottom: 6px;
    shadow-offset: 0px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 100%;
    z-index: 100;
`
const BackButtonView = styled(View)`
    margin-bottom: -4px;
    margin-left: 2px;
`
const AddToWatchlistPressable = styled(TouchableOpacity)`
    margin-right: 12px;;
`
const AddToWatchlistText = styled(ReelayText.Body2Bold)`
    color: ${ReelayColors.reelayBlue};
    font-size: 16px;
`
const RecTitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    padding: 10px;
    text-shadow-color: rgba(0, 0, 0, 0.4);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const ReelaylistScreenContainer = styled(View)`
    background-color: black;
    height: ${height}px;
    width: 100%;
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
const StartConvoText = styled(ReelayText.Overline)`
    color: white;
    margin-left: 8px;
`
export default SelectTitleScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const clubID = route?.params?.clubID;
    const topic = route?.params?.topic;
    const updateCounter = useRef(0);
    const [markedSeen, setMarkedSeen] = useState(false);
    const topOffset = useSafeAreaInsets().top;
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
	const dispatch = useDispatch();
    const myReelayStacks = useSelector(state => state.myReelayStacks);
    const [select, setSelect] = useState([]);
    // useEffect(()=>{
        
    // },[])
    

    const renderReelaylistItem = ({ item }) => {
        const onselect = (item) =>{
            setMarkedSeen(!markedSeen)
            let abc = select.filter((element) => element.sub == item.sub)
            if(abc.length != 0){
                let pop = select.filter((element) => element.sub !== item.sub)
                setSelect(pop)
            }else{
                let sub = { sub : item.sub}
                setSelect([...select,sub])
            }
        }
        let mark = select.find(ites => ites.sub == item.sub );
        return (
            <TouchableOpacity onPress={()=>onselect(item)} style={{height:200,width:width*0.33,borderRadius:10,overflow:"hidden",padding:7,}}>
            <View style={{position:"absolute",right:10,zIndex:1,top:8}}>
            {mark ? <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayGreen} size={30} />:
            <Icon type='ionicon' name='ellipse-outline' color={'white'} size={30} />
            }
            </View>
            <Video
				isLooping={true}
				isMuted={true}
				progressUpdateIntervalMillis={50}
				rate={1.0}
				resizeMode='cover'
				shouldPlay={true}
				source={{ uri: item?.content?.videoURI }}
				style={{ height:"100%", width:"100%",borderRadius:10 }}
				useNativeControls={false}
				volume={1.0}
			/>
            </TouchableOpacity>
        );
    }
    
    const AddToReelaylistFromSearchButton = () => {
        const onPressAdd = async () => {
            if(select.length == 0){
                showErrorToast('Ruh roh! Add atleast one reelay');
                return;
            }
            setLoading(true)
            const editReelsTopic = await editReelstoTopic({ 
                reqUserSub: reelayDBUser?.sub, 
                reelays: select,
                topicID: topic.id
            });
            if(editReelsTopic && editReelsTopic.message == "Reelays added in Topic Successfully"){
                await refreshDiscoverTopics();
            }
            console.log("editReelsTopic",editReelsTopic)
        };
        const topOffset = useSafeAreaInsets().top + 8;
        return (
            <AddToWatchlistPressable onPress={onPressAdd} topOffset={topOffset}>
                 { loading ? <ActivityIndicator style={{}} color={"#fff"}/> 
                :<AddToWatchlistText>{'Add'}</AddToWatchlistText>}
            </AddToWatchlistPressable>
        );
    }
    const refreshDiscoverTopics = async () => {
        try {
            const topics = await getTopics({
                authSession,
                page: 0,
                reqUserSub: reelayDBUser?.sub,
                source: 'discover',
            });
            const payload = { discover: topics };
            dispatch({ type: 'setTopics', payload });
            setLoading(false)
            navigation.goBack();


            const nextMyCreatorStacks =  await getStacksByCreator(reelayDBUser?.sub)
            const nextMyReelayStacks = await getReelsByCreator(reelayDBUser?.sub)
            dispatch({ type: 'setMyCreatorStacks', payload: nextMyCreatorStacks });  
            dispatch({ type: 'setMyReelayStacks', payload: nextMyReelayStacks });  
                    
        } catch (error) {
            console.log(error);
        }
    }
    
    const TopBar = () => {
        return (
            <TopBarView topOffset={topOffset}>
                <BackButtonView>
                    <BackButton navigation={navigation} />
                </BackButtonView>
                <RecTitleText>{'Add Reels'}</RecTitleText>
                <AddToReelaylistFromSearchButton />
            </TopBarView>
        );
    }

    const AddReelayButton = () => {
        const advanceToADDReelay = () => navigation.push('SelectTitleScreen', { clubID: topic?.clubID, topic });
        return (
            <AddReelayPressable onPress={advanceToADDReelay}>
                <FontAwesomeIcon icon={faVideo} color='white' size={20} />
                <StartConvoText>{'Create a Reelay'}</StartConvoText>
            </AddReelayPressable>
        );
    }

    return (
		<ReelaylistScreenContainer topOffset={topOffset}>
			<TopBar/>
                {myReelayStacks && myReelayStacks.length !== 0 ? 
                <View style={{marginTop:topOffset+60}}>
                    <FlatList
                        data={myReelayStacks}
                        decelerationRate={2}
                        numColumns={3}
                        estimatedItemSize={100}
                        keyboardShouldPersistTaps="always"
                        keyExtractor={item => item.id}
                        style={{}}
                        renderItem={renderReelaylistItem}
                        // refreshControl={Refresher}
                        showsVerticalScrollIndicator={false}
                    />
                </View>:
                <View style={{marginTop:topOffset+60,width:"100%",flex:1,justifyContent:"center",alignItems:"center"}}>
                    <AddReelayButton/>
                </View>}
                {/* <Text style={{color:"#fff"}}>{myReelayStacks.length}</Text> */}
            </ReelaylistScreenContainer>
	);
};