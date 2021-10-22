import React from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components/native';

export default Tombstone = () => {
    const TombstoneContainer = styled(View)`
        align-self: center;
        margin: 20px;
        width: 60%;
    `
    const TombstoneText = styled(Text)`
        align-self: center;
        font-family: System;
        font-size: 16px;
        font-weight: 400;
        color: white;
    `
    return (
        <TombstoneContainer>
            <TombstoneText>
                {'You can follow your friends soon, but we all die alone.'}
            </TombstoneText>
        </TombstoneContainer>
    );
}