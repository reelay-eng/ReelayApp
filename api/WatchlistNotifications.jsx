import { getRegisteredUser } from './ReelayDBApi';
import { condensedTitleObj, sendNotification } from './NotificationsApi';
import { shouldNotifyUser } from "./SettingsApi";

export const notifyOnAddedToWatchlist = async ({ reelayedByUserSub, addedByUserSub, addedByUsername, watchlistItem }) => {
    const shouldNotifyCreator = await shouldNotifyUser(reelayedByUserSub, "notifyMyRecommendationTaken");
    const shouldNotifyAdder = await shouldNotifyUser(addedByUserSub, "notifyCreatorRecommendationTaken");

    const shouldSendPushNotification = (shouldNotifyCreator && shouldNotifyAdder);

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
    return await sendNotification({ title, body, data, token: pushToken, sendToUserSub: reelayedByUserSub, shouldSendPushNotification });

}