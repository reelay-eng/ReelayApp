import React, { useContext } from 'react';
import { Pressable } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

const ICON_SIZE = 30;

export default SendRecButton = ({ navigation, titleObj, reelay }) => {
    const { cognitoUser } = useContext(AuthContext);
    // you should already have this reelay in the Seen section of your watchlist,
    // since you made a reelay about it

    const advanceToRecommendScreen = () => {
        navigation.push('SendRecScreen', {
            reelay,
            // TODO: the fallback value is a hack to match the existing route params to the send rec screen
            // from SwipeableRow. It deserves a refactor, especially considering this breaks
            // if SendRecScreen decides it needs more data from watchlistItem that we're not
            // sending over
            watchlistItem: {
                recommendedReelaySub: reelay?.sub,
                recReelayCreatorName: reelay?.creator.username,
                title: titleObj,
                tmdbTitleID: titleObj.id,
                titleType: (titleObj.isSeries) ? 'tv' : 'film',
            },
        });

        logAmplitudeEventProd('advanceToSendRec', {
            username: cognitoUser?.username,
            title: titleObj.display,
            source: 'reelaySidebar',
        });
    }

    return (
        <Pressable onPress={advanceToRecommendScreen}>
            <Icon type='ionicon' name='paper-plane' color='white' size={ICON_SIZE} />
        </Pressable>
    );
}