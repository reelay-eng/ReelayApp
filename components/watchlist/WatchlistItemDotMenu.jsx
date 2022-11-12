import React, { useContext, useRef, useState } from 'react';
import { 
    Dimensions, 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    TouchableOpacity, 
    View,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faArrowUpShortWide, faPlay, faPlayCircle, faTrash } from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const DrawerView = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    margin-top: auto;
    max-height: 60%;
    padding-top: 16px;
    padding-bottom: ${props => props.bottomOffset}px;
    width: 100%;
`
const ModalView = styled(View)`
    position: absolute;
`
const OptionPressable = styled(TouchableOpacity)`
    flex-direction: row;
    padding: 12px;
    padding-left: 16px;
    width: 100%;
`
const OptionText = styled(ReelayText.Body1)`
    color: ${props => props.color ?? 'white'};
    margin-left: 12px;
`

const ICON_SIZE = 24;

export default WatchlistItemDotMenu = ({ 
    closeDrawer, 
    navigation,
    watchlistItem,
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
    const bottomOffset = useSafeAreaInsets().bottom;
    const dispatch = useDispatch();

    const advanceToWatchTrailer = () => {
        closeDrawer();
        navigation.push("TitleTrailerScreen", {
            trailerURI: watchlistItem?.title?.trailerURI,
        });

        logAmplitudeEventProd("watchTrailer", {
            title: watchlistItem?.title?.display,
            tmdbTitleID: watchlistItem?.title?.id,
            source: "watchlist",
        });
    }    

    const moveToFront = async () => {
        // todo
    }

    const removeFromWatchlist = async () => {
        // todo
    }

    const DotMenuOption = ({ icon, color='white', onPress, text }) => {
        return (
            <OptionPressable onPress={onPress}>
                { icon && <FontAwesomeIcon icon={icon} color={color} size={ICON_SIZE} /> }
                <OptionText color={color}>{text}</OptionText>
            </OptionPressable>
        );
    }

    return (
        <ModalView>
            <Modal animationType='slide' transparent={true} visible={true}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <Backdrop onPress={closeDrawer}/>
                <DrawerView bottomOffset={bottomOffset}>
                    <DotMenuOption onPress={advanceToWatchTrailer} icon={faPlayCircle} text='watch trailer' />
                    <DotMenuOption onPress={moveToFront} icon={faArrowUpShortWide} text='move to front' />
                    <DotMenuOption onPress={removeFromWatchlist} color={ReelayColors.reelayRed} icon={faTrash} text='remove' />
                </DrawerView>
                </KeyboardAvoidingView>
            </Modal>
        </ModalView>
    );
}
