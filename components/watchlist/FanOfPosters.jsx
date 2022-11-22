import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import TitlePoster from '../global/TitlePoster';

// + 12, -12
const PosterPositions = [
    { 
        tilt: -12,
        left: 18,
        top: 38,
    },
    { 
        tilt: -6,
        left: 67,
        top: 17,
    },
    { 
        tilt: 6,
        left: 132,
        top: 0,
    },
    { 
        tilt: 12,
        left: 188,
        top: 17,
    },
]

const POSTER_WIDTH = 100;

const PosterFillEmpty = styled(View)`
    background-color: #1B2B3D;
    border-radius: 12px;
    height: 100%;
    opacity: 0.7;
    position: absolute;
    width: 100%;
`
const PosterGradientEmpty = styled(LinearGradient)`
    border-radius: 12px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const PosterTiltView = styled(View)`
    left: ${props => props.left}px;
    position: absolute;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
    top: ${props => props.top}px;
    transform: rotate(${props => props.tilt}deg);
`
const PosterTiltViewEmpty = styled(PosterTiltView)`
    background-color: rbga(26,139,142,1);
    border-color: white;
    border-radius: 12px;
    border-width: 1px;
    height: ${POSTER_WIDTH * 1.5}px;
    width: ${POSTER_WIDTH}px;
`
const PosterRowView = styled(View)`
    flex-direction: row;
    height: 190px;
    width: 288px;
`

export default FanOfPosters = ({ titles = [] }) => {

    const getDisplayTitles = () => {
        const displayTitles = (titles.length) > 4 
            ? [...titles.slice(0,4)] 
            : [...titles];
        while (displayTitles.length < 4) displayTitles.push(null);
        return displayTitles.reverse();
    }

    const renderAngledPoster = (title, index) => {
        const posterTiltProps = PosterPositions[index];
        if (!title) {
            return <PosterTiltViewEmpty {...posterTiltProps} key={index + 100}>
                <PosterFillEmpty />
                <PosterGradientEmpty 
                    colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']} 
                    start={{x: 0, y: 0}}
                    end={{x:1, y: 1}}
                 />                
            </PosterTiltViewEmpty>;
        }

        return (
            <PosterTiltView {...posterTiltProps} key={title?.id}>
                <TitlePoster title={title} width={POSTER_WIDTH} />
            </PosterTiltView>
        )
    }

    return (
        <PosterRowView>
             { getDisplayTitles().map(renderAngledPoster) }
        </PosterRowView>
    )
}