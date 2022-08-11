import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { fetchResults } from './fetchResults';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';
import { isMentionPartType, parseValue } from 'react-native-controlled-mentions';
import ReelayAPIHeaders from './ReelayAPIHeaders';

import { 
    getMostRecentReelaysByTitle,
    getRegisteredUser, 
    getUserByUsername, 
} from './ReelayDBApi';

import { getUserSettings, shouldNotifyUser } from "./SettingsApi";
import { getClubMembers } from './ClubsApi';

const EXPO_NOTIFICATION_URL = Constants.manifest.extra.expoNotificationUrl;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

const getDevicePushToken = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
            ios: { 
                allowBadge: true,
            }
        });
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        logAmplitudeEventProd('pushTokenFetchFailed', {
            status: existingStatus
        });
        return null;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
}

export const condensedTitleObj = (titleObj) => {
    const { id, display, posterSource, releaseYear } = titleObj;
    return { id, display, posterSource, releaseYear };
}

export const getAllMyNotifications = async (userSub, page = 0) => {
    const routeGet = REELAY_API_BASE_URL + `/notifications/${userSub}/all?page=${page}`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: ReelayAPIHeaders,
    });

    // notification content is comprised of { title, body, data }
    // the last of these is stored as a JSON string, so we parse it before storing locally
    const parsedNotifications = resultGet.map((notification) => {
        try {
            notification.data = JSON.parse(notification?.data);
        } catch (error) {
            console.log('Error in getAllMyNotifications: ', error);
        }
        return notification;
    });

    return parsedNotifications;
}


export const hideNotification = async (notificationID) => {
    const routeDelete = REELAY_API_BASE_URL + `/notifications/${notificationID}/hide`;
    const resultDelete = await fetchResults(routeDelete, { 
        method: 'DELETE',
        headers: ReelayAPIHeaders,
    });

    return resultDelete;
}

export const markAllNotificationsSeen = async (userSub) => {
    const routePatch = REELAY_API_BASE_URL + `/notifications/${userSub}/markAllSeen`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: ReelayAPIHeaders,
    });
    return resultPatch;
}

export const markNotificationActivated = async (notificationID) => {
    const routePatch = REELAY_API_BASE_URL + `/notifications/${notificationID}/markActivated`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: ReelayAPIHeaders,
    });
    return resultPatch;
}

export const markNotificationReceived = async (notificationID) => {
    const routePatch = REELAY_API_BASE_URL + `/notifications/${notificationID}/markReceived`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: ReelayAPIHeaders,
    });
    return resultPatch;
}

export const markNotificationSeen = async (notificationID) => {
    const routePatch = REELAY_API_BASE_URL + `/notifications/${notificationID}/markSeen`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: ReelayAPIHeaders,
    });
    return resultPatch;
}

// https://docs.expo.dev/push-notifications/push-notifications-setup/
export const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        return await getDevicePushToken();
    } else {
        alert('Must use physical device for Push Notifications');
        return null;
    }
}; 

// We probably shouldn't let these have default values...
export const sendNotification = async ({
    body='', 
    data={},
    sendToUserSub,
    sound='default',
    title='You have a notification from Reelay', 
    token,
    shouldSendPushNotification=true
}) => {
    const dataToPush = { ...data, 'content-available': 1 };
    const reelayDBPostBody = { title, body, data: dataToPush };
    const reelayDBRoutePost = `${REELAY_API_BASE_URL}/notifications/${sendToUserSub}`;

    const postResult = await fetchResults(reelayDBRoutePost, {
        method: 'POST',
        headers: ReelayAPIHeaders,
        body: JSON.stringify(reelayDBPostBody),
    });

    if (shouldSendPushNotification) {
        const expoMessage = { body, data: dataToPush, sound, title, to: token };
        const expoResponse = await fetchResults(EXPO_NOTIFICATION_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expoMessage),
        });

        if (expoResponse?.data?.error) {
            console.log(expoResponse.data.error);
        }
        return expoResponse;
    }
    return postResult;
}

export const notifyCreatorOnComment = async ({ creatorSub, author, reelay, commentText, mentionedUsers }) => {
    const recipientIsAuthor = (creatorSub === author?.sub);
    const recipientMentioned = mentionedUsers && mentionedUsers.includes(creatorSub);
    if (recipientIsAuthor || recipientMentioned) {
        console.log('No need to send notification to creator');
        return;
    }

    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    if (!token) {
        console.log('Creator not registered for notifications');
        return;
    }

    const shouldSendPushNotification = await shouldNotifyUser(creatorSub, "notifyCommentsOnMyReelays");
    const title = `${author?.username}`;
    const body = `commented on your reelay for ${reelay.title.display}`;
    const action = (reelay.topicID) ? 'openTopicAtReelay' : 'openSingleReelayScreen';
    const data = {        
        notifyType: 'notifyCreatorOnComment', 
        commentText,
        action,
        reelaySub: reelay.sub,
        title: condensedTitleObj(reelay.title),
        fromUser: { sub: author?.sub, username: author?.username },
    };

    await sendNotification({ title, body, data, token, sendToUserSub: creatorSub, shouldSendPushNotification });
}

export const notifyUserOnCommentLike = async ({ authorSub, user, reelay }) => {
    const creator = reelay.creator;
    const commentAuthor = await getRegisteredUser(authorSub);
    const token = commentAuthor?.pushToken;

    const recipientIsAuthor = (authorSub === user?.sub);
    if (recipientIsAuthor) {
        console.log('No need to send notification')
        return;
    }

    if (!token) {
        console.log('Creator not registered for like notifications');
        return;
    }

    const shouldSendPushNotification = await shouldNotifyUser(authorSub, "notifyLikesOnMyComments");

    let creatorDirectObject = `${creator.username}'s`;
    if (creator.username === user?.username) creatorDirectObject = 'their';
    if (creator.username === commentAuthor.username) creatorDirectObject = 'your';

    const title = `${user?.username}`;
    const body = `liked your comment on ${creatorDirectObject} reelay.`;
    const action = (reelay.topicID) ? 'openTopicAtReelay' : 'openSingleReelayScreen';
    const data = { 
        notifyType: 'notifyUserOnCommentLike',
        action,
        reelaySub: reelay.sub,
        title: condensedTitleObj(reelay.title),   
        fromUser: { sub: user?.sub, username: user?.username },
    };

    await sendNotification({ title, body, data, token, sendToUserSub: authorSub, shouldSendPushNotification });
}

export const notifyMentionsOnComment = async ({ creator, author, reelay, commentText }) => {
    const mentionFollowType = { trigger: '@' };
    const commentParts = parseValue(commentText, [mentionFollowType]);
    const isMention = (part) => (part.partType && isMentionPartType(part.partType));

    let mentionedUsers = [];

    commentParts.parts.forEach(async (commentPart) => {
        if (isMention(commentPart)) {
            const notifyMentionedUserSub = commentPart.data.id;
            const notifyMentionedUser = await getRegisteredUser(notifyMentionedUserSub);
            const token = notifyMentionedUser?.pushToken;
            
            if (!token) {
                console.log('Comment author not registered for notifications');
                return;
            }

            const shouldSendPushNotification = await shouldNotifyUser(notifyMentionedUserSub, "notifyTagsInComments");
        
            let creatorDirectObject = `${creator.username}'s`;
            if (creator.username === author.username) creatorDirectObject = 'their';
            if (creator.username === notifyMentionedUser.username) creatorDirectObject = 'your';
                
            const title = `${author.username}`;
            const body = 'tagged you in a comment';
            const action = (reelay.topicID) ? 'openTopicAtReelay' : 'openSingleReelayScreen';
            const data = { 
                notifyType: 'notifyMentionedUserOnComment',
                commentText,
                action,
                reelaySub: reelay.sub,
                title: condensedTitleObj(reelay.title),   
                fromUser: { sub: author.sub, username: author.username },
            };

            mentionedUsers.push(notifyMentionedUserSub);

            await sendNotification({ title, body, data, token, sendToUserSub: notifyMentionedUser?.sub, shouldSendPushNotification });
            logAmplitudeEventProd('userMentionedInCommnet', {
                mentionedUsername: notifyMentionedUser.username,
                authorUsername: author.username,
                creatorUsername: creator.username,
                title: reelay.title.display,
                commentText: commentText,
                reelaySub: reelay.sub,
            });
        }
    });

    return mentionedUsers;
}

export const notifyThreadOnComment = async ({ creator, author, reelay, commentText, mentionedUsers }) => {
    reelay.comments.map(async (comment, index) => {
        const notifyAuthorName = comment.authorName;
        const notifyAuthor = await getUserByUsername(notifyAuthorName);

        const token = notifyAuthor?.pushToken;
        if (!token) {
            console.log('Comment author not registered for notifications');
            return;
        }

        const shouldSendPushNotification = await shouldNotifyUser(notifyAuthor?.sub, "notifyCommentsOnOtherReelays");

        const recipientIsAuthor = (notifyAuthor?.sub === author?.sub);
        const recipientMentioned = mentionedUsers && mentionedUsers.includes(notifyAuthor.sub);
        if (recipientIsAuthor || recipientMentioned) {
            console.log('No need to send notification to comment author');
            return;
        }

        // if we don't catch this, we'll send a notification twice to a creator
        // who commented on their own reelay
        const recipientIsCreator = (notifyAuthor?.sub === creator?.sub);
        if (recipientIsCreator) {
            console.log('No need to send notification to creator');
            return;
        }    

        const recipientAlreadyNotified = (comment) => comment.authorName === notifyAuthorName;
        const recipientIndex = reelay.comments.findIndex(recipientAlreadyNotified);
        if (recipientIndex < index) {
            console.log('User already notified');
            return;
        }

        let creatorDirectObject = `${creator.username}'s`;
        if (creator.username === author.username) creatorDirectObject = 'their';
            
        const title = `${author.username}`;
        const body = `commented on ${creatorDirectObject} reelay for ${reelay.title.display}`;
        const action = (reelay.topicID) ? 'openTopicAtReelay' : 'openSingleReelayScreen';
        const data = { 
            notifyType: 'notifyThreadOnComment',
            commentText,
            action,
            reelaySub: reelay.sub,
            title: condensedTitleObj(reelay.title),   
            fromUser: { sub: author.sub, username: author.username },
        };

        await sendNotification({ title, body, data, token, sendToUserSub: notifyAuthor?.sub, shouldSendPushNotification });    
    });
}
///
export const notifyCreatorOnFollow = async ({ creatorSub, follower }) => {
    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    if (!token) {
        console.log("Creator not registered for follow notifications");
        return;
    }

    const shouldSendPushNotification = await shouldNotifyUser(creatorSub, "notifyFollows");

    const title = `${follower.username}`;
    const body = `started following you`;
    const data = {
        action: "openUserProfileScreen",
        fromUser: { sub: follower.sub, username: follower.username },
        notifyType: 'notifyCreatorOnFollow',
        // here, the alt action is to follow, and we can get that
        // from the type 
    };
    await sendNotification({ title, body, data, token, sendToUserSub: creatorSub, shouldSendPushNotification });
};

export const notifyCreatorOnLike = async ({ creatorSub, user, reelay }) => {
    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    const recipientIsAuthor = (creatorSub === user?.sub);
    if (recipientIsAuthor) {
        const title = `Achievement Unlocked!`;
        const body = '❤️ Love Yourself ❤️';
        const action = (reelay.topicID) ? 'openTopicAtReelay' : 'openSingleReelayScreen';
        const data = { 
            action,
            reelaySub: reelay?.sub,
            title: condensedTitleObj(reelay?.title),   
            notifyType: 'loveYourself',
        };
    
        await sendNotification({ title, body, data, token, sendToUserSub: creatorSub, shouldSendPushNotification: true });
        return;
    }

    if (!token) {
        console.log('Creator not registered for like notifications');
        return;
    }

    const shouldSendPushNotification = await shouldNotifyUser(creatorSub, "notifyLikesOnMyReelays");

    const title = `${user?.username}`;
    const body = `liked your reelay for ${reelay.title.display}`;
    const action = (reelay.topicID) ? 'openTopicAtReelay' : 'openSingleReelayScreen';
    const data = { 
        notifyType: 'notifyCreatorOnLike',
        action,
        reelaySub: reelay.sub,
        title: condensedTitleObj(reelay.title),   
        fromUser: { sub: user?.sub, username: user?.username },
    };

    await sendNotification({ title, body, data, token, sendToUserSub: creatorSub, shouldSendPushNotification });
}

export const notifyMentionsOnReelayPosted = async ({ authSession, clubID = null, creator, reelay }) => {
    const descriptionText = reelay.description;
    if (!descriptionText || descriptionText === '') return;

    const mentionFollowType = { trigger: '@' };
    const descriptionParts = parseValue(descriptionText, [mentionFollowType]);
    const isMention = (part) => (part.partType && isMentionPartType(part.partType));

    let mentionedUsers = [];

    descriptionParts.parts.forEach(async (descriptionPart) => {
        if (isMention(descriptionPart)) {
            const notifyMentionedUserSub = descriptionPart.data.id;
            const notifyMentionedUser = await getRegisteredUser(notifyMentionedUserSub);
            const token = notifyMentionedUser?.pushToken;

            if (clubID) {
                const clubMembers = await getClubMembers({
                    authSession, 
                    clubID, 
                    reqUserSub: creator?.sub,
                });
                const matchMember = (memberSub) => (memberSub === notifyMentionedUserSub);
                const matchFound = !!clubMembers.find(matchMember);
                if (!matchFound) {
                    console.log('Mentioned user not in club');
                    return;
                }
            }
            
            if (!token) {
                console.log('Comment author not registered for notifications');
                return;
            }

            const shouldSendPushNotification = await shouldNotifyUser(notifyMentionedUserSub, "notifyTagsInReelays");
                        
            const title = `${creator.username}`;
            const body = `tagged you in their reelay for ${reelay.title.display}`;
            const action = (reelay.topicID) ? 'openTopicAtReelay' : 'openSingleReelayScreen';
            const data = { 
                notifyType: 'notifyMentionedUserOnReelayPosted',
                descriptionText,
                action,
                reelaySub: reelay.sub,
                title: condensedTitleObj(reelay.title),   
                fromUser: { sub: creator.sub, username: creator.username },
            };

            mentionedUsers.push(notifyMentionedUser.sub);

            await sendNotification({ title, body, data, token, sendToUserSub: notifyMentionedUser?.sub, shouldSendPushNotification });
            logAmplitudeEventProd('userMentionedInReelay', {
                mentionedUsername: notifyMentionedUser.username,
                creatorUsername: creator.username,
                title: reelay.title.display,
                descriptionText,
                reelaySub: reelay.sub,
            });
        }
    });
    return mentionedUsers;
}

export const notifyOtherCreatorsOnReelayPosted = async ({ 
    creator, 
    reelay, 
    topic = null,
    clubTitle = null,
    mentionedUsers = null,
}) => {
    let notifyReelayStack;
    let action;
    let settingToCheck;

    if (topic) {
        notifyReelayStack = topic.reelays;
        action = 'openTopicAtReelay';
        settingToCheck = "notifyPostsInOtherTopics";
    } else if (clubTitle) {
        notifyReelayStack = clubTitle.reelays;
        action = 'openClubActivityScreen';
        settingToCheck = "notifyPostsInMyClubs";
    } else {
        notifyReelayStack = await getMostRecentReelaysByTitle(reelay.title.id);
        action = 'openSingleReelayScreen';
        settingToCheck = "notifyPostsOnMyReelayedTitles";
    }

    console.log('notify reelay stack: ', notifyReelayStack);
    
    notifyReelayStack.map(async (notifyReelay, index) => {
        const notifyCreator = await getRegisteredUser(notifyReelay.creator.sub);
        const token = notifyCreator?.pushToken;

        if (!token) {
            console.log('Creator not registered for like notifications');
            return;
        }

        const recipientIsCreator = (notifyCreator.sub === creator?.sub);
        const recipientMentioned = mentionedUsers && mentionedUsers.includes(notifyCreator.sub);
        if (recipientIsCreator || recipientMentioned) {
            console.log('No need to send notification to creator');
            return;
        } 
        
        const shouldSendPushNotification = await shouldNotifyUser(notifyCreator?.sub, settingToCheck);

        const alreadyNotified = (reelay) => (notifyCreator.sub === reelay.creator.sub);
        const recipientIndex = notifyReelayStack.findIndex(alreadyNotified);
        if (recipientIndex < index) {
            console.log('Recipient already notified');
            return;
        }
        const title = (topic) ? `${creator.username}` : `${reelay.title.display}`;
        const body = (topic) ? `added to the topic: ${topic.title}` : `new reelay by ${creator.username}`; // add name for topic
        console.log("sending notification to ", notifyCreator)
        const data = { 
            notifyType: 'notifyOtherCreatorsOnReelayPosted',
            action,
            reelaySub: reelay.sub,
            club: (clubTitle) ? { id: clubTitle.clubID } : null,
            title: condensedTitleObj(reelay.title),   
            fromUser: { sub: creator?.sub, username: creator?.username },
        };

        await sendNotification({ title, body, data, token, sendToUserSub: notifyReelay.creator.sub, shouldSendPushNotification });    
    })
}

export const notifyTopicCreatorOnReelayPosted = async ({ creator, reelay, topic }) => {
    const topicCreator = await getRegisteredUser(topic.creatorSub);
    const token = topicCreator?.pushToken;

    const recipientIsCreator = (creator.sub === topicCreator?.sub);
    if (recipientIsCreator) {
        console.log('No need to send notification to creator');
        return;
    }

    const shouldSendPushNotification = await shouldNotifyUser(topicCreator?.sub, "notifyPostsInMyTopics");

    if (!token) {
        console.log('Creator not registered for like notifications');
        return;
    }

    const title = `${creator?.username}`;
    const body = `added to your topic: ${topic.title}`;
    const data = { 
        notifyType: 'notifyTopicCreatorOnReelayPosted',
        action: (topic) ? 'openTopicAtReelay' : 'openSingleReelayScreen',
        reelaySub: reelay.sub,
        title: condensedTitleObj(reelay.title),   
        fromUser: creator,
    };

    await sendNotification({ title, body, data, token, sendToUserSub: topicCreator?.sub, shouldSendPushNotification });
}
