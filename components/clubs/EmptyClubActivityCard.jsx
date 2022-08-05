import React from 'react';
import { Dimensions, View } from 'react-native';

import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { ClubsIconSVG } from '../global/SVGs';

const { height, width } = Dimensions.get('window');

const EmptyClubsView = styled(View)`
    align-items: center;
    display: flex;
    justify-content: center;
    margin-left: 16px;
    margin-right: 16px;
    margin-top: 24px;
    margin-bottom: 100px;
    height: 200px;
    width: ${width - 32}px;
`
const SectionHeader = styled(ReelayText.H5Bold)`
    color: white;
    display: flex;
    text-align: center;
`
const SectionView = styled(View)`
    align-items: center;
    padding: 12px;
    padding-left: 30px;
    padding-right: 30px;
    width: 100%;
`
const TopAndBottomSpacer = styled(View)`
    height: 18px;
`

export default EmptyClubActivityCard = () => {
    return (
        <EmptyClubsView>
            <TopAndBottomSpacer />
            <ClubsIconSVG enlarge={true} sizeRatio={0.2} />
            <SectionView>
                <SectionHeader numberOfLines={3}>
                    {'No recent activity'}
                </SectionHeader>
            </SectionView>
            <TopAndBottomSpacer />
        </EmptyClubsView>
    );
}