import React, { Fragment, useContext, useEffect, useRef, useState, memo } from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import moment from 'moment';

import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../utils/toasts';
import { LinearGradient } from 'expo-linear-gradient';
import ReelayColors from '../../constants/ReelayColors';
import AddTitleOrTopicDrawer from './AddTitleOrTopicDrawer';

import { TextInput } from 'react-native-gesture-handler';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import TextInputWithMentions from '../feed/TextInputWithMentions';

const { height, width } = Dimensions.get('window');

const LAST_TYPING_UPDATE_SECONDS = 5;

const AddTitleOrTopicButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: rgba(255,255,255,0.1);
    border-radius: 20px;
    height: 36px;
    justify-content: center;
    width: 36px;
`
const ChatMessageTextInput = styled(TextInput)`
    align-items: center;
    background-color: #1a1a1a;
    border-radius: 24px;
    color: white;
    flex-direction: row;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    height: auto;
    justify-content: flex-end;
    letter-spacing: 0.15px;
    padding-left: 16px;
    padding-right: 60px;
    padding-top: 8px;
    padding-bottom: 8px;
    width: ${width - 74}px;
`
const PostBarOuterView = styled(LinearGradient)`
    align-items: flex-end;
    flex-direction: row;
    justify-content: space-between;
    padding-left: 14px;
    padding-right: 16px;
    padding-top: 20px;
    padding-bottom: 16px;
    width: 100%;
`
const PostMessageButtonPressable = styled(TouchableOpacity)`
    bottom: 24px;
    position: absolute;
    right: 32px;
`
const PostMessageButtonText = styled(ReelayText.Body2Emphasized)`
    color: ${ReelayColors.reelayBlue};
    font-size: 16px;
    line-height: 20px;
`

const AddTitleOrTopicButton = ({ onPress }) => {
    return (
        <AddTitleOrTopicButtonPressable onPress={onPress}>
            <FontAwesomeIcon icon={faPlus} size={20} color='white' />
        </AddTitleOrTopicButtonPressable>
    );
}

export default ClubPostActivityBar = ({ club, navigation, scrollRef, socketRef }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const bottomOffset = useSafeAreaInsets().bottom + 64;
    const [titleOrTopicDrawerVisible, setTitleOrTopicDrawerVisible] = useState(false);

    const messageRef = useRef({
        mediaURI: null,
        mediaType: null,
        text: '',
    });

    const isValidMessage = () => {
        if (!messageRef?.current) return false;
        return (messageRef.current?.text.length > 0);
    }

    const ChatMessageBox = () => {
        const inputFieldRef = useRef(null);
        const lastTypingAtRef = useRef(null);
        const [messageText, setMessageText] = useState(messageRef?.text ?? '');

        const checkEmitTypingInChat = () => {
            const lastTypingMoment = lastTypingAtRef.current;
            const shouldEmitTypingUpdate = (!lastTypingMoment) || (
                moment().diff(lastTypingMoment, 'seconds') > LAST_TYPING_UPDATE_SECONDS
            );

            if (shouldEmitTypingUpdate) {
                const socket = socketRef.current;
                socket.emit('typingInChat', { 
                    authSession,
                    clubID: club?.id, 
                    userSub: reelayDBUser?.sub,
                });
            }
        }

        const emitStayActive = () => {
            if (!socketRef.current) {
                console.log('error closing clubs chat: could not find socket ref');
                return;
            }
    
            const socket = socketRef.current;
            socket.emit('stayActive', {
                authSession, 
                clubID: club?.id, 
                userSub: reelayDBUser?.sub,
            });
        }    
    
        const onChangeText = (nextMessageText) => {
            if (messageRef?.current) {
                messageRef.current.text = nextMessageText;
                setMessageText(nextMessageText);
            }
            checkEmitTypingInChat();
            lastTypingAtRef.current = moment();
        }

        const onFocus = () => {
            if (scrollRef?.current) {
                scrollRef.current.scrollToOffset(0);
            }
            emitStayActive();
        }
    
        const onPostMessage = async () => {
            if (!isValidMessage()) {
                showErrorToast('Ruh roh! Can\'t post an empty message');
                return;
            }
            const socket = socketRef.current;
            socket.emit('sendMessageToChat', {
                authSession,
                clubID: club?.id,
                clubName: club?.name,
                message: messageRef.current,
                userSub: reelayDBUser?.sub,
            });
            messageRef.current = {
                mediaURI: null,
                mediaType: null,
                text: '',        
            }
        }
        
        const PostButton = () => {
            return (
                <PostMessageButtonPressable 
                        bottomOffset={bottomOffset} 
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
                    onChangeText={onChangeText}
                    onFocus={onFocus}
                    placeholder={'Say something...'}
                    placeholderTextColor={"gray"}
                    ref={inputFieldRef}
                />
                {/* <TextInputWithMentions
                    commentText={messageText}
                    inputRef={inputFieldRef} 
                    placeholder={'Say something...'}
                    setCommentText={onChangeText} 
                    scrollViewRef={scrollRef}
                    boxWidth={width - 84}                  
                /> */}
                <PostButton />
            </Fragment>
        );
    }    

    const PostActivityBar = () => {
        return (
            <PostBarOuterView 
                    bottomOffset={bottomOffset} 
                    colors={['transparent', 'black']} 
                    end={{ x: 0.5, y: 0.5}}>
                <AddTitleOrTopicButton onPress={() => setTitleOrTopicDrawerVisible(true)} />
                <ChatMessageBox />
            </PostBarOuterView>
        );
    }

    return (
        <Fragment>
            <PostActivityBar />
            { titleOrTopicDrawerVisible && (
                <AddTitleOrTopicDrawer
                    club={club}
                    navigation={navigation}
                    drawerVisible={titleOrTopicDrawerVisible}
                    setDrawerVisible={setTitleOrTopicDrawerVisible}
                />
            )}
        </Fragment>
    );
}
