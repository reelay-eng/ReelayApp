import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, View } from 'react-native';

import { BaseHeader } from '../../components/global/Headers'
import { ToggleSelector } from '../../components/global/Buttons';
import Watchlist from '../../components/watchlist/Watchlist';
import WatchlistCoachMark from '../../components/watchlist/WatchlistCoachMark';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import styled from 'styled-components/native';

const { width } = Dimensions.get('window');

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
    width: ${width - 20}px;
`

export default WatchlistScreen = ({ navigation, route }) => {
    const { cognitoUser, myWatchlistItems } = useContext(AuthContext);
    const category = route?.params?.category ?? 'My List';
    const refresh = route?.params?.refresh ?? false;
    const [selectedCategory, setSelectedCategory] = useState(category);

    useEffect(() => {
        logAmplitudeEventProd('openMyWatchlist', {
            username: cognitoUser.username,
            userSub: cognitoUser?.attributes?.sub,
        });
    }, [navigation]);

    let recCount = 0;
    let myListCount = 0;
    let seenCount = 0;

    const categoryWatchlistItems = myWatchlistItems.filter((nextItem) => {
        const { hasAcceptedRec, hasSeenTitle } = nextItem;

        const inMyList = hasAcceptedRec && !hasSeenTitle
        const inRecs = !hasAcceptedRec && !hasSeenTitle;
        const inSeen = hasSeenTitle;

        if (inMyList) {
            myListCount += 1;
            return selectedCategory === 'My List';
        } else if (inRecs) {
            recCount += 1;
            return selectedCategory === 'Recs';
        } else {
            seenCount += 1;
            return selectedCategory === 'Seen';
        }
    });

    const onSelectCategory = (category) => {
        setSelectedCategory(category);
        logAmplitudeEventProd('setWatchlistCategory', {
            category: category,
            username: cognitoUser.username,
            userSub: cognitoUser?.attributes?.sub,
        });
    }

    const recCountDisplay = `(${recCount})`;
    const myListCountDisplay = `(${myListCount})`;
    const seenCountDisplay = `(${seenCount})`;

    const recDisplay = (recCount > 0) ? `Recs ${recCountDisplay}` : 'Recs';
    const myListDisplay = (myListCount > 0) ? `My List ${myListCountDisplay}` : 'My List';
    const seenDisplay = (seenCount > 0) ? `Seen ${seenCountDisplay}` : 'Seen';

    const headerText = (selectedCategory === 'My List') 
                    ? 'Watchlist'
                    : (selectedCategory === 'Recs')
                        ? 'Watchlist Recs'
                        : 'Seen';

    return (
		<WatchlistScreenContainer>
            <BaseHeader text={headerText} />
			<TopBarContainer>
				<SelectorBarContainer>
					<ToggleSelector
                        displayOptions={[recDisplay, myListDisplay, seenDisplay]}
						options={['Recs', 'My List', 'Seen']}
						selectedOption={selectedCategory}
						onSelect={onSelectCategory}
					/>
				</SelectorBarContainer>
                <WatchlistCoachMark category={selectedCategory} navigation={navigation} />
			</TopBarContainer>
            <Watchlist
                category={selectedCategory}
                navigation={navigation}
                refresh={refresh}
                watchlistItems={categoryWatchlistItems}
            />
		</WatchlistScreenContainer>
	);
};
