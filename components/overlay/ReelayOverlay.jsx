import React, { useContext } from 'react';
import { Overlay } from 'react-native-elements';
import { VisibilityContext } from '../../context/VisibilityContext';
import SettingsOverlay from './SettingsOverlay';
import TitleOverlay from './TitleOverlay';

export default ReelayOverlay = ({ navigation }) => {

    const visibilityContext = useContext(VisibilityContext);

    return (
        <Overlay fullScreen={true} overlayStyle={{ 
            backgroundColor: 'black',
            opacity: 0.8,
        }}>
            {/* If we never set a visibility type, we shouldn't create an empty overlay */}
            { visibilityContext.overlayData?.type == 'SETTINGS' && 
                <SettingsOverlay navigation={navigation} />
            }
            { visibilityContext.overlayData?.type == 'TITLE' &&
                <TitleOverlay navigation={navigation} />
            }
        </Overlay>
    );

}