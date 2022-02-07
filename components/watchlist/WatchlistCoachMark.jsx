import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, View } from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ReelayText from '../global/Text';
import moment from 'moment';
import styled from 'styled-components/native';

const ReelayIcon = require('../../assets/icons/reelay-icon.png');

const CoachMarkContainer = styled(View)`
    background-color: white;
    border-radius: 8px;
    flex-direction: row;
    margin: 10px;
    margin-top: 20px;
    padding: 12px;
    width: 90%;
`
const CoachMarkPicContainer = styled(View)`
    align-items: center;
    justify-content: center;
`
const CoachMarkMessageContainer = styled(View)`
    align-items: flex-start;
    justify-content: center;
    flex: 1;
    margin-left: 10px;
    padding: 8px;
`
const CoachMarkCloseContainer = styled(Pressable)`
    align-items: center;
    justify-content: center;
`

export default WatchlistCoachMark = ({ category, navigation }) => {
    const [showCoachMark, setShowCoachMark] = useState(false);
    const hasSeenCoachMarkKey = `lastSeenCoachMark-${category}`;

    useEffect(() => {
        checkIfSeenCoachMark();
    }, [navigation]);


    const checkIfSeenCoachMark = async () => {
        const clearResult = await clearCoachMark();
        const hasSeenCoachMark = await AsyncStorage.getItem(hasSeenCoachMarkKey);
        if (!hasSeenCoachMark) setShowCoachMark(true);
    }

    const closeCoachMark = async () => {
        setShowCoachMark(false);
        const putResult = await AsyncStorage.setItem(hasSeenCoachMarkKey, moment().toISOString());
    }
    
    const clearCoachMark = async () => {
        const putResult = await AsyncStorage.removeItem(hasSeenCoachMarkKey);
    }
    
    const renderCoachMark = () => {
        const coachMessages = {
            'Recs': {
                title: `Here is where you'll get recs`,
                body: `People you follow can send you recs. When you send a rec, it ends up here. Swipe to accept or ignore.`,
            },
            'My List': {
                title: `Here is your watchlist`,
                body: `Swipe on titles to mark seen, create reelays, and remove.`,
            },
            'Seen': {
                title: `Here is your seen list`,
                body: `Titles you reelay will appear here. Swipe to send recs, create reelays, and hide. `,
            }
        }

        const titleText = coachMessages[category]?.title;
        const bodyText = coachMessages[category]?.body;

        console.log('rendering coach mark: ', category);
    
        return (
            <CoachMarkContainer>
                <CoachMarkPicContainer>
                    <Image source={ReelayIcon} style={{ height: 54, width: 54, borderRadius: 12 }} />
                </CoachMarkPicContainer>
                <CoachMarkMessageContainer>
                    <ReelayText.Subtitle1Emphasized>
                        {titleText}
                    </ReelayText.Subtitle1Emphasized>
                    <ReelayText.Body2 key={bodyText} style={{ paddingBottom: 4 }}>
                        {bodyText}
                    </ReelayText.Body2>    
                </CoachMarkMessageContainer>
                <CoachMarkCloseContainer onPress={closeCoachMark}>
                    <Icon type='ionicon' name='close-circle' color='black' size={24} />
                </CoachMarkCloseContainer>
            </CoachMarkContainer>
        );
    }

    return (
        <React.Fragment>
            { showCoachMark && renderCoachMark() }
        </React.Fragment>
    );

};
