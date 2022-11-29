import moment from "moment";
import Constants from 'expo-constants';

const LATEST_VERSION_GUIDE = require('../version/latest-version-guide.json');
const VERSION_GUIDE_IMG_PATH = '../version/images';
const LATEST_VERSION_GUIDE_IMAGES = [
    null,
    require(`${VERSION_GUIDE_IMG_PATH}/notification-settings-guide.png`),
]
const REELAY_APP_VERSION = Constants.manifest.version;

const isSameTitle = (title0, title1) => {
    return (title0.id === title1.id) && (title0.isSeries === title1.isSeries);
}

export const appleSessionReducer = (session) => {
    const { idToken, accessToken, refreshToken } = session;
    return { idToken, accessToken, refreshToken, method: 'apple' };
}

export const cognitoSessionReducer = (session) => {
    const idToken = session.idToken.jwtToken;
    const accessToken = session.accessToken.jwtToken;
    const refreshToken = session.refreshToken.token;
    return { idToken, accessToken, refreshToken, method: 'cognito' };
}

export const googleSessionReducer = (session) => {
    const { idToken, accessToken, refreshToken } = session;
    return { idToken, accessToken, refreshToken, method: 'google' };
}

export const dismissAnnouncementReducer = ({ announcement, dismissalHistory }) => {
    if (!announcement) return null;
    const announcementEntry = dismissalHistory?.announcementHistory?.[announcement?.id];
    const isDismissed = (announcementEntry && announcementEntry === 'dismissed');
    return (isDismissed) ? null : announcement;
}

export const dismissNoticeReducer = ({ notice, dismissalHistory }) => {
    if (!notice) return null;
    const noticeEntry = dismissalHistory?.noticeHistory?.[notice?.id];
    const isDismissed = (noticeEntry && noticeEntry === 'dismissed');
    return (isDismissed) ? null : notice;
}

export const latestAnnouncementReducer = ({ announcement, myFollowing, reelayDBUser }) => {
    const showAnnouncement = (announcement && !announcement?.error);
    if (showAnnouncement) return announcement;

    // const daysSinceSignedUp = moment().diff(moment(reelayDBUser?.createdAt), 'days');
    // const showTutorial = daysSinceSignedUp < 7;

    // if (showTutorial) return {
    //     id: 'tutorial-0',
    //     actionLabel: 'Welcome',
    //     actionData: {},
    //     actionType: 'advanceToWelcomeScreen',
    //     description: `Watch a quick video about how Reelay works`,
    //     reelaySub: Constants.manifest.extra.welcomeReelaySub,
    //     title: 'Welcome 😎🎬',
    // }
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

export const latestNoticeReducer = ({ 
    dismissalHistory,
    latestNotice, 
    myClubs, 
    myCreatorStacks, 
    userSub,
}) => {
    if (latestNotice) return latestNotice;
    const isClubOwner = (club) => (userSub === club?.creatorSub);
    const clubOwnerReducer = (curCount, nextClub) => isClubOwner(nextClub) ? curCount + 1 : curCount;
    const clubOwnerCount = myClubs.reduce(clubOwnerReducer, 0);

    const versionGuideID = LATEST_VERSION_GUIDE?.id;
    const maxVersion = LATEST_VERSION_GUIDE?.maxVersion;
    const minVersion = LATEST_VERSION_GUIDE?.minVersion;

    const versionGuideNoticeEntry = dismissalHistory?.noticeHistory?.[versionGuideID];
    const validVersion = (REELAY_APP_VERSION < maxVersion) && (REELAY_APP_VERSION >= minVersion);
    
    // holding off for version 1.05
    const showVersionGuide = false; // validVersion && (!versionGuideNoticeEntry || versionGuideNoticeEntry !== 'dismissed');
    const showCreateReelayNotice = false; // (myCreatorStacks.length === 0);
    const showCreateClubNotice = false; // (clubOwnerCount === 0);

    if (showVersionGuide) {
        return {
            id: versionGuideID,
            noticeType: 'multi-page',
            data: { 
                pages: LATEST_VERSION_GUIDE?.pages,
                images: LATEST_VERSION_GUIDE_IMAGES,
            },
        }
    } else if (showCreateReelayNotice) {
        return {
            id: 'create-reelay-summer',
            noticeType: 'single-page',
            data: {
                actionLabel: 'Create',
                actionType: 'advanceToCreateScreen',
                title: `It's summer 🏖️🌞`,
                body: 'Post a reelay about your favorite summer movie!',    
            },
        }
    } else if (showCreateClubNotice) {
        return {
            id: 'create-club-announce',
            noticeType: 'single-page',
            data: {
                actionLabel: 'Create',
                actionType: 'advanceToCreateClubScreen',
                title: `Start a club for your friends 📺`,
                body: 'Share reelays, start topics, and build watchlists privately.',    
            },
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

export const updateGuessingGameReducer = (homeGuessingGames, updatedGame) => {
    const matchGuessingGame = (nextGame) => nextGame?.id === updatedGame?.id;
    const updatedGameIndex = homeGuessingGames.content.findIndex(matchGuessingGame);
    if (updatedGameIndex === -1) {
        console.log('Game ID not found');
        return homeGuessingGames;
    }

    homeGuessingGames.content[updatedGameIndex] = updatedGame;
    return { ...homeGuessingGames };
}

export const sortByLastActivity = (club0, club1) => {
    const lastActivity0 = moment(club0?.lastActivityAt ?? club0?.createdAt);
    const lastActivity1 = moment(club1?.lastActivityAt ?? club1?.createdAt);
    return lastActivity1.diff(lastActivity0, 'seconds') > 0;
}

const sortWatchlistItems = (item0, item1) => {
    const item0Date = item0.lastMovedToFrontAt ?? item0.createdAt;
    const item1Date = item1.lastMovedToFrontAt ?? item1.createdAt;
    return item1Date > item0Date ? 1 : -1;
}

export const updateClubReducer = (myClubs, updatedClub) => {
    const myClubsFiltered = myClubs.filter(nextClub => nextClub.id !== updatedClub.id);
    const updatedClubObj = { ...updatedClub };
    updatedClubObj.memberCount = updatedClubObj?.members?.length;
    return [ updatedClubObj, ...myClubsFiltered].sort(sortByLastActivity);
}

export const updateWatchlistReducer = (myWatchlistItems, updatedItem) => {
    const myWatchlistItemsFiltered = myWatchlistItems.filter(item => item.id !== updatedItem.id);
    const updatedItemObj = { ...updatedItem };
    return [ updatedItemObj, ...myWatchlistItemsFiltered].sort(sortWatchlistItems);
}

export const watchlistRecsReducer = (watchlistItems) => {
    const sortedWatchlistItems = watchlistItems.sort(sortWatchlistItems);
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