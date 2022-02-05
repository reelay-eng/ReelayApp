import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, View } from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ReelayText from '../../components/global/Text';
import moment from 'moment';

//Components
import { BaseHeader } from '../../components/global/Headers'
import { ToggleSelector } from '../../components/global/Buttons';
import Watchlist from '../../components/watchlist/Watchlist';

// Context
import { AuthContext } from '../../context/AuthContext';

// Logging
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

// Styling
import styled from 'styled-components/native';

const ReelayIcon = require('../../assets/icons/reelay-icon.png');
const WatchlistAddedIcon = require('../../assets/icons/global/watchlist-added-icon.png');

const WatchlistScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const TopBarContainer = styled(View)`
    align-items: center;
    width: 100%;
`
const SelectorBarContainer = styled(View)`
    width: 90%;
`
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

export default WatchlistScreen = ({ navigation, category='My List' }) => {
    const { cognitoUser, myWatchlistItems } = useContext(AuthContext);
    const [selectedCategory, setSelectedCategory] = useState(category);
    const [showCoachMark, setShowCoachMark] = useState(false);

    useEffect(() => {
        logAmplitudeEventProd('openMyWatchlist', {
            username: cognitoUser.username,
            userSub: cognitoUser?.attributes?.sub,
        });
    }, [navigation]);

    useEffect(() => {
        checkIfSeenCoachMark();
    }, [navigation]);

    const categoryWatchlistItems = myWatchlistItems.filter((nextItem) => {
        const { hasAcceptedRec, hasSeenTitle } = nextItem;
        if (selectedCategory === 'My List') {
            return hasAcceptedRec && !hasSeenTitle;
        } else if (selectedCategory === 'Seen') {
            return hasSeenTitle;
        } else if (selectedCategory === 'Recs') {
            return !hasAcceptedRec && !hasSeenTitle;
        }
    });

    const renderCoachMark = () => {
        const titleText = `Welcome to your watchlist`;
        const bodyText = `Swipe right on titles to mark seen and recommend. Swipe left to remove.`

        return (
            <CoachMarkContainer>
                <CoachMarkPicContainer>
                    <Image source={ReelayIcon} style={{ height: 54, width: 54, borderRadius: 12 }} />
                </CoachMarkPicContainer>
                <CoachMarkMessageContainer>
                    <ReelayText.Subtitle1Emphasized>
                        {titleText}
                    </ReelayText.Subtitle1Emphasized>
                    <ReelayText.Body2>
                        {bodyText}
                    </ReelayText.Body2>
                </CoachMarkMessageContainer>
                <CoachMarkCloseContainer onPress={closeCoachMark}>
                    <Icon type='ionicon' name='close-circle' color='black' size={24} />
                </CoachMarkCloseContainer>
            </CoachMarkContainer>
        );
    }

    const checkIfSeenCoachMark = async () => {
        const clearResult = await clearCoachMark();
        const hasSeenCoachMark = await AsyncStorage.getItem('lastSeenWatchlistCoachMark');
        if (!hasSeenCoachMark) setShowCoachMark(true);
    }

    const closeCoachMark = async () => {
        setShowCoachMark(false);
        const putResult = await AsyncStorage.setItem('lastSeenWatchlistCoachMark', moment().toISOString());
    }
    
    const clearCoachMark = async () => {
        const putResult = await AsyncStorage.removeItem('lastSeenWatchlistCoachMark');
    }

    const onSelectCategory = (category) => {
        setSelectedCategory(category);
        logAmplitudeEventProd('setWatchlistCategory', {
            category: category,
            username: cognitoUser.username,
            userSub: cognitoUser?.attributes?.sub,
        });
    }

    return (
		<WatchlistScreenContainer>
            <BaseHeader text={'Watchlist'} />
			<TopBarContainer>
				<SelectorBarContainer>
					<ToggleSelector
						options={['Recs', 'My List', 'Seen']}
						selectedOption={selectedCategory}
						onSelect={onSelectCategory}
					/>
				</SelectorBarContainer>
                { showCoachMark && renderCoachMark() }
			</TopBarContainer>
            <Watchlist
                navigation={navigation}
                watchlistItems={categoryWatchlistItems}
                category={selectedCategory}
            />
		</WatchlistScreenContainer>
	);
};
