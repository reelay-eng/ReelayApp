import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

/**
 * recentReelaysCache:
 *      [ {
 *          reelay: { sub, creator, tmdbTitleID, isSeries },
 *          addedAt: moment,
 *          lastAccessedAt: moment,
 *      ]
 *      
 * recentTitlesCache:
 *      [ {
 *          title: { fetchAnnotatedTitle(tmdbTitleID, isSeries) },
 *          addedAt: moment,
 *          lastAccessedAt: moment,
 *      ]
 * 
 * 
 */

export const checkShouldMarkSeen = async ({ reelay, reelayDBUser, myFollowing }) => {
    const [alreadyFollowing, isMyProfile] = getRelationship({ reelay, reelayDBUser, myFollowing });    
    const lastReelayMarkedSeen = await getLastReelayMarkedSeen();
    const isNewer = isNewerReelay(reelay, lastReelayMarkedSeen);
    console.log('is newer? ', isNewer);
    const shouldMarkAsSeen = (!isMyProfile && !alreadyFollowing && isNewer);
    console.log('checking should mark seen...', isMyProfile, alreadyFollowing, isNewer);
    if (shouldMarkAsSeen) {
        console.log('should mark as seen: ', reelayDBUser?.username);
        markReelayAsSeen(reelay);
    }
}

export const checkForUnseenGlobalReelays = async ({ globalStacks, reelayDBUser, myFollowing }) => {
    const lastReelayMarkedSeen = await getLastReelayMarkedSeen();

    // check if top of stack is unread
    const getUnreadReelays = (reelayStack) => {
        const reelay = reelayStack[0];
        const [alreadyFollowing, isMyProfile] = getRelationship({ reelay, reelayDBUser, myFollowing });    
        const isNewer = isNewerReelay(reelay, lastReelayMarkedSeen);
        const shouldMarkAsUnread = (!isMyProfile && !alreadyFollowing && isNewer);
        return (shouldMarkAsUnread) ? reelay : null;
    }

    const unreadReelays = globalStacks.map(getUnreadReelays);
    return !!unreadReelays.find((unreadReelay) => {
        if (unreadReelay) {
            markReelayAsSeen(unreadReelay);
            return true;
        }
        return false;
    });

}

const getLastReelayMarkedSeen = async () => {
    try {
        const lastReelayMarkedSeenJSON = await AsyncStorage.getItem('lastReelayMarkedSeen');
        if (!lastReelayMarkedSeenJSON) return null;
        return JSON.parse(lastReelayMarkedSeenJSON);
    } catch {
        console.log(error);
        return null;
    }
}

const getRelationship = ({ reelay, reelayDBUser, myFollowing }) => {
    const isSameUser = (userObj0, userObj1) => (userObj0.sub === userObj1.sub);
    const iAmFollowing = (userObj) => isSameUser(userObj, reelay.creator);

    const isMyProfile = isSameUser(reelayDBUser, reelay.creator);
    const alreadyFollowing = myFollowing.findIndex(iAmFollowing) >= 0;
    return [alreadyFollowing, isMyProfile];
}

const isNewerReelay = (thisReelay, lastReelay) => {
    try {
        if (!lastReelay?.postedDateTime) return true;
        const lastReelayCreatedAt = moment(lastReelay?.postedDateTime);
        const thisReelayCreatedAt = moment(thisReelay?.postedDateTime);
        // date comparison: newer is larger
        return (thisReelayCreatedAt.diff(lastReelayCreatedAt, 'seconds') > 0);
    } catch (error) {
        console.log(error);
        return false;
    }
}

const markReelayAsSeen = async (reelay) => {
    const { creator, postedDateTime, sub } = reelay;
    console.log('created at: ', reelay.postedDateTime);
    const condensedReelay = { creator, postedDateTime, sub };
    const reelayMarkedSeenJSON = JSON.stringify(condensedReelay);
    console.log('marking reelay as seen: ', condensedReelay);
    await AsyncStorage.setItem('lastReelayMarkedSeen', reelayMarkedSeenJSON);
}
