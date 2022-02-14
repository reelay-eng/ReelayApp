import { getRegisteredUser } from './ReelayDBApi';
import { sendPushNotification } from './NotificationsApi';

export const notifyOnAcceptRec = async ({ acceptUserSub, acceptUsername, recUserSub, watchlistItem }) => {
    const title = `${acceptUsername} accepted your rec!`;
    const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear}) is now in their watchlist`;

    const data = { 
        notifyType: 'notifyOnAcceptRec',
        action: 'openUserProfileScreen',
        user: { sub: acceptUserSub, username: recUserSub },
    };
    const { pushToken } = await getRegisteredUser(recUserSub);
    return await sendPushNotification({ title, body, data, token: pushToken, sendToUserSub: recUserSub });
}

export const notifyOnSendRec = async ({ reqUserSub, reqUsername, sendToUserSub, watchlistItem }) => {
    const title = `${reqUsername} sent you a rec!`;
    const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear})`;

    const data = { 
        notifyType: 'notifyOnSendRec',
        action: 'openMyRecs', 
        newItems: [watchlistItem],

        altAction: 'openUserProfileScreen',
        user: { sub: reqUserSub, username: reqUsername },
    };
    const { pushToken } = await getRegisteredUser(sendToUserSub);
    return await sendPushNotification({ title, body, data, token: pushToken, sendToUserSub });
}

export const notifyOnReelayedRec = async ({ creatorName, creatorSub, reelay, watchlistItems }) => {
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
                    notifyType: 'notifyOnReelayedRec',
                    action: 'openSingleReelayScreen',
                    reelaySub: reelay.datastoreSub,

                    altAction: 'openUserProfileScreen',
                    user: { sub: creatorSub, username: creatorName },
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
