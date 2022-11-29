import { faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import ShareReelayDrawer from './ShareReelayDrawer';

export default ShareOutButton = ({ navigation, reelay }) => {
    const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
    const closeDrawer = () => setShareDrawerOpen(false);
    // you should already have this reelay in the Seen section of your watchlist,
    // since you made a reelay about it

    return (
        <TouchableOpacity onPress={() => setShareDrawerOpen(true)}>
            <FontAwesomeIcon icon={faShare} color='white' size={27} />
            { shareDrawerOpen && (
                <ShareReelayDrawer closeDrawer={closeDrawer} navigation={navigation} reelay={reelay} />
            )}
        </TouchableOpacity>
    );
}
