import { faChartBar, faChartColumn, faChartSimple } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { ShareOutSVG } from '../global/SVGs';
import styled from 'styled-components/native';

import ShareGuessingGameModal from './ShareGuessingGameModal';
import { LinearGradient } from 'expo-linear-gradient';

const ShareButtonBackground = styled(LinearGradient)`
    border-radius: 50px;
    height: 44px;
    opacity: 1.0;
    position: absolute;
    width: 44px;
    top: -11px;
    left: -11px;
`


export default ShareGameButton = ({ game, navigation }) => {
    const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
    const closeDrawer = () => setShareDrawerOpen(false);
    // you should already have this reelay in the Seen section of your watchlist,
    // since you made a reelay about it

    return (
        <TouchableOpacity onPress={() => setShareDrawerOpen(true)}>
            <ShareButtonBackground 
                colors={['#0789FD', '#FF4848']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <FontAwesomeIcon icon={faChartSimple} color='white' size={24} />
            { shareDrawerOpen && (
                <ShareGuessingGameModal closeModal={closeDrawer} game={game} navigation={navigation} />
            )}
        </TouchableOpacity>
    );
}
