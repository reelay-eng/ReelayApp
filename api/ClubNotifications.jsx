import { getClubMembers } from './ClubsApi';
import { condensedTitleObj, sendPushNotification } from './NotificationsApi';
import { getRegisteredUser } from './ReelayDBApi';

const condensedClubObj = ({ id, name }) => {
    return { id, name };
}

const condensedTopicObj = ({ id, title, description }) => {
    return { id, title, description };
};

const notifyClubMember = async ({ title, body, data, clubMember }) => {
    console.log('notifying club member: ', clubMember, data);
    const clubMemberWithToken = await getRegisteredUser(clubMember?.userSub);
    const sendToUserSub = clubMember?.userSub;
    const token = clubMemberWithToken?.pushToken;
    if (!token) return;
    console.log('notified');
    await sendPushNotification({ title, body, data, token, sendToUserSub });
}

export const notifyClubOnTitleAdded = async ({ club, clubTitle, addedByUser }) => {
    const title = `${addedByUser?.username}`;
    const body = `added a new title to ${club.name}: ${clubTitle.title.display}`;
    const data = {        
        action: 'openClubActivityScreen',
        club: condensedClubObj(club),
        title: condensedTitleObj(clubTitle?.title),
        notifyType: 'notifyClubOnTitleAdded', 
        fromUser: { sub: addedByUser?.sub, username: addedByUser?.username },
    };

    await Promise.all(club.members.map((clubMember) => {
        if (clubMember?.role === 'banned') return;
        if (clubMember?.userSub === addedByUser?.sub) return;
        notifyClubMember({ title, body, data, clubMember });
    }));
}

export const notifyClubOnTopicAdded = async ({ club, topic, addedByUser }) => {
    const title = `${addedByUser?.username}`;
    const body = `added a new topic to ${club.name}: ${topic?.title}`;
    const data = {        
        action: 'openClubActivityScreen',
        club: condensedClubObj(club),
        topic: condensedTopicObj(topic),
        notifyType: 'notifyClubOnTopicAdded', 
        fromUser: { sub: addedByUser?.sub, username: addedByUser?.username },
    };

    await Promise.all(club.members.map((clubMember) => {
        if (clubMember?.role === 'banned') return;
        if (clubMember?.userSub === addedByUser?.sub) return;
        notifyClubMember({ title, body, data, clubMember });
    }));
}


export const notifyNewMemberOnClubInvite = async ({ club, newMember, invitedByUser }) => {
    const title = `${invitedByUser?.username}`;
    const body = `added you to a club on reelay: ${club.name}`;
    const data = {        
        action: 'openClubActivityScreen',
        club: condensedClubObj(club),
        notifyType: 'notifyNewMemberOnClubInvite', 
        fromUser: { sub: invitedByUser?.sub, username: invitedByUser?.username },
    };

    const newMemberWithToken = await getRegisteredUser(newMember?.sub);
    const sendToUserSub = newMember?.sub;
    const token = newMemberWithToken?.pushToken;
    if (!token) return;

    await sendPushNotification({ title, body, data, token, sendToUserSub });
}

export const notifyClubTitleThreadOnNewReelay = async ({ club, clubTitle, creator, reelay }) => {
    const title = `${creator?.username}`;
    const body = `added a new reelay to ${club.name}: ${clubTitle.title.display}`;
    const data = {        
        action: 'openClubActivityScreen',
        club: condensedClubObj(club),
        notifyType: 'notifyClubTitleThreadOnNewReelay', 
        reelaySub: reelay?.sub,
        fromUser: { sub: creator?.sub, username: creator?.username },
    };

    const notifyThreadMemberOnReelayAdded = async ({ title, body, data, threadMember }) => {
        const threadMemberWithToken = await getRegisteredUser(threadMember?.sub);
        const sendToUserSub = threadMember?.sub;
        const token = threadMemberWithToken?.pushToken;
        if (!token) return;
        await sendPushNotification({ title, body, data, token, sendToUserSub });
    }

    await Promise.all(clubTitle.reelays.map((reelay) => {
        // todo: don't notify banned members
        const threadMember = { sub: reelay.creatorSub, username: reelay.creatorName };
        notifyThreadMemberOnReelayAdded({ title, body, data, threadMember });
    }));
}

export const notifyClubTopicThreadOnNewReelay = async ({ club, clubTitle, creator, reelay }) => {
    // todo
}