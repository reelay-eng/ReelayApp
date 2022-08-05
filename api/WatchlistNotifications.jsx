import { getRegisteredUser } from './ReelayDBApi';
import { condensedTitleObj, sendPushNotification } from './NotificationsApi';
import { shouldNotifyUser } from "./SettingsApi";

export const notifyOnAddedToWatchlist = async ({ reelayedByUserSub, addedByUserSub, addedByUsername, watchlistItem }) => {
    const shouldNotifyCreator = await shouldNotifyUser(reelayedByUserSub, "notifyMyRecommendationTaken");
    const shouldNotifyAdder = await shouldNotifyUser(addedByUserSub, "notifyCreatorRecommendationTaken");

    if (!shouldNotifyCreator) {
        console.log(`Creator does not want to receive notifications for watchlist adds from their reelays.`);
        return;
    }
    if (!shouldNotifyAdder) {
        console.log(`Watchlister does not want to notify creator when they add to their watchlist from a reelay`);
        return;
    }

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