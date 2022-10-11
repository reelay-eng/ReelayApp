import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { 
    ActivityIndicator,
    Dimensions, 
    KeyboardAvoidingView, 
    RefreshControl, 
    TouchableOpacity, 
    View 
} from 'react-native';

import * as ReelayText from '../../components/global/Text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import moment from 'moment';

import ClubActivityList from '../../components/clubs/ClubActivityList';
import ClubBanner from '../../components/clubs/ClubBanner';
import ClubPostActivityBar from '../../components/clubs/ClubPostActivityBar';
import InviteMyFollowsDrawer from '../../components/clubs/InviteMyFollowsDrawer';

import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../../components/utils/toasts';
import { LinearGradient } from 'expo-linear-gradient';
import ReelayColors from '../../constants/ReelayColors';
import UploadProgressBar from '../../components/global/UploadProgressBar';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import Constants from 'expo-constants';

import { io } from 'socket.io-client';

import { 
    inviteMemberToClub, 
    getClubMembers, 
    getClubTitles, 
    getClubTopics, 
    markClubActivitySeen, 
    acceptInviteToClub, 
    rejectInviteFromClub, 
} from '../../api/ClubsApi';
import { HeaderWithBackButton } from '../../components/global/Headers';
import InviteToChatExternalPrompt from '../../components/clubs/InviteToChatExternalPrompt';

const { height, width } = Dimensions.get('window');
const CHAT_BASE_URL = Constants.manifest.extra.reelayChatBaseUrl;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const LAST_TYPING_MAX_SECONDS = 10;

const AcceptRejectInviteRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: ${width - 32}px;
`
const AcceptInvitePressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    display: flex;
    flex: 0.45;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    margin-right: 16px;
`
const ActivityTopSpacer = styled(View)`
    height: ${props => props.topOffset + 80}px;
`
const ActivityScreenView = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const InviteFoldButtonRow = styled(View)`
    flex-direction: row;
    justify-content: space-around;
    margin-top: 12px;
    width: 100%;
`
const InviteFoldOuterView = styled(View)`
    align-items: center;
    background-color: black;
    justify-content: space-around;
    position: absolute;
    padding: 16px;
    top: ${props => props.topOffset}px;
    width: 100%;
`
const InviteText = styled(ReelayText.Overline)`
    color: white;
`
const JoinClubButtonText = styled(ReelayText.Overline)`
    color: white;
    margin-left: 4px;
`
const JoinClubButtonView = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    width: ${width - 32}px;
`
const JoinClubOuterView = styled(LinearGradient)`
    align-items: center;
    bottom: 0px;
    flex-direction: row;
    justify-content: space-around;
    padding-top: 20px;
    position: absolute;
    width: 100%;
`
const RefreshHeaderView = styled(View)`
    top: ${props => props.topOffset}px;
    position: absolute;
    width: 100%;
`
const RefreshScreenView = styled(View)`
    align-items: center;
    background-color: black;
    height: 100%;
    justify-content: center;
    width: 100%;
`
const RejectInvitePressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: gray;
    border-radius: 20px;
    display: flex;
    flex: 0.45;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    margin-left: 16px;
`

const InviteFold = ({ clubMember, navigation, isPublicClub, onRefresh }) => {
    const authSession = useSelector(state => state.authSession);
    const [loading, setLoading] = useState(false);
    const { reelayDBUser } = useContext(AuthContext);
    const topOffset = useSafeAreaInsets().top + 60;

    const AcceptInviteButton = () => {
        const acceptInvite = async () => {
            setLoading(true);
            const acceptResult = await acceptInviteToClub({
                authSession,
                clubMemberID: clubMember?.id,
                reqUserSub: reelayDBUser?.sub,
            });
            console.log('accept invite result: ', acceptResult);
            await onRefresh();
            setLoading(false);
        }

        return (
            <AcceptInvitePressable onPress={acceptInvite}>
                <InviteText>{'Accept'}</InviteText>
            </AcceptInvitePressable>
        );
    }

    const AcceptRejectInviteRow = () => {
        return (
            <InviteFoldOuterView topOffset={topOffset} >
                <Invitation />
                <InviteFoldButtonRow>
                    <RejectInviteButton />
                    <AcceptInviteButton />
                </InviteFoldButtonRow>
            </InviteFoldOuterView>
        );    
    }

    const Invitation = () => {
        const inviteText = `${clubMember?.invitedByUsername} invited you to join`;
        return (
            <Fragment>
                <InviteText>{inviteText}</InviteText>
            </Fragment>
        )
    }

    const RejectInviteButton = () => {
        const rejectInvite = async () => {
            setLoading(true);
            const rejectResult = await rejectInviteFromClub({
                authSession,
                clubMemberID: clubMember?.id,
                reqUserSub: reelayDBUser?.sub,
            });
            console.log('reject invite result: ', rejectResult);
            await onRefresh();
            if (!isPublicClub) navigation.popToTop();
            setLoading(false);
        }

        return (
            <RejectInvitePressable onPress={rejectInvite}>
                <InviteText>{'Ignore'}</InviteText>
            </RejectInvitePressable>
        );
    }

    const LoadingIndicator = () => {
        return (
            <AcceptRejectInviteRowView>
                <ActivityIndicator />
            </AcceptRejectInviteRowView>
        );
    }

    if (loading) {
        return <LoadingIndicator />
    } else {
        return <AcceptRejectInviteRow />;    
    }

}

 
export default ClubActivityScreen = ({ navigation, route }) => {
    const authSession = useSelector(state => state.authSession);
    const activeUsersInChatRef = useRef({});
    const chatMessagesRef = useRef([]);
    const chatMessagesNextPageRef = useRef(0);
    const scrollRef = useRef(null);
    const socketRef = useRef(null);

    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);

    const promptToInvite = route.params?.promptToInvite;
    const club = route.params?.club ?? { 
        id: route.params?.clubID,
        name: route.params?.clubName,
        members: [],
        titles: [],
        topics: [],
        visibility: 'private',
    };

    const clubPostsLoaded = (club.members?.length > 0);
    const [chatMessagesLoaded, setChatMessagesLoaded] = useState(false);
    const [inviteDrawerVisible, setInviteDrawerVisible] = useState(promptToInvite);
    const [refreshing, setRefreshing] = useState(false);
    const [showChatMessages, setShowChatMessages] = useState(true);

    const closeInviteDrawer = () => setInviteDrawerVisible(false);
    const matchClubMember = (nextMember) => nextMember?.userSub === reelayDBUser?.sub;
    const clubMember = club.members.find(matchClubMember);
    const clubMemberHasJoined = clubMember?.hasAcceptedInvite;
    const isPublicClub = (club.visibility === FEED_VISIBILITY);

    const topOffset = useSafeAreaInsets().top;
    const bottomOffset = useSafeAreaInsets().bottom + 20;

    const newTopicCreatedInClub = useSelector(state => state.newTopicCreatedInClub);
    const uploadRequest = useSelector(state => state.uploadRequest);
    const uploadStage = useSelector(state => state.uploadStage);
    const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
    const showProgressBar = showProgressBarStages.includes(uploadStage);

    const initClubsChat = async () => {
        const socket = io(CHAT_BASE_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('socket initialized: ', socket.id);
            socket.emit('joinChat', {
                authSession, 
                clubID: club?.id, 
                username: reelayDBUser?.username, 
                userSub: reelayDBUser?.sub,
                visibility: FEED_VISIBILITY,
            });
        });

        socket.on('activeUsersInChatUpdated', ({ activeUsersInChat }) => {
            console.log('event received: active users');
            console.log('active users in chat: ', activeUsersInChat);
            activeUsersInChatRef.current = activeUsersInChat;
        });

        socket.on('chatMessagesLoaded', ({ messages, page }) => {
            console.log(`event received: ${messages?.length} messages loaded`);
            // TODO: ensure no duplicates
            if (page === chatMessagesNextPageRef?.current) {
                chatMessagesRef.current.push(...messages);
                chatMessagesNextPageRef.current += 1;
            } else {
                console.log('bad page: ', page, chatMessagesNextPageRef?.current);
            }
            if (!chatMessagesLoaded) setChatMessagesLoaded(true);
        })

        socket.on('chatMessageSent', ({ message }) => {
            const currentMessages = chatMessagesRef.current;
            console.log('chat message received: ', message);
            const nextMessages = [message, ...currentMessages];
            chatMessagesRef.current = nextMessages;

            const userEntry = activeUsersInChatRef?.current?.[message?.userSub];
            if (!userEntry) {
                console.log('error on chatMessageSent: could not find user entry');
                return;
            }

            // hack to stop typing once a message is sent
            userEntry.lastTypingAt = moment().subtract(LAST_TYPING_MAX_SECONDS, 'seconds');
        });

        socket.on('shouldRefreshClubActivity', () => {
            onRefresh();
        });;

        socket.on('userIsActive', ({ userSub }) => {
            console.log('received userIsActive: ', userSub);
            const userEntry = activeUsersInChatRef?.current?.[userSub];
            if (!userEntry) {
                console.log('error on userIsActive: could not find user entry');
                return;
            }
            userEntry.lastActiveAt = moment();
        });

        socket.on('userIsTyping', ({ userSub }) => {
            console.log('received userIsTyping: ', userSub);
            const userEntry = activeUsersInChatRef?.current?.[userSub];
            if (!userEntry) {
                console.log('error on userIsTyping: could not find user entry');
                return;
            }

            const now = moment();
            userEntry.lastActiveAt = now;
            userEntry.lastTypingAt = now;
        });

        return socket;
    }

    const closeClubsChat = () => {
        if (!socketRef.current) {
            console.log('error closing clubs chat: could not find socket ref');
            return;
        }

        const socket = socketRef.current;
        socket.emit('leaveChat', {
            authSession, 
            clubID: club?.id, 
            userSub: reelayDBUser?.sub,
        });
        socket.close();
        socketRef.current = null;
    }

    const loadChatMessageHistory = async () => {
        if (!socketRef.current) {
            console.log('error closing clubs chat: could not find socket ref');
            return;
        }

        const socket = socketRef.current;
        socket.emit('loadMessageHistory', {
            authSession, 
            clubID: club?.id, 
            page: chatMessagesNextPageRef?.current,
            userSub: reelayDBUser?.sub,
            visibility: FEED_VISIBILITY,
        });
        console.log('emitted load message history');
    }   

    const onRefresh = async () => {
        try { 
            setRefreshing(true);
            const [members, titles, topics] = await Promise.all([
                getClubMembers({
                    authSession,
                    clubID: club.id, 
                    reqUserSub: reelayDBUser?.sub,
                }),
                getClubTitles({ 
                    authSession,
                    clubID: club.id, 
                    reqUserSub: reelayDBUser?.sub,
                }),
                getClubTopics({
                    authSession,
                    clubID: club.id,
                    reqUserSub: reelayDBUser?.sub,
                }),
            ]);

            club.members = members;
            club.titles = titles;
            club.topics = topics;

            if (clubMember?.id) {
                clubMember.lastActivitySeenAt = moment().toISOString();
                markClubActivitySeen({ 
                    authSession, 
                    clubMemberID: clubMember.id, 
                    reqUserSub: reelayDBUser?.sub,
                });
            }

            dispatch({ type: 'setUpdatedClub', payload: club });
            setRefreshing(false); 
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not load club activity');
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (!clubPostsLoaded) {
            onRefresh().then(() => initClubsChat());
        } else {
            if (clubMember?.id) {
                clubMember.lastActivitySeenAt = moment().toISOString();
                markClubActivitySeen({ authSession, clubMemberID: clubMember.id, reqUserSub: reelayDBUser?.sub });
            }
            initClubsChat();
        }

        logAmplitudeEventProd('openedClubActivityScreen', {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
            clubID: club?.id,
            club: club?.name,
        });

        return () => closeClubsChat();
    }, []);

    useEffect(() => {
        if (uploadStage === 'upload-complete') {
            const uploadInClub = (uploadRequest?.reelayClub?.id === club.id);
            console.log('can upload in club? ', uploadInClub);
            if (uploadInClub && socketRef?.current) {
                socketRef?.current.emit('addReelayToChat', {
                    authSession,
                    clubID: club.id,
                    reelay: uploadRequest?.reelayDBBody,
                    userSub: reelayDBUser?.sub,
                });
            }
        }
    }, [uploadStage]);

    useEffect(() => {
        if (newTopicCreatedInClub && newTopicCreatedInClub?.clubID === club.id) {
            socketRef?.current.emit('addTopicToChat', {
                authSession,
                clubID: club.id,
                topic: newTopicCreatedInClub,
                userSub: reelayDBUser?.sub,
            });
            dispatch({ type: 'setNewTopicCreatedInClub', payload: null });
        }
    }, [newTopicCreatedInClub]);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    const JoinClubButton = () => {
        const joinClub = async () => {
            // inviting yourself => auto-accept invite
            const joinClubResult = await inviteMemberToClub({
                authSession,
                clubID: club.id,
                userSub: reelayDBUser?.sub,
                username: reelayDBUser?.username,
                invitedBySub: reelayDBUser?.sub,
                invitedByUsername: reelayDBUser?.username,
                role: 'member',
                clubLinkID: null,
            });

            console.log(joinClubResult);
            await onRefresh();
        }

        return (
            <JoinClubOuterView 
                bottomOffset={bottomOffset} 
                colors={['transparent', 'black']}>
                <JoinClubButtonView onPress={joinClub}>
                    <JoinClubButtonText>{'Join chat'}</JoinClubButtonText>
                </JoinClubButtonView>
            </JoinClubOuterView>
        );
    }

    if (!clubPostsLoaded || !chatMessagesLoaded) {
        return (
            <RefreshScreenView>
                <RefreshHeaderView topOffset={topOffset}>
                    <HeaderWithBackButton navigation={navigation} text={club?.name} />
                </RefreshHeaderView>
                <ActivityIndicator />
            </RefreshScreenView>
        );
    }

    return (
        <ActivityScreenView>
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
                <ActivityTopSpacer topOffset={topOffset} />
                <ClubActivityList 
                    activeUsersInChatRef={activeUsersInChatRef}
                    club={club} 
                    chatMessagesRef={chatMessagesRef}
                    loadChatMessageHistory={loadChatMessageHistory}
                    navigation={navigation} 
                    onRefresh={onRefresh} 
                    refreshing={refreshing} 
                    scrollRef={scrollRef}
                    showChatMessages={showChatMessages}
                    socketRef={socketRef}
                />
                <ClubBanner 
                    club={club} 
                    navigation={navigation} 
                    showChatMessages={showChatMessages}
                    setShowChatMessages={setShowChatMessages}
                />
                { !clubMember && isPublicClub && <JoinClubButton /> }
                { clubMember && clubMemberHasJoined && (
                    <ClubPostActivityBar 
                        club={club} 
                        navigation={navigation} 
                        scrollRef={scrollRef}
                        socketRef={socketRef} 
                    />
                )}
                { clubMember && !clubMemberHasJoined && (
                    <InviteFold 
                        clubMember={clubMember} 
                        isPublicClub={isPublicClub} 
                        navigation={navigation} 
                        onRefresh={onRefresh} 
                    />
                )}

                { showProgressBar && (
                    <UploadProgressBar clubID={club.id} mountLocation={'InClub'} onRefresh={onRefresh} />
                )}

                { inviteDrawerVisible && (
                    <InviteMyFollowsDrawer 
                        club={club}
                        closeDrawer={closeInviteDrawer}
                        onRefresh={onRefresh}
                    />
                )}
            </KeyboardAvoidingView>
            <View style={{ height: bottomOffset + 28 }} />
        </ActivityScreenView>
    );
}
