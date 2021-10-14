import React from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components/native';

export default ProfileStatsBar = ({ reelayCount }) => {
    const BarContainer = styled(View)`
        align-self: center;
        flex-direction: row;
    `
    const StatContainer = styled(View)`
        align-items: center;
        width: 90px;
        margin: 10px;
    `
    const DimensionText = styled(Text)`
        font-family: System;
        font-size: 16px;
        font-weight: 400;
        color: white;
    `
    const StatText = styled(Text)`
        font-family: System;
        font-size: 20px;
        font-weight: 600;
        color: white;
    `

    return (
        <BarContainer>
            <StatContainer>
                <StatText>{reelayCount}</StatText>
                <DimensionText>{'Reelays'}</DimensionText>
            </StatContainer>
            <StatContainer>
                <StatText>{'0'}</StatText>
                <DimensionText>{'Followers'}</DimensionText>
            </StatContainer>
            <StatContainer>
                <StatText>{'0'}</StatText>
                <DimensionText>{'Following'}</DimensionText>
            </StatContainer>
        </BarContainer>
    );
}
