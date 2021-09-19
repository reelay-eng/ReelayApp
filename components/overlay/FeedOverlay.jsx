import React, { useContext } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { VisibilityContext } from '../../context/VisibilityContext';
import TitleOverlay from './TitleOverlay';
import ReelayOverlay from './ReelayOverlay';
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
    const { overlayData } = useContext(VisibilityContext);
    
    return (
        <OverlayContainer>
            <SafeAreaView>
                <ScrollBox indicatorStyle={'white'} scrollOverflowEnabled={true}>
                {/* If we never set a visibility type, we shouldn't create an empty overlay */}
                { overlayData?.type == 'TITLE' &&
                    <TitleOverlay navigation={navigation} setIsPaused={setIsPaused} 
                                style={{backgroundColor: 'rgba(0,0,0,1.0)'}} />
                }
                { overlayData?.type == 'REELAY' &&
                    <ReelayOverlay navigation={navigation} 
                                reelay={overlayData?.reelay} 
                                onDeleteReelay={onDeleteReelay}
                                style={{backgroundColor: 'rgba(0,0,0,1.0)'}} />
                }
                </ScrollBox>
            </SafeAreaView>
        </OverlayContainer>
    );

}