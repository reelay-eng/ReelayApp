import React, { Fragment, useEffect } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import YoutubeVideoEmbed from '../utils/YouTubeVideoEmbed';
import styled from 'styled-components/native';
import { useDispatch } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { animate } from '../../hooks/animations';

const { height, width } = Dimensions.get('window');
const TRAILER_HEIGHT = width * 0.55;

const Backdrop = styled(Pressable)`
    background-color: transparent;
    bottom: 0px;
    height: ${props => height - props.bottomOffset - 100}px;
    position: absolute;
    width: 100%;
`
const DrawerView = styled(View)`
    background-color: black;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    height: auto;
    margin-top: auto;
    max-height: 70%;
    padding-top: 18px;
    padding-bottom: ${props => props.bottomOffset + 56}px;
    width: 100%;
`
const ModalView = styled(View)`
    position: absolute;
    bottom: 0px;
    height: ${height - 200}px;
    width: 100%;
`
const NoTrailerText = styled(ReelayText.H6Emphasized)`
    color: white;
    text-align: center;
    width: 80%;
`
const TrailerPlayerView = styled(View)`
    align-items: center;
    background-color: black;
    height: ${TRAILER_HEIGHT}px;
    justify-content: center;
    width: 100%;
`
const TrailerLoadingView = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: center;
    position: absolute;
    width: 100%;
`

export default FeedTrailerDrawer = ({ reelay }) => {
    const dispatch = useDispatch();
    const closePlayer = () => dispatch({ type: 'setReelayWithVisibleTrailer', payload: null });
    const bottomOffset = useSafeAreaInsets().bottom;

    const TrailerPlayer = () => {
        const trailerURI = reelay?.title?.trailerURI;
        if (!trailerURI) {
            return (
                <TrailerPlayerView>
                    <NoTrailerText>{`We don't have a trailer for ${reelay.title?.display} :(`}</NoTrailerText>
                </TrailerPlayerView>
            );
        }

        return (
            <Fragment>
                <TrailerLoadingView>
                    <ActivityIndicator />
                </TrailerLoadingView>
                <YoutubeVideoEmbed 
                    borderRadius={12}
                    height={TRAILER_HEIGHT} 
                    youtubeVideoID={trailerURI} 
                />
            </Fragment>
        );
    }

    useEffect(() => {
        animate(500, 'linear', 'opacity');
        return () => animate(500, 'linear', 'opacity');
    }, []);    

    return (
        <ModalView>
            <Backdrop bottomOffset={bottomOffset} onPress={closePlayer} />
            <DrawerView bottomOffset={bottomOffset}>
                <TrailerPlayer />
            </DrawerView>
        </ModalView>
    )
}