import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import ProfilePicture from '../global/ProfilePicture';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import moment from 'moment';

import { isMentionPartType, parseValue } from 'react-native-controlled-mentions';
import * as Clipboard from 'expo-clipboard';
import Autolink from 'react-native-autolink';
import { showSuccessToast } from '../utils/toasts';

const { height, width } = Dimensions.get('window');

const AuthorText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 14px;
    line-height: 20px;
`
const ChatMessageBodyView = styled(View)`
    margin-left: 12px;
`
const ChatMessageView = styled(View)`
    flex-direction: row;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width-32}px;
`
const ChatMessageOuterView = styled(View)`
    padding-left: 16px;
    padding-right: 16px;
`
const DotMenuButtonView = styled(TouchableOpacity)`
    right: 8px;
    position: absolute;
`
const MentionButton = styled(TouchableOpacity)`
    margin-top: -3px;
`
const MessageTextPortion = styled(Autolink)`
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    line-height: 24px;
    letter-spacing: 0.15px;
    text-align: left;

    color: white;
    padding-right: 10px;
    margin: 0px;
`
const MessageTextStyled = styled(ReelayText.Body2)`
    color: white;
`
const MessageTextView = styled(View)`
    width: ${width - 80}px;
`
const OverlineView = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    margin-bottom: 4px;
`
const ProfilePictureView = styled(View)`
    margin-top: 6px;
`
const TimestampText = styled(ReelayText.Body2)`
    color: #9D9D9D;
    font-size: 12px;
    line-height: 14px;
`
const TopRowSpacer = styled(View)`
    width: 6px;
`
const MentionTextStyle = {
    color: ReelayColors.reelayBlue,
    fontFamily: "Outfit-Regular",
    fontSize: 16,
    fontStyle: 'normal',
    letterSpacing: 0.15,
    lineHeight: 24,
}

const DotMenuButton = ({ message }) => {
    const [dotMenuVisible, setDotMenuVisible] = useState(false);
    const openDrawer = () => setDotMenuVisible(true);
    return (
        <DotMenuButtonView onPress={openDrawer}>
            <Icon type='ionicon' name='ellipsis-vertical' size={20} color='white' />
            { dotMenuVisible && ( <View /> )}
        </DotMenuButtonView>
    );
}

const MessageTextWithMentions = ({ message, navigation }) => {
    const mentionFollowType = {
        trigger: '@',
        textStyle: MentionTextStyle
    };

    const messagePartsWithMentions = parseValue(message.text, [mentionFollowType]);
    const isMention = (part) => (part.partType && isMentionPartType(part.partType));
    var messageText = '';

    const advanceToMentionProfile = (mentionData) => {
        const mentionUser = {
            sub: mentionData.id,
            username: mentionData.name,
        }
        navigation.push('UserProfileScreen', { creator: mentionUser });
    }

    const renderMessagePart = (messagePart, index) => {
        messageText += messagePart.text;
        if (isMention(messagePart)) {
            return (
                <MentionButton key={index} onPress={() => advanceToMentionProfile(messagePart.data)}>
                    <Text style={[MentionTextStyle, {bottom: 0, marginBottom: 0}]}>{messagePart.text}</Text>
                </MentionButton>
            );
        }

        return (
            <MessageTextPortion key={index} 
                text={messagePart.text} 
                linkStyle={{ color: ReelayColors.reelayBlue }} 
                url 
            />
        );
    } 
    
    const copyToClipboard = () => {
        Clipboard.setStringAsync(messageText).then(onFulfilled => {
            showSuccessToast('Message successfully copied!')
        });
    }

    return (
        <React.Fragment>
            <Pressable onLongPress={copyToClipboard}>
                <MessageTextStyled>
                    { messagePartsWithMentions.parts.map(renderMessagePart) }
                </MessageTextStyled>
            </Pressable>
        </React.Fragment>
    )
}

export default ClubChatMessage = ({ loadChatMessageHistory, message, navigation }) => {
    const timestampString = moment(message?.createdAt).format("hh:mm A");
    const author = { 
        username: message?.username,
        sub: message?.userSub,
    }

    const ChatMessageBody = () => {
        return (
            <ChatMessageBodyView>
                <OverlineView>
                    <AuthorText>{author?.username}</AuthorText>
                    <TopRowSpacer />
                    <TimestampText>{timestampString}</TimestampText>
                </OverlineView>
                <MessageTextView>
                    <MessageTextWithMentions message={message} navigation={navigation} />
                </MessageTextView>
            </ChatMessageBodyView>
        );
    }

    useEffect(() => {
        if (message?.isOldestMessage) {
            console.log('rendering oldest message: ', message.text); 
            loadChatMessageHistory();
        }
    }, []);

    return (
        <ChatMessageOuterView>
            <ChatMessageView>
                <ProfilePictureView>
                    <ProfilePicture user={author} size={32} />
                </ProfilePictureView>
                <ChatMessageBody />
                {/* <DotMenuButton message={message} /> */}
            </ChatMessageView>
        </ChatMessageOuterView>
    );
}