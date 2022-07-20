import moment from "moment";
import Constants from 'expo-constants';

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

export const announcementDismissalReducer = ({ announcement, dismissalHistory }) => {
    if (!announcement) return null;
    const announcementEntry = dismissalHistory?.announcementHistory?.[announcement?.id];
    const isDismissed = (announcementEntry && announcementEntry === 'dismissed');
    return (isDismissed) ? null : announcement;
}

export const cognitoSessionReducer = (session) => {
    const idToken = session.idToken.jwtToken;
    const accessToken = session.accessToken.jwtToken;
    const refreshToken = session.refreshToken.token;
    return { idToken, accessToken, refreshToken };
}

export const latestAnnouncementReducer = ({ announcement, myFollowing, reelayDBUser }) => {
    const showAnnouncement = (announcement && !announcement?.error);
    if (showAnnouncement) return announcement;

    const daysSinceSignedUp = moment().diff(moment(reelayDBUser?.createdAt), 'days');
    const showTutorial = (myFollowing.length > 0) && (daysSinceSignedUp < 7);

    if (showTutorial) return {
        id: 'tutorial-0',
        actionLabel: 'Welcome',
        actionData: {},
        actionType: 'advanceToWelcomeScreen',
        description: `Watch a quick video about how Reelay works`,
        reelaySub: Constants.manifest.extra.welcomeReelaySub,
        title: 'Welcome 😎🎬',
    }
    return null;
}

export const latestClubActivitiesReducer = (myClubs) => {
    const sortByLastUpdated = (activity0, activity1) => {
        const lastActivity0 = moment(activity0?.lastUpdatedAt ?? activity0.createdAt);
        const lastActivity1 = moment(activity1?.lastUpdatedAt ?? activity1.createdAt);
        return lastActivity1.diff(lastActivity0, 'seconds');
    }

    const addClubActivities = (activities, club) => {
        activities.push(...club.titles);
        activities.push(...club.topics);
        activities.push(...club.members);
        return activities;
    }

    const allClubActivities = myClubs.reduce(addClubActivities, []);
    return allClubActivities.sort(sortByLastUpdated);
}

export const latestNoticeReducer = ({ latestNotice, myClubs, myCreatorStacks, userSub }) => {
    if (latestNotice) return latestNotice;
    const isClubOwner = (club) => (userSub === club?.creatorSub);
    const clubOwnerReducer = (curCount, nextClub) => isClubOwner(nextClub) ? curCount + 1 : curCount;
    const clubOwnerCount = myClubs.reduce(clubOwnerReducer, 0);

    const showCreateReelayNotice = (myCreatorStacks.length === 0);
    const showCreateClubNotice = (!showCreateReelayNotice) && (clubOwnerCount === 0);

    if (showCreateReelayNotice) {
        return {
            id: 'create-reelay-summer',
            actionLabel: 'Create',
            actionData: {},
            actionType: 'advanceToCreateScreen',
            title: `It's summer 🏖️🌞`,
            description: 'Post a reelay about your favorite summer movie!',
        }
    } else if (showCreateClubNotice) {
        return {
            id: 'create-club-announce',
            actionLabel: 'Create',
            actionData: {},
            actionType: 'advanceToCreateClubScreen',
            title: `Start a club for your friends 📺`,
            description: 'Share reelays, start topics, and build watchlists privately.',
        }
    } else {
        return null;
    }
}


// max 1 reelay per creator per day
export const getMyStacksFollowingDaily = (myStacksFollowing) => {
    if (!myStacksFollowing) return [];
    const replaceMostRecent = (nextReelay, curReelay) => {
        // positive: nextReelay is more recent
        return moment(nextReelay?.createdAt).diff(moment(curReelay?.createdAt), 'seconds') > 0;
    }

    const creatorDayEntries = {};
    for (const stack of myStacksFollowing) {
        for (const nextReelay of stack) {
            const creatorDayKey = nextReelay?.creator?.sub + moment().dayOfYear().toString();
            const curReelay = creatorDayEntries[creatorDayKey];
            if (!curReelay || replaceMostRecent(nextReelay, curReelay)) {
                creatorDayEntries[creatorDayKey] = nextReelay;
            }
        }
    }    

    const withOnlyDailyEntries = (stack) => {
        return stack.filter(nextReelay => {
            const creatorDayKey = nextReelay?.creator?.sub + moment().dayOfYear().toString();
            const curReelay = creatorDayEntries[creatorDayKey];
            return curReelay?.sub === nextReelay?.sub;
        });
    }

    const hasReelays = (stack) => stack.length > 0;
    const myStacksFollowingDaily = myStacksFollowing.map(withOnlyDailyEntries).filter(hasReelays);
    return myStacksFollowingDaily;
}

export const noticeDismissalReducer = ({ notice, dismissalHistory }) => {
    if (!notice) return null;
    const noticeEntry = dismissalHistory?.noticeHistory?.[notice?.id];
    const isDismissed = (noticeEntry && noticeEntry === 'dismissed');
    console.log('notice entry: ', noticeEntry);
    return (isDismissed) ? null : notice;
}

export const sortByLastActivity = (club0, club1) => {
    const lastActivity0 = moment(club0?.lastActivityAt ?? club0?.createdAt);
    const lastActivity1 = moment(club1?.lastActivityAt ?? club1?.createdAt);
    return lastActivity1.diff(lastActivity0, 'seconds') > 0;
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

export const updateClubReducer = (myClubs, updatedClub) => {
    const myClubsFiltered = myClubs.filter(nextClub => nextClub.id !== updatedClub.id);
    const updatedClubObj = { ...updatedClub };
    updatedClubObj.memberCount = updatedClubObj?.members?.length;
    return [ updatedClubObj, ...myClubsFiltered].sort(sortByLastActivity);
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