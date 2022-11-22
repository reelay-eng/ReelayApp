import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/native';

const BackButtonContainer = styled(TouchableOpacity)`
    height: 40px;
    width: 40px;
    padding: 10px;
`
export default BackButton = ({ navigation }) => {
    const goBack = () => {
        if (navigation) navigation.goBack();
    }
    
    return (
        <View>
            <BackButtonContainer onPress={goBack}>
                <FontAwesomeIcon icon={faArrowLeft} color='white' size={20} />
            </BackButtonContainer>
        </View>
    );
}