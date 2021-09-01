import React, { useContext } from 'react';
import { Pressable } from 'react-native';
import { Overlay } from 'react-native-elements';
import { VisibilityContext } from '../../context/VisibilityContext';
import SettingsOverlay from './SettingsOverlay';
import TitleOverlay from './TitleOverlay';
import ReelayOverlay from './ReelayOverlay';
import styled from 'styled-components/native';

export default FeedOverlay = ({ navigation }) => {

    const OverlayPressable = styled(Pressable)`
        height: 100%;
        width: 100%;
        background: transparent;
    `

    const visibilityContext = useContext(VisibilityContext);

    return (
        <Overlay fullScreen={true} overlayStyle={{ 
            backgroundColor: 'black',
            opacity: 1,
        }}>
            <OverlayPressable onLongPress={() => visibilityContext.setOverlayVisible(false)}>
                {/* If we never set a visibility type, we shouldn't create an empty overlay */}
                { visibilityContext.overlayData?.type == 'SETTINGS' && 
                    <SettingsOverlay navigation={navigation} />
                }
                { visibilityContext.overlayData?.type == 'TITLE' &&
                    <TitleOverlay navigation={navigation} style={{backgroundColor: 'rgba(0,0,0,1.0)'}} />
                }
                { visibilityContext.overlayData?.type == 'REELAY' &&
                    <ReelayOverlay navigation={navigation} reelay={visibilityContext.overlayData?.reelay} style={{backgroundColor: 'rgba(0,0,0,1.0)'}} />
                }
            </OverlayPressable>
        </Overlay>
    );

}