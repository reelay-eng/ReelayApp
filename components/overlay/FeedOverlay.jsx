import React, { useContext } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { FeedContext } from '../../context/FeedContext';
import SettingsOverlay from './SettingsOverlay';
import styled from 'styled-components/native';

export default FeedOverlay = ({ navigation, onDeleteReelay, setIsPaused }) => {

    const OverlayContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        opacity: 1;
        position: absolute;
        width: 100%;
    `
    const ScrollBox = styled(ScrollView)`
        height: 100%;
        width: 100%;
    `
    const { overlayData } = useContext(FeedContext);
    
    return (
        <OverlayContainer>
            <SafeAreaView>
                <ScrollBox indicatorStyle={'white'} scrollOverflowEnabled={true}>
                {/* If we never set a visibility type, we shouldn't create an empty overlay */}
                { overlayData?.type == 'REELAY' &&
                    <SettingsOverlay navigation={navigation} 
                                reelay={overlayData?.reelay} 
                                onDeleteReelay={onDeleteReelay}
                                style={{backgroundColor: 'rgba(0,0,0,1.0)'}} />
                }
                </ScrollBox>
            </SafeAreaView>
        </OverlayContainer>
    );

}