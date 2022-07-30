import { getRegisteredUser } from './ReelayDBApi';
import { condensedTitleObj, sendPushNotification } from './NotificationsApi';

export const notifyOnAddedToWatchlist = async ({ reelayedByUserSub, addedByUserSub, addedByUsername, watchlistItem }) => {
    const title = `${addedByUsername}`;
    const body = `added ${watchlistItem?.title?.display} to their watchlist from your reelay`;
    const data = { 
        notifyType: 'notifyOnAddedToWatchlist',
        action: 'openSingleReelayScreen',
        reelaySub: watchlistItem?.recommendedReelaySub,
        title: condensedTitleObj(watchlistItem.title),
        fromUser: { sub: addedByUserSub, username: addedByUsername },
    };
    console.log('notify data: ', data);
    const { pushToken } = await getRegisteredUser(reelayedByUserSub);
    return await sendPushNotification({ title, body, data, token: pushToken, sendToUserSub: reelayedByUserSub });

}