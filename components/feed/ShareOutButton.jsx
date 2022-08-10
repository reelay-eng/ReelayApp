import React, { useContext } from 'react';
import { Pressable, Share } from 'react-native';
import { Icon } from 'react-native-elements';
import Constants from 'expo-constants';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { createDeeplinkPathToReelay } from '../../api/ReelayDBApi';

const ICON_SIZE = 20;
const REELAY_WEB_BASE_URL = Constants.manifest.extra.reelayWebBaseUrl;

export default ShareOutButton = ({ reelay }) => {
    const { reelayDBUser } = useContext(AuthContext);
    // you should already have this reelay in the Seen section of your watchlist,
    // since you made a reelay about it

    const shareReelay = async () => {
        const deeplinkObj = await createDeeplinkPathToReelay(reelayDBUser?.sub, reelayDBUser?.username, reelay?.sub);
        console.log('created deeplink obj: ', deeplinkObj);

        const content = {
            url: REELAY_WEB_BASE_URL + deeplinkObj?.publicPath,
            title: `${reelay?.creator?.username} on ${reelay?.title?.display}`,
        };
        const options = {};
        const sharedAction = await Share.share(content, options);
        logAmplitudeEventProd('openedShareDrawer', {
            username: reelayDBUser?.username,
            title: reelay.title.display,
            source: 'shareOutButton',
        });

        console.log(sharedAction);
    }

    return (
        <Pressable onPress={shareReelay}>
            {/* <Icon type='ionicon' name='arrow-redo' color='white' size={ICON_SIZE} /> */}
            <FontAwesomeIcon icon={faArrowUpFromBracket} size={24} color='white' />
        </Pressable>
    );
}
