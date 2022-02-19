import { getRegisteredUser } from './ReelayDBApi';
import { condensedTitleObj, sendPushNotification } from './NotificationsApi';

export const notifyOnAcceptRec = async ({ acceptUserSub, acceptUsername, recUserSub, watchlistItem }) => {
    const title = `@${acceptUsername} accepted your rec.`;
    // const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear}) is now in their watchlist`;
    const body = '';
    const data = { 
        notifyType: 'notifyOnAcceptRec',
        action: 'openUserProfileScreen',
        title: condensedTitleObj(watchlistItem.title),
        fromUser: { sub: acceptUserSub, username: acceptUsername },
    };
    const { pushToken } = await getRegisteredUser(recUserSub);
    return await sendPushNotification({ title, body, data, token: pushToken, sendToUserSub: recUserSub });
}

export const notifyOnSendRec = async ({ reqUserSub, reqUsername, sendToUserSub, watchlistItem }) => {
    const title = `@${reqUsername} sent you a rec.`;
    // const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear})`;
    const body = '';
    const condensedWatchlistItem = {
        ...watchlistItem,
        title: condensedTitleObj(watchlistItem.title)
    };

    console.log('Condensed watchlist item: ', condensedWatchlistItem);
    const { recommendedReelaySub } = watchlistItem;

    const data = { 
        notifyType: 'notifyOnSendRec',
        action: (recommendedReelaySub) ? 'openSingleReelayScreen' : 'openMyRecs', 
        fromUser: { sub: reqUserSub, username: reqUsername },
        // this duplicity saves logic on the other end
        newWatchlistItem: condensedWatchlistItem,
        reelaySub: recommendedReelaySub,
        title: condensedTitleObj(watchlistItem.title), 
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
                // const body = `${watchlistItem.title.display} (${watchlistItem.title.releaseYear})`;
                const body = '';
                const data = { 
                    notifyType: 'notifyOnReelayedRec',
                    action: 'openSingleReelayScreen',
                    reelaySub: reelay.datastoreSub,
                    title: condensedTitleObj(item.title),
                    fromUser: { sub: creatorSub, username: creatorName },
                };
            
                const { recommendedBySub } = watchlistItem;
                const { pushToken } = await getRegisteredUser(recommendedBySub);    
                const title = `@${creatorName} reelayed a title you recommended.`;
                return await sendPushNotification({ title, body, data, token: pushToken, sendToUserSub: recommendedBySub });    
            } catch (error) {
                return { error };
            }
        })
    );

    return pushNotificationResults;
}
