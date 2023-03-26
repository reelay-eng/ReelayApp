import { faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import { TouchableOpacity,Dimensions } from 'react-native';
import ShareReelayDrawer from './ShareReelayDrawer';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import ShareTopicDrawer from './ShareTopicDrawer';

const { height, width } = Dimensions.get('window');
const CARD_WIDTH_CAROUSEL = width - 48;
const CARD_WIDTH_LIST = width - 32;

const getTopicCardWidth = (props) => props.horizontal ? CARD_WIDTH_CAROUSEL : CARD_WIDTH_LIST;
const getContentRowWidth = (props) => getTopicCardWidth(props) - 24;

export default ShareOutButton = ({ navigation, topic, size, type }) => {
    const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
    const closeDrawer = () => setShareDrawerOpen(false);
    // you should already have this topic in the Seen section of your watchlist,
    // since you made a topic about it

    const ShareConvoButton = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 26px;
    flex-direction: row;
    justify-content: center;
    height: 52px;
    margin-bottom: 4px;
    margin-left:10px;
    width: ${props => getContentRowWidth(props) - 272}px;
`
const ShareTopicPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 26px;
    height: 52px;
    margin-top:10px;
    flex-direction: row;
    justify-content: center;
    width: 80%;
`
const StartConvoText = styled(ReelayText.Overline)`
    color: white;
    margin-left: 8px;
`

    return (
        <>
        {type == 1 ? 
        <ShareConvoButton onPress={() => setShareDrawerOpen(true)}>
            <FontAwesomeIcon icon={faShare} color='white' size={size ?? 22} />
            { shareDrawerOpen && (
                <ShareTopicDrawer closeDrawer={closeDrawer} navigation={navigation} topic={topic} type={type} />
            )}
        </ShareConvoButton>:
        type == 2 ? 
        <ShareTopicPressable onPress={() => setShareDrawerOpen(true)}>
        <FontAwesomeIcon icon={faShare} color='white' size={20} />
        <StartConvoText>{'Share the Topic'}</StartConvoText>
        { shareDrawerOpen && (
        <ShareTopicDrawer closeDrawer={closeDrawer} navigation={navigation} topic={topic} type={type} />
    )}
    </ShareTopicPressable>:
    type == 5 ? 
    <TouchableOpacity style={{backgroundColor:ReelayColors.reelayBlue,padding:10,borderRadius:30,marginRight:10}} onPress={() => setShareDrawerOpen(true)}>
    <FontAwesomeIcon icon={faShare} color='white' size={24} />
    { shareDrawerOpen && (
    <ShareTopicDrawer closeDrawer={closeDrawer} navigation={navigation} topic={topic} type={type} />
)}
</TouchableOpacity>:
        <TouchableOpacity style={{marginLeft:10}} onPress={() => setShareDrawerOpen(true)}>
                <FontAwesomeIcon icon={faShare} color='white' size={20} />
                { shareDrawerOpen && (
                <ShareTopicDrawer closeDrawer={closeDrawer} navigation={navigation} topic={topic} type={type} />
            )}
            </TouchableOpacity>}
        </>
       
    );
}
