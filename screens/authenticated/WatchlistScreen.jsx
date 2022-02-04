import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';

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

const WatchlistScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const TopBarContainer = styled(View)`
    align-items: center;
    width: 100%;
    margin-bottom: 8px;
`
const SelectorBarContainer = styled(View)`
    width: 90%;
    height: 40px;
`

export default WatchlistScreen = ({ navigation, category='My List' }) => {
    const { cognitoUser, myWatchlistItems } = useContext(AuthContext);
    const [selectedCategory, setSelectedCategory] = useState(category);

    useEffect(() => {
        logAmplitudeEventProd('openMyWatchlist', {
            username: cognitoUser.username,
            userSub: cognitoUser?.attributes?.sub,
        });
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
						options={['My List', 'Seen', 'Recs']}
						selectedOption={selectedCategory}
						onSelect={onSelectCategory}
					/>
				</SelectorBarContainer>
			</TopBarContainer>
            <Watchlist
                navigation={navigation}
                watchlistItems={categoryWatchlistItems}
                category={selectedCategory}
            />
		</WatchlistScreenContainer>
	);
};
