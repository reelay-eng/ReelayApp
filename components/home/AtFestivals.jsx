import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import ReelayThumbnail from '../global/ReelayThumbnail';
import { VenueIcon } from '../utils/VenueIcon';
import FestivalsPrompt from './FestivalsPrompt';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default AtFestivals = ({ navigation }) => {
    const FriendsAreWatchingContainer = styled.View`
        width: 100%;
        height: auto;
        display: flex;
        flex-direction: column;
    `
    const { reelayDBUser } = useContext(AuthContext);
    const { settingsShowFilmFestivals } = reelayDBUser;
    const [showFestivalsPrompt, setShowFestivalsPrompt] = useState(false);
    const [showFestivalsRow, setShowFestivalsRow] = useState(settingsShowFilmFestivals);

    const checkShowFestivalsPrompt = async () => {
        const hasSetPreference = await AsyncStorage.getItem('hasSetFestivalPreference');
        if (!hasSetPreference) setShowFestivalsPrompt(true);
    }

    useEffect(() => {
        checkShowFestivalsPrompt();
    }, [showFestivalsPrompt]);
    
    return (
        <FriendsAreWatchingContainer>
            { showFestivalsPrompt && <FestivalsPrompt 
                navigation={navigation} 
                setShowFestivalsPrompt={setShowFestivalsPrompt} 
                setShowFestivalsRow={setShowFestivalsRow} 
            /> }
            { showFestivalsRow && <FestivalReelaysRow 
                navigation={navigation} 
            /> }
        </FriendsAreWatchingContainer>   
    );
}

const FestivalReelaysRow = ({ navigation }) => {
    const HeaderContainer = styled(View)`
        align-items: flex-end;
        flex-direction: row;
        margin-left: 15px;
        margin-top: 15px;
    `
    const HeaderText = styled(ReelayText.H5Bold)`
        color: white;
        font-size: 18px
        margin-left: 12px;
    `
    const FollowingRowContainer = styled.ScrollView`
        display: flex;
        padding-left: 15px;
        padding-top: 15px;
        flex-direction: row;
        width: 100%;
        padding-top: 16px;
    `
    const { myStacksAtFestivals } = useContext(AuthContext);
    return (
        <Fragment>
            <HeaderContainer>
                <Icon type='font-awesome' name='pagelines' size={24} color='white' />
                <HeaderText>{'At festivals'}</HeaderText>
            </HeaderContainer>
            <FollowingRowContainer horizontal>
                { myStacksAtFestivals.map((stack, index) =>  {
                    return (
                        <FollowingElement
                            key={index}
                            index={index}
                            navigation={navigation}
                            stack={stack}
                    />);
                })}
            </FollowingRowContainer>
        </Fragment>
    );
}

const FollowingElementContainer = styled(Pressable)`
    display: flex;
    width: 120px;
    margin-right: 12px;
`
const TitleInfoLine = styled(View)`
    flex-direction: row;
    justify-content: space-between;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    font-size: 16px;
    margin-top: 10px;
    color: white;
    opacity: 1;
`
const TitleVenue = styled(View)`
    position: absolute;
    top: 4px;
    right: 4px;
`
const TitleYear = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`

const FollowingElement = ({ stack, index, navigation }) => {
    const goToReelay = (index, titleObj) => {
		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'festivals',
            isOnFeedTab: false
		});
		logAmplitudeEventProd('openFollowingFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};

    const { reelayDBUser } = useContext(AuthContext);
    const onPress = () => goToReelay(index, stack[0].title);
    const fullTitle = stack[0].title.display;
    const displayTitle = (fullTitle?.length > 26) 
        ? fullTitle.substring(0, 23) + "..."
        : fullTitle;

    return (
        <FollowingElementContainer>
            <ReelayThumbnail 
                height={180} 
                margin={0}
                onPress={onPress} 
                reelay={stack[0]} 
                width={120} 
            />
            <TitleText>{displayTitle}</TitleText>
            <TitleVenue>
                <VenueIcon venue={stack[0]?.content?.venue} size={24} />
            </TitleVenue>
        </FollowingElementContainer>
    )
}