import Constants from 'expo-constants';
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

const condensedTitle = (displayTitle) => {
    if (displayTitle.length < 25) return displayTitle;
    return displayTitle.substring(0, 22) + '...';
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

export const getMyNotificationSettings = async (user) => {
    const routeGet = REELAY_API_BASE_URL + `/users/sub/${user?.sub}/settings`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: ReelayAPIHeaders,
    });
    return resultGet;
}

export const getUserNotificationSettings = async (userSub) => {
    const routeGet = REELAY_API_BASE_URL + `/users/sub/${userSub}/settings`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: ReelayAPIHeaders,
    });
    return resultGet;
}

export const hideNotification = async (notificationID) => {
    const routeDelete = REELAY_API_BASE_URL + `/notifications/${notificationID}/hide`;
    const resultDelete = await fetchResults(routeDelete, { 
        method: 'DELETE',
        headers: ReelayAPIHeaders,
    });

    console.log('HID NOTIFICATION: ', resultDelete);
    return resultDelete;
}

export const markAllNotificationsSeen = async (userSub) => {
    const routePatch = REELAY_API_BASE_URL + `/notifications/${userSub}/markAllSeen`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: ReelayAPIHeaders,
    });
    console.log('MARK ALL SEEN: ', resultPatch);
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

    if (Constants.isDevice) {
        return await getDevicePushToken();
    } else {
        alert('Must use physical device for Push Notifications');
        return null;
    }
}; 

// We probably shouldn't let these have default values...
export const sendPushNotification = async ({
    body='', 
    data={},
    sendToUserSub,
    sound='default',
    title='You have a notification from Reelay', 
    token, 
}) => {
    const dataToPush = { ...data, 'content-available': 1 };
    const reelayDBPostBody = { title, body, data: dataToPush };
    const reelayDBRoutePost = `${REELAY_API_BASE_URL}/notifications/${sendToUserSub}`;

    const { settingsNotifyReactions } = await getUserNotificationSettings(sendToUserSub);
    if (!settingsNotifyReactions) {
        console.log('Creator does not want to receive push notifications');
        return;
    }

    console.log('POST BODY: ', reelayDBPostBody);
    const postResult = await fetchResults(reelayDBRoutePost, {
        method: 'POST',
        headers: ReelayAPIHeaders,
        body: JSON.stringify(reelayDBPostBody),
    });

    console.log('Notification posted to ReelayDB: ', postResult);

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

export const notifyCreatorOnComment = async ({ creatorSub, author, reelay, commentText, mentionedUsers }) => {
    const recipientIsAuthor = (creatorSub === author?.sub);
    const recipientMentioned = mentionedUsers.includes(creatorSub);
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

    const title = `${author?.username}`;
    // const bodyTitle = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
    // const body = `${bodyTitle}: ${commentText}`;
    const body = `commented on your reelay for ${reelay.title.display}`;
    const data = {        
        notifyType: 'notifyCreatorOnComment', 
        commentText,
        // reelaySub is used by the primary action
        action: 'openSingleReelayScreen',
        reelaySub: reelay.sub,
        title: condensedTitleObj(reelay.title),
        fromUser: { sub: author?.sub, username: author?.username },
    };

    await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
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

    let creatorDirectObject = `@${creator.username}'s`;
    if (creator.username === user?.username) creatorDirectObject = 'their';
    if (creator.username === commentAuthor.username) creatorDirectObject = 'your';

    const title = `${user?.username}`;
    
    const body = `liked your comment on ${creatorDirectObject} reelay.`;
    const data = { 
        notifyType: 'notifyUserOnCommentLike',
        action: 'openSingleReelayScreen',
        reelaySub: reelay.sub,
        title: condensedTitleObj(reelay.title),   
        fromUser: { sub: user?.sub, username: user?.username },
    };

    await sendPushNotification({ title, body, data, token, sendToUserSub: authorSub });
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
        
            let creatorDirectObject = `@${creator.username}'s`;
            if (creator.username === author.username) creatorDirectObject = 'their';
            if (creator.username === notifyMentionedUser.username) creatorDirectObject = 'your';
                
            const title = `${author.username}`;
            const body = 'tagged you in a comment';
            const data = { 
                notifyType: 'notifyMentionedUserOnComment',
                commentText,
                action: 'openSingleReelayScreen',
                reelaySub: reelay.sub,
                title: condensedTitleObj(reelay.title),   
                fromUser: { sub: author.sub, username: author.username },
            };

            mentionedUsers.push(notifyMentionedUserSub);

            await sendPushNotification({ title, body, data, token, sendToUserSub: notifyMentionedUser?.sub });
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

        const recipientIsAuthor = (notifyAuthor?.sub === author?.sub);
        const recipientMentioned = mentionedUsers.includes(notifyAuthor.sub);
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

        let creatorDirectObject = `@${creator.username}'s`;
        if (creator.username === author.username) creatorDirectObject = 'their';
            
        const title = `${author.username}`;
        // const bodyTitle = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
        // const body = `${bodyTitle}: ${commentText}`;
        const body = `commented on ${creatorDirectObject} reelay for ${reelay.title.display}`; // add logic for it to work 
        const data = { 
            notifyType: 'notifyThreadOnComment',
            commentText,
            action: 'openSingleReelayScreen',
            reelaySub: reelay.sub,
            title: condensedTitleObj(reelay.title),   
            fromUser: { sub: author.sub, username: author.username },
        };

        await sendPushNotification({ title, body, data, token, sendToUserSub: notifyAuthor?.sub });    
    });
}
///
export const notifyCreatorOnFollow = async ({ creatorSub, follower }) => {
    console.log('follower', follower)
    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    if (!token) {
        console.log("Creator not registered for follow notifications");
        return;
    }

    const title = `${follower.username}`;
    const body = `started following you`;
    const data = {
        action: "openUserProfileScreen",
        fromUser: { sub: follower.sub, username: follower.username },
        notifyType: 'notifyCreatorOnFollow',
        // here, the alt action is to follow, and we can get that
        // from the type 
    };
    await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
};

export const notifyCreatorOnLike = async ({ creatorSub, user, reelay }) => {
    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    const recipientIsAuthor = (creatorSub === user?.sub);
    if (recipientIsAuthor) {
        const title = `Achievement Unlocked!`;
        // const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
        const body = '❤️ Love Yourself ❤️';
        const data = { 
            action: 'openSingleReelayScreen',
            reelaySub: reelay?.sub,
            title: condensedTitleObj(reelay?.title),   
            notifyType: 'loveYourself',
        };
    
        await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
        return;
    }

    if (!token) {
        console.log('Creator not registered for like notifications');
        return;
    }

    const title = `${user?.username}`;
    // const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
    const body = `liked your reelay for ${reelay.title.display}`;
    const data = { 
        notifyType: 'notifyCreatorOnLike',
        action: 'openSingleReelayScreen',
        reelaySub: reelay.sub,
        title: condensedTitleObj(reelay.title),   
        fromUser: { sub: user?.sub, username: user?.username },
    };

    await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
}

export const notifyMentionsOnReelayPosted = async ({ creator, reelay }) => {
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
            
            if (!token) {
                console.log('Comment author not registered for notifications');
                return;
            }
                        
            const title = `${creator.username}`;
            const body = `tagged you in their reelay for ${reelay.title.display}`;
            const data = { 
                notifyType: 'notifyMentionedUserOnReelayPosted',
                descriptionText,
                action: 'openSingleReelayScreen',
                reelaySub: reelay.sub,
                title: condensedTitleObj(reelay.title),   
                fromUser: { sub: creator.sub, username: creator.username },
            };

            mentionedUsers.push(notifyMentionedUser.sub);

            await sendPushNotification({ title, body, data, token, sendToUserSub: notifyMentionedUser?.sub });
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

export const notifyOtherCreatorsOnReelayPosted = async ({ creator, reelay, topic = null, mentionedUsers }) => { // this is the topics one
    const notifyReelayStack = (topic) 
        ? topic.reelays
        : await getMostRecentReelaysByTitle(reelay.title.id);
    
    notifyReelayStack.map(async (notifyReelay, index) => {
        const notifyCreator = await getRegisteredUser(notifyReelay.creator.sub);
        const token = notifyCreator?.pushToken;

        if (!token) {
            console.log('Creator not registered for like notifications');
            return;
        }
        console.log("mentionedUsers",mentionedUsers)
        const recipientIsCreator = (notifyCreator.sub === creator?.sub);
        const recipientMentioned = mentionedUsers.includes(notifyCreator.sub);
        console.log(recipientMentioned)
        if (recipientIsCreator || recipientMentioned) {
            console.log('No need to send notification to creator');
            return;
        }    

        const alreadyNotified = (reelay) => (notifyCreator.sub === reelay.creator.sub);
        const recipientIndex = notifyReelayStack.findIndex(alreadyNotified);
        if (recipientIndex < index) {
            console.log('Recipient already notified');
            return;
        }
        const title = (topic) ? `${creator.username}` : `${reelay.title.display}`;
        // const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
        const body = (topic) ? `added to the topic: ${condensedTitle(topic.title)}` : `new reelay by ${creator.username}`; // add name for topic
        console.log("sending notifcation to ", notifyCreator)
        const data = { 
            notifyType: 'notifyOtherCreatorsOnReelayPosted',
            action: (topic) ? 'openTopicAtReelay' : 'openSingleReelayScreen',
            reelaySub: reelay.sub,
            title: condensedTitleObj(reelay.title),   
            fromUser: { sub: creator?.sub, username: creator?.username },
        };

        await sendPushNotification({ title, body, data, token, sendToUserSub: notifyReelay.creator.sub });    
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

    if (!token) {
        console.log('Creator not registered for like notifications');
        return;
    }

    const title = `${creator?.username}`;
    const body = `added to your topic: ${condensedTitle(topic.title)}`;
    const data = { 
        notifyType: 'notifyTopicCreatorOnReelayPosted',
        action: (topic) ? 'openTopicAtReelay' : 'openSingleReelayScreen',
        reelaySub: reelay.sub,
        title: condensedTitleObj(reelay.title),   
        fromUser: creator,
    };

    await sendPushNotification({ title, body, data, token, sendToUserSub: topicCreator?.sub });
}

export const setMyNotificationSettings = async ({ user, notifyPrompts, notifyReactions, notifyTrending }) => {
    const routePost =  
        `${REELAY_API_BASE_URL}/users/sub/${user?.sub}/settings?notifyPrompts=${notifyPrompts}&notifyReactions=${notifyReactions}&notifyTrending=${notifyTrending}`;
    const resultPost = await fetchResults(routePost, { 
        method: 'POST',
        headers: ReelayAPIHeaders,
    });
    return resultPost;
}
