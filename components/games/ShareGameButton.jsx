import { faChartSimple } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';

const ShareButtonBackground = styled(LinearGradient)`
    border-radius: 50px;
    height: 44px;
    opacity: 1.0;
    position: absolute;
    width: 44px;
    top: -11px;
    left: -11px;
`

export default ShareGameButton = () => {
    const statsVisible = useSelector(state => state.statsVisible);
    const dispatch = useDispatch();
    const openDrawer = () => {
        dispatch({ type: 'setStatsVisible', payload: true });
    }
    // you should already have this reelay in the Seen section of your watchlist,
    // since you made a reelay about it

    return (
        <TouchableOpacity onPress={openDrawer}>
            <ShareButtonBackground 
                colors={['#0789FD', '#FF4848']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <FontAwesomeIcon icon={faChartSimple} color='white' size={24} />
        </TouchableOpacity>
    );
}
