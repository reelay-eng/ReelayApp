import React, { useContext } from 'react';
import { Overlay } from 'react-native-elements';
import { VisibilityContext } from '../../context/VisibilityContext';
import SettingsOverlay from './SettingsOverlay';
import TitleOverlay from './TitleOverlay';
import styled from 'styled-components/native';

export default ReelayOverlay = ({ navigation }) => {

    const visibilityContext = useContext(VisibilityContext);

    return (
        <Overlay fullScreen={true} overlayStyle={{ 
            backgroundColor: 'black',
            opacity: 1,
        }}>
            {/* If we never set a visibility type, we shouldn't create an empty overlay */}
            { visibilityContext.overlayData?.type == 'SETTINGS' && 
                <SettingsOverlay navigation={navigation} />
            }
            { visibilityContext.overlayData?.type == 'TITLE' &&
                <TitleOverlay navigation={navigation} style={{backgroundColor: 'rgba(0,0,0,1.0)'}} />
            }
        </Overlay>
    );

}