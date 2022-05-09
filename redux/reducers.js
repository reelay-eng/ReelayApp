import moment from "moment";

function arrayMove(arr, fromIndex, toIndex) {
    // changes original array
    // slice *would* return a copy
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

const byDateUpdated = (watchlistItem0, watchlistItem1) => {
    const dateAdded0 = moment(watchlistItem0.updatedAt);
    const dateAdded1 = moment(watchlistItem1.updatedAt);
    return dateAdded1.diff(dateAdded0, 'seconds');
}

const isSameTitle = (title0, title1) => {
    return (title0.id === title1.id) && (title0.isSeries === title1.isSeries);
}

export const cognitoSessionReducer = (session) => {
    const idToken = session.idToken.jwtToken;
    const accessToken = session.accessToken.jwtToken;
    const refreshToken = session.refreshToken.token;
    return { idToken, accessToken, refreshToken };
}

export const stacksOnStreamingReducer = ({ stacksOnStreaming, streamingSubscriptions }) => {
    const subscribedVenues = streamingSubscriptions.map(subscription => subscription.platform);
    const bringReelayWithSubscribedVenueToFront = (reelayStack) => {
        const reelayFromSubscribedVenue = (reelay) => {
            if (!reelay?.content?.venue) return false;
            return subscribedVenues.includes(reelay.content.venue);
        }
        const firstIndexWithSubscribedPlatform = reelayStack.findIndex(reelayFromSubscribedVenue);

        if (firstIndexWithSubscribedPlatform !== -1) {
            arrayMove(reelayStack, firstIndexWithSubscribedPlatform, 0);
        }
        return reelayStack;
    };
    return stacksOnStreaming.map(bringReelayWithSubscribedVenueToFront);
}

export const watchlistRecsReducer = (watchlistItems) => {
    const sortedWatchlistItems = watchlistItems.sort(byDateUpdated);
    const uniqueWatchlistItems = sortedWatchlistItems.filter((nextItem, index, allItems) => {
        const { recommendedBySub, recommendedByUsername, recommendedReelaySub, title } = nextItem;
        let isFirstItemWithTitle = true;
        let prevItemSameTitle = null;

        // check all previous watchlist items
        allItems.slice(0, index).find((prevItem) => {
            // filter out items for the same title...
            if (isSameTitle(prevItem.title, title)) {
                isFirstItemWithTitle = false;
                prevItemSameTitle = prevItem;
                return true;
            }
            return false;
        });

        const recItem = (isFirstItemWithTitle) ? nextItem : prevItemSameTitle;
        if (!Array.isArray(recItem.recommendations)) recItem.recommendations = [];
        
        if (recommendedBySub) recItem.recommendations.push({ recommendedBySub, recommendedByUsername, recommendedReelaySub });
        return isFirstItemWithTitle;
    });
    return uniqueWatchlistItems;
}