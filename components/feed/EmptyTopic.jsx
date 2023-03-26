import { Alert, Dimensions, TouchableOpacity, View } from 'react-native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { TopicsGiantIconSVG } from '../global/SVGs';

import React from 'react';
import * as ReelayText from '../global/Text';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import ReelayInfo from './ReelayInfo';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faVideo,faAdd, faShare } from '@fortawesome/free-solid-svg-icons';
import ShareOutTopicButton from './ShareOutTopicButton';
const { height, width } = Dimensions.get('window');

const BottomGradient = styled(LinearGradient)`
    position: absolute;
    bottom: 0px;
    opacity: 0.8;
    height: 172px;
    width: 100%;
`
const StartConvoPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 26px;
    height: 52px;
    flex-direction: row;
    justify-content: center;
    width: 80%;
`
const AddReelayPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 26px;
    height: 52px;
    margin-top:10px;
    flex-direction: row;
    justify-content: center;
    width: 80%;
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
const TopicCenterView = styled(View)`
    align-items: center;
`
const TopicGradient = styled(LinearGradient)`
    height: ${height}px;
    position: absolute;
    width: 100%;
`
const TopicIconView = styled(View)`
    padding: 10px;
`
const TopicTitleText = styled(ReelayText.Body2Bold)`
    color: white;
    font-size: 22px;
    line-height: 32px;
    text-align: center;
`
const TopicTitleView = styled(View)`
    margin-top: 50px;
    margin-bottom: 50px;
    width: 60%;
`
const TopicView = styled(View)`
    background-color: #121212;
    justify-content: center;
    height: ${height}px;
    width: 100%;
`

export default EmptyTopic = ({ navigation, topic }) => {
    const StartConvoButton = () => {
        const advanceToCreateReelay = () => navigation.push('SelectTitleScreen', { clubID: topic?.clubID, topic });
        return (
            <StartConvoPressable onPress={advanceToCreateReelay}>
                <FontAwesomeIcon icon={faVideo} color='white' size={20} />
                <StartConvoText>{'Start the conversation'}</StartConvoText>
            </StartConvoPressable>
        );
    }
    const AddReelayButton = () => {
        const advanceToADDReelay = () => navigation.push('ReelayListScreen', { clubID: topic?.clubID, topic });
        return (
            <AddReelayPressable onPress={advanceToADDReelay}>
                <FontAwesomeIcon icon={faAdd} color='white' size={20} />
                <StartConvoText>{'Add Reelay to topic'}</StartConvoText>
            </AddReelayPressable>
        );
    }

    const ShareTopicButton = () => {
        const shareTheTopic = () => Alert.alert("","Linking to share");
        return (
            // <ShareTopicPressable onPress={shareTheTopic}>
            //     <FontAwesomeIcon icon={faShare} color='white' size={20} />
            //     <StartConvoText>{'Share the Topic'}</StartConvoText>
            // </ShareTopicPressable>
            <ShareOutTopicButton navigation={navigation} topic={topic} type={2}/>
        );
    }

    const TopicIcon = () => {
        return (
            <TopicIconView>
                <TopicsGiantIconSVG />
            </TopicIconView>
        );
    }

    const TopicTitle = () => {
        return (
            <TopicTitleView>
                <TopicTitleText>{topic?.title}</TopicTitleText>
            </TopicTitleView>
        );
    }

    return (
        <TopicView>
            <TopicGradient colors={[ReelayColors.reelayPurple, '#865EE500']} />
            <TopicCenterView>
                <TopicIcon />
                <TopicTitle />
                <StartConvoButton />
                <AddReelayButton />
                <ShareTopicButton />
            </TopicCenterView>
            <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
            <ReelayInfo navigation={navigation} reelay={topic} />
        </TopicView>
    )
}