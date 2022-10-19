import React, { Fragment, useContext, useRef, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import moment from 'moment';

import { useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../utils/toasts';
import ReelayColors from '../../constants/ReelayColors';
import AddToClubsDrawer from './AddToClubsDrawer';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { isMentionPartType, MentionInput, parseValue } from 'react-native-controlled-mentions';

const { height, width } = Dimensions.get('window');

const LAST_TYPING_UPDATE_SECONDS = 4;
const MAX_COMMENT_LENGTH = 300;
const MAX_SUGGESTIONS = 6;

const AddToClubsButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: rgba(255,255,255,0.1);
    border-radius: 20px;
    height: 36px;
    justify-content: center;
    width: 36px;
`
const PostBarOuterView = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    justify-content: space-between;
    height: auto;
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
const Spacer = styled(View)`
    height: 24px;
`
const SuggestionItem = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    padding: 12px;
`
const SuggestionUsernameText = styled(ReelayText.Body2)`
    color: white;
    margin-left: 8px;
`
const SuggestionView = styled(View)`
    background-color: #1a1a1a;
    border-bottom-right-radius: 20px;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    bottom: 40px;
    left: 8px;
    position: absolute;
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 300px;
    z-index: 100;
`

const MentionInputStyle = {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    color: 'white',
    flexDirection: 'row',
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    fontStyle: 'normal',
    height: 'auto',
    justifyContent: 'flex-end',
    letterSpacing: 0.15,
    paddingLeft: 16,
    paddingRight: 60,
    paddingTop: 8,
    paddingBottom: 8,
    width: width - 74,
}

const MentionTextStyle = {
    color: ReelayColors.reelayBlue,
    fontFamily: "Outfit-Regular",
    fontSize: 16,
    fontStyle: 'normal',
    letterSpacing: 0.15,
}

const AddToClubsButton = ({ onPress }) => {
    return (
        <AddToClubsButtonPressable onPress={onPress}>
            <FontAwesomeIcon icon={faPlus} size={20} color='white' />
        </AddToClubsButtonPressable>
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
            if (lastTypingMoment) {
                const secondsSinceTyping = moment().diff(lastTypingMoment, 'seconds');
                if (secondsSinceTyping < LAST_TYPING_UPDATE_SECONDS) return;
            }

            const socket = socketRef.current;
            socket.emit('typingInChat', { 
                authSession,
                clubID: club?.id, 
                userSub: reelayDBUser?.sub,
            });
            lastTypingAtRef.current = moment();
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
        }

        const onFocus = () => {
            if (scrollRef?.current) {
                scrollRef.current.scrollToOffset(0);
            }
            emitStayActive();
        }
    
        const renderSuggestions = ({ keyword, onSuggestionPress }) => {
            if (!keyword) return <View />;
    
            const renderSuggestionItem = (suggestedUser) => {
                console.log('suggested user: ', suggestedUser);
                const onPressUser = {
                    id: suggestedUser?.userSub,
                    name: suggestedUser?.username,
                }
                const onPress = () => onSuggestionPress(onPressUser);
                return (
                    <SuggestionItem key={suggestedUser.userSub} onPress={onPress}>
                        <ProfilePicture size={32} user={suggestedUser} />
                        <SuggestionUsernameText>{suggestedUser.username}</SuggestionUsernameText>
                    </SuggestionItem>
                );
            }    
    
            const matchClubMember = (clubMember) => (clubMember?.username?.startsWith(keyword));
            const suggestedUsers = club?.members?.filter(matchClubMember);

            if (suggestedUsers?.length === 0) {
                return (
                    <SuggestionView>
                        <Spacer />
                    </SuggestionView>
                )
            }
    
            return (
                <SuggestionView>
                    { suggestedUsers.map(renderSuggestionItem).slice(0, MAX_SUGGESTIONS) }
                </SuggestionView>
            );    
        }
        
        const mentionChatMemberType = {
            trigger: '@',
            renderSuggestions,
            textStyle: MentionTextStyle,
        };    

        const getAnnotatedMessage = () => {
            const messagePartsWithMentions = parseValue(messageRef?.current?.text, [mentionChatMemberType]);
            const mentionedUsers = [];
            const isMention = (part) => (part.partType && isMentionPartType(part.partType));
            for (const messagePart of messagePartsWithMentions.parts) {
                if (isMention(messagePart)) {
                    const mentionUser = {
                        sub: messagePart.data?.id,
                        username: messagePart?.data.name,
                    };
                    mentionedUsers.push(mentionUser);
                }
            }

            const annotatedMessage = {
                ...messageRef?.current,
                mentionedUsers,
                plaintext: messagePartsWithMentions.plainText,
            };
            console.log('annotated message: ', annotatedMessage);
            return annotatedMessage;
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
                message: getAnnotatedMessage(),
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
                <MentionInput
                    maxLength={MAX_COMMENT_LENGTH}
                    multiline={true}
                    onFocus={onFocus}
                    placeholder={'Say something...'}
                    placeholderTextColor={"gray"}
                    inputRef={inputFieldRef}
                    style={MentionInputStyle}
                    value={messageText}
                    onChange={onChangeText}
                    partTypes={[ mentionChatMemberType ]}
                    
                />
                <PostButton />
            </Fragment>
        );
    }    

    const PostActivityBar = () => {
        return (
            <PostBarOuterView
                    bottomOffset={bottomOffset}> 
                <AddToClubsButton onPress={() => setTitleOrTopicDrawerVisible(true)} />
                <ChatMessageBox />
            </PostBarOuterView>
        );
    }

    return (
        <Fragment>
            <PostActivityBar />
            { titleOrTopicDrawerVisible && (
                <AddToClubsDrawer
                    club={club}
                    navigation={navigation}
                    drawerVisible={titleOrTopicDrawerVisible}
                    setDrawerVisible={setTitleOrTopicDrawerVisible}
                />
            )}
        </Fragment>
    );
}
