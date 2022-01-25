import React from 'react';
import { Pressable, View } from 'react-native';
import styled from 'styled-components/native';

export default DragToCloseIndicator = () => {
        return (
            <View style={{
                alignSelf: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: 10,
                height: 5,
                marginTop: 10,
                width: 120,
            }}
            />
        );  
    }