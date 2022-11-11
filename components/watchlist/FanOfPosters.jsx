import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';

// + 12, -12
const PosterPositions = [
    { 
        tilt: -12,
        left: 18,
        top: 54,
    },
    { 
        tilt: -6,
        left: 67,
        top: 33,
    },
    { 
        tilt: 6,
        left: 132,
        top: 16,
    },
    { 
        tilt: 12,
        left: 188,
        top: 33,
    },
]

const PosterTiltView = styled(View)`
    left: ${props => props.left}px;
    position: absolute;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
    top: ${props => props.top}px;
    transform: rotate(${props => props.tilt}deg);
`
const PosterRowView = styled(View)`
    flex-direction: row;
    height: 190px;
    width: 288px;
`

export default FanOfPosters = ({ titles = [] }) => {
    const displayTitles = (titles.length) > 4 
        ? titles.slice(0,4) 
        : titles;

    const renderAngledPoster = (title, index) => {
        const posterTiltProps = PosterPositions[index];
        return (
            <PosterTiltView {...posterTiltProps} key={title?.id}>
                <TitlePoster title={title} width={80} />
            </PosterTiltView>
        )
    }

    return (
        <PosterRowView>
             { displayTitles.map(renderAngledPoster) }
        </PosterRowView>
    )
}