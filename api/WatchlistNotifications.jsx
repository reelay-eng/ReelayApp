import { getRegisteredUser } from './ReelayDBApi';
import { sendPushNotification } from './NotificationsApi';

export const notifyOnAcceptRec = async ({ acceptUserSub, acceptUsername, recUserSub, watchlistItem }) => {
    const title = `${acceptUsername} accepted your recommendation!`;
    const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear}) is now in their watchlist`;

    const data = { 
        action: 'openUserProfileScreen',
        user: { sub: acceptUserSub, username: recUserSub },
    };
    const { pushToken } = await getRegisteredUser(recUserSub);
    return await sendPushNotification({ title, body, data, token: pushToken });
}

// maybe don't use this one
export const notifyOnAddToWatchlist = async ({ reqUserSub, reqUsername, creatorSub, watchlistItem }) => {
    const title = `${watchlistItem?.title?.display} (${watchlistItem?.title?.releaseYear}) added to a watchlist!`;
    const body = `${reqUsername} added from your reelay`;

    const data = { 
        action: 'openSingleReelayScreen',
        reelaySub: watchlistItem?.recommendedReelaySub,
    };

    const { pushToken } = await getRegisteredUser(creatorSub);
    console.log(user);
    return await sendPushNotification({ title, body, data, token: pushToken });
}

export const notifyOnSendRec = async ({ reqUserSub, reqUsername, sendToUserSub, watchlistItem }) => {
    const title = `${reqUsername} sent you a recommendation`;
    const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear})`;

    // todo: if the title is already in your watchlist, should say:
    // "${reqUsername} also recommended..." 
    const data = { action: 'openMyRecs' };
    const { pushToken } = await getRegisteredUser(sendToUserSub);
    return await sendPushNotification({ title, body, data, token: pushToken });
}

export const notifyOnReelayedRec = async ({ creatorSub, creatorName, recUserSub, reelaySub }) => {
    const title = `${creatorName} reelayed a title you recommended!`;
    const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear})`;

    const data = { 
        action: 'openSingleReelayScreen',
        reelaySub: reelaySub,
    };

    const { pushToken } = await getRegisteredUser(recUserSub);
    return await sendPushNotification({ title, body, data, token: pushToken });
}

