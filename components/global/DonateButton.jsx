import React, { useContext, useState } from 'react';
import { Pressable, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import { Icon } from 'react-native-elements';
import DonateDrawer from './DonateDrawer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHandHoldingMedical } from '@fortawesome/free-solid-svg-icons';

const WatchListButtonCircleContainer = styled(View)`
    align-items: center;
    align-self: center;
    background: ${ReelayColors.reelayGreen};
    border-radius: 50px;
    height: 45px;
    justify-content: center;
    width: 45px;
`
const WatchlistButtonOuterContainer = styled(Pressable)`
    align-items: flex-end;
    justify-content: center;
    width: 60px;
`

export default DonateButton = ({ donateObj, reelay }) => {
    const [donateDrawerVisible, setDonateDrawerVisible] = useState(false);
    return (
        <WatchlistButtonOuterContainer onPress={() => setDonateDrawerVisible(true)}>
            <WatchListButtonCircleContainer>
                <FontAwesomeIcon icon={ faHandHoldingMedical } size={24} />
            </WatchListButtonCircleContainer>
            { donateDrawerVisible && (
                <DonateDrawer 
                    donateObj={donateObj}
                    donateDrawerVisible={donateDrawerVisible} 
                    setDonateDrawerVisible={setDonateDrawerVisible} 
                    reelay={reelay}
                /> 
            )}
        </WatchlistButtonOuterContainer>
    );
}