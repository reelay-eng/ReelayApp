import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';

//Components
import { HeaderWithBackButton } from '../../components/global/Headers'
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
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 8px;
`
const SelectorBarContainer = styled(View)`
    width: 90%;
    height: 40px;
`

export default WatchlistScreen = ({ navigation }) => {
    const { cognitoUser, myWatchlistItems } = useContext(AuthContext);
    const [selectedType, setSelectedType] = useState('My List');

    useEffect(() => {
        logAmplitudeEventProd('openMyWatchlist', {
            username: cognitoUser.username,
            userSub: cognitoUser?.attributes?.sub,
        });
    }, [navigation]);

    const categoryWatchlistItems = myWatchlistItems.filter((nextItem) => {
        const { hasAcceptedRec, hasSeenTitle } = nextItem;
        if (selectedType === 'My List') {
            return hasAcceptedRec && !hasSeenTitle;
        } else if (selectedType === 'Seen') {
            return hasSeenTitle;
        } else if (selectedType === 'Recs') {
            return !hasAcceptedRec && !hasSeenTitle;
        }
    });

    return (
		<WatchlistScreenContainer>
			<HeaderWithBackButton navigation={navigation} text={'Watchlist'} />
			<TopBarContainer>
				<SelectorBarContainer>
					<ToggleSelector
						options={['My List', 'Seen', 'Recs']}
						selectedOption={selectedType}
						onSelect={(type) => setSelectedType(type)}
					/>
				</SelectorBarContainer>
			</TopBarContainer>
            <Watchlist
                navigation={navigation}
                watchlistItems={categoryWatchlistItems}
                source={selectedType}
            />
		</WatchlistScreenContainer>
	);
};
