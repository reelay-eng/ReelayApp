import React, { Fragment, useContext, useEffect, useRef, useState, memo } from 'react';
import { 
    ActivityIndicator,
    Dimensions, 
    Keyboard, 
    KeyboardAvoidingView, 
    Pressable, 
    TouchableOpacity, 
    View 
} from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import moment from 'moment';

import ClubBanner from './ClubBanner';
import ClubTitleCard from './ClubTitleCard';
import NoTitlesYetPrompt from './NoTitlesYetPrompt';

import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { inviteMemberToClub, getClubMembers, getClubTitles, getClubTopics, markClubActivitySeen, acceptInviteToClub, rejectInviteFromClub } from '../../api/ClubsApi';
import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../utils/toasts';
import InviteMyFollowsDrawer from './InviteMyFollowsDrawer';
import { LinearGradient } from 'expo-linear-gradient';
import ReelayColors from '../../constants/ReelayColors';
import AddTitleOrTopicDrawer from './AddTitleOrTopicDrawer';
import UploadProgressBar from '../global/UploadProgressBar';
import TopicCard from '../topics/TopicCard';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import Constants from 'expo-constants';
import { FlashList } from '@shopify/flash-list';

import { io } from 'socket.io-client';
import { TextInput } from 'react-native-gesture-handler';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const { height, width } = Dimensions.get('window');

const AddTitleOrTopicButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: black;
    border-color: white;
    border-radius: 20px;
    border-width: 1px;
    height: 40px;
    justify-content: center;
    width: 40px;
`
const Backdrop = styled(Pressable)`
    bottom: 0px;
    height: ${height}px;
    position: absolute;
    width: ${width}px;
`
const ChatMessageAvoidingView = styled(KeyboardAvoidingView)`
    align-items: center;
    bottom: 0px;
    position: absolute;
    width: 100%;
`
const ChatMessageTextInput = styled(TextInput)`
    align-items: center;
    background-color: black;
    border-color: white;
    border-radius: 24px;
    border-width: 1px;
    color: white;
    flex-direction: row;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    height: auto;
    justify-content: flex-end;
    letter-spacing: 0.15px;
    padding-left: 16px;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-right: 60px;
    width: ${width - 84}px;
`
const PostBarOuterView = styled(LinearGradient)`
    align-items: flex-end;
    flex-direction: row;
    justify-content: space-between;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 20px;
    padding-bottom: ${props => (props.expanded) ? 16 : props.bottomOffset}px;
    width: 100%;
`
const PostMessageButtonPressable = styled(TouchableOpacity)`
    bottom: ${props => (props.expanded) ? 26 : props.bottomOffset + 10}px;
    position: absolute;
    right: 88px;
`
const PostMessageButtonText = styled(ReelayText.Body2Emphasized)`
    color: ${ReelayColors.reelayBlue};
    font-size: 16px;
    line-height: 20px;
`

const ChatMessageBox = ({ bottomOffset, expanded, messageRef, onFocus, onPostMessage }) => {
    const inputFieldRef = useRef(null);
    const [messageText, setMessageText] = useState(messageRef?.text ?? '');

    const onChangeText = (nextMessageText) => {
        if (messageRef?.current) {
            messageRef.current.text = nextMessageText;
            setMessageText(nextMessageText);
        }
    }

    const PostButton = () => {
        return (
            <PostMessageButtonPressable 
                    bottomOffset={bottomOffset} 
                    expanded={expanded} 
                    onPress={() => {
                        onPostMessage();
                        setMessageText('');
                    }}>
                <PostMessageButtonText>
                    {'Post'}
                </PostMessageButtonText>
            </PostMessageButtonPressable>
        );
    }

    return (
        <Fragment>
            <ChatMessageTextInput 
                defaultValue={messageText}
                multiline={true}
                onFocus={onFocus}
                onChangeText={onChangeText}
                placeholder={'Say something...'}
                placeholderTextColor={"gray"}
                ref={inputFieldRef}
            />
            <PostButton />
        </Fragment>
    );
}

const AddTitleOrTopicButton = ({ onPress }) => {
    return (
        <AddTitleOrTopicButtonPressable onPress={onPress}>
            <FontAwesomeIcon icon={faPlus} size={20} color='white' />
        </AddTitleOrTopicButtonPressable>
    );
}

export default ClubPostActivityBar = ({ club, navigation, socketRef }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const bottomOffset = useSafeAreaInsets().bottom + 64;
    const [messageBoxExpanded, setMessageBoxExpanded] = useState(false);
    const [titleOrTopicDrawerVisible, setTitleOrTopicDrawerVisible] = useState(false);

    Keyboard.addListener('keyboardWillShow', () => setMessageBoxExpanded(true));

    const messageRef = useRef({
        mediaURI: null,
        mediaType: null,
        text: '',
    });

    const isValidMessage = () => {
        if (!messageRef?.current) return false;
        return (messageRef.current?.text.length > 0);
    }

    const onPostMessage = async () => {
        if (!isValidMessage()) {
            showErrorToast('Can\'t post an empty message');
            return;
        }
        const socket = socketRef.current;
        socket.emit('sendMessageToChat', {
            authSession,
            clubID: club?.id,
            userSub: reelayDBUser?.sub,
            message: messageRef.current,
        })
    }

    return (
        <ChatMessageAvoidingView behavior="padding" style={{ flex: 1 }}>
            { messageBoxExpanded && (
                <Backdrop onPress={() => {
                    Keyboard.dismiss();
                    setTimeout(() => setMessageBoxExpanded(false), 60);
                }} />
            )}
            <PostBarOuterView 
                    bottomOffset={bottomOffset} 
                    colors={['transparent', 'black']} 
                    end={{ x: 0.5, y: 0.5}}
                    expanded={messageBoxExpanded}>
                <ChatMessageBox 
                    bottomOffset={bottomOffset}
                    expanded={messageBoxExpanded}
                    messageRef={messageRef} 
                    onPostMessage={onPostMessage}
                />
                <AddTitleOrTopicButton onPress={() => setTitleOrTopicDrawerVisible(true)} />
                { titleOrTopicDrawerVisible && (
                    <AddTitleOrTopicDrawer
                        club={club}
                        navigation={navigation}
                        drawerVisible={titleOrTopicDrawerVisible}
                        setDrawerVisible={setTitleOrTopicDrawerVisible}
                    />
                )}
            </PostBarOuterView>
        </ChatMessageAvoidingView>
    );
}
