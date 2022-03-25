import moment from "moment";

const byDateUpdated = (watchlistItem0, watchlistItem1) => {
    const dateAdded0 = moment(watchlistItem0.updatedAt);
    const dateAdded1 = moment(watchlistItem1.updatedAt);
    return dateAdded1.diff(dateAdded0, 'seconds');
}

const isSameTitle = (title0, title1) => {
    return (title0.id === title1.id) && (title0.isSeries === title1.isSeries);
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