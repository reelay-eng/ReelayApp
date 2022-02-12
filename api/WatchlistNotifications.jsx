import { getRegisteredUser } from './ReelayDBApi';
import { sendPushNotification } from './NotificationsApi';

export const notifyOnAcceptRec = async ({ acceptUserSub, acceptUsername, recUserSub, watchlistItem }) => {
    const title = `${acceptUsername} accepted your rec!`;
    const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear}) is now in their watchlist`;

    const data = { 
        action: 'openUserProfileScreen',
        user: { sub: acceptUserSub, username: recUserSub },
    };
    const { pushToken } = await getRegisteredUser(recUserSub);
    return await sendPushNotification({ title, body, data, token: pushToken, sendToUserSub: recUserSub });
}

export const notifyOnSendRec = async ({ reqUserSub, reqUsername, sendToUserSub, watchlistItem }) => {
    const title = `${reqUsername} sent you a rec!`;
    const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear})`;

    const data = { action: 'openMyRecs', newItems: [watchlistItem] };
    const { pushToken } = await getRegisteredUser(sendToUserSub);
    return await sendPushNotification({ title, body, data, token: pushToken, sendToUserSub });
}

export const notifyOnReelayedRec = async ({ creatorName, reelay, watchlistItems }) => {
    const notifyWatchlistItems = watchlistItems.filter((item) => {
        const { recommendedBySub, tmdbTitleID, titleType } = item;
        return (reelay.tmdbTitleID === tmdbTitleID 
            && reelay.isSeries === (titleType === 'tv')
            && recommendedBySub);
    });

    const pushNotificationResults = await Promise.all(
        notifyWatchlistItems.map(async (watchlistItem) => {
            try {
                const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear})`;
                const data = { 
                    action: 'openSingleReelayScreen',
                    reelaySub: reelay.datastoreSub,
                };
            
                const { recommendedBySub } = watchlistItem;
                const { pushToken } = await getRegisteredUser(recommendedBySub);    
                const title = `${creatorName} reelayed a title you recommended!`;
                return await sendPushNotification({ title, body, data, token: pushToken, sendToUserSub: recommendedBySub });    
            } catch (error) {
                return { error };
            }
        })
    );

    return pushNotificationResults;
}
