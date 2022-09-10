import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { animateCustom } from '../../hooks/animations';

const StackBarView = styled(View)`
    background-color: #555555;
    height: 4px;
    position: absolute;
    top: ${props => props.topOffset}px;
    width: 100%;
`
const PositionPill = styled(View)`
    background-color: white;
    border-radius: 4px;
    height: 4px;
    left: ${props => props.leftOffset}px;
    width: ${props => props.width}px;
`

const { width } = Dimensions.get('window');

export default StackPositionBar = ({ stackLength, stackPosition, stackViewable }) => {
    const stackStepLength = width / stackLength;
    const topOffset = useSafeAreaInsets().top + 46;
    const viewableStackLength = Math.min(stackLength, 10);
    const pillWidth = width / viewableStackLength;
    const leftOffset = stackPosition * stackStepLength;

    useEffect(() => {
        animateCustom({
            update: {
                duration: 100,
                type: 'linear'
            }
        });
    }, [stackPosition]);

    if (!stackViewable) return <View />

    return (
        <StackBarView topOffset={topOffset}>
            <PositionPill leftOffset={leftOffset} width={pillWidth} />
        </StackBarView>
    );
}