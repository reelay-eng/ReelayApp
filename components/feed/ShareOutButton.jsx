import React, { useContext, useState } from 'react';
import { Share, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import { createDeeplinkPathToReelay } from '../../api/ReelayDBApi';
import { ShareOutSVG } from '../global/SVGs';
import ShareReelayDrawer from './ShareReelayDrawer';

const REELAY_WEB_BASE_URL = Constants.manifest.extra.reelayWebBaseUrl;

export default ShareOutButton = ({ navigation, reelay }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
    const closeDrawer = () => setShareDrawerOpen(false);
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
        <TouchableOpacity onPress={() => setShareDrawerOpen(true)}>
            <ShareOutSVG />
            { shareDrawerOpen && (
                <ShareReelayDrawer closeDrawer={closeDrawer} navigation={navigation} reelay={reelay} />
            )}
        </TouchableOpacity>
    );
}
