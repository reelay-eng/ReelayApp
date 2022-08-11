import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, ScrollView, Switch, Linking, Pressable, RefreshControl } from 'react-native';

// Context
import { AuthContext } from '../../context/AuthContext';

// API
import { getUserSettings, updateMySettings } from '../../api/SettingsApi';

// Styling
import styled from "styled-components/native";
import * as ReelayText from "../../components/global/Text";
import { HeaderWithBackButton } from "../global/Headers";
import ReelayColors from '../../constants/ReelayColors';
import { useDispatch, useSelector } from 'react-redux';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { showErrorToast } from '../utils/toasts';

const Spacer = styled(View)`
    height: 16px;
`
const ViewContainer = styled(View)`
        width: 100%;
        height: 100%;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
    `

export default NotificationSettings = ({ navigation }) => {
    const mySettings = useSelector(state => state.mySettings);
    const { reelayDBUser } = useContext(AuthContext);
    const mySub = reelayDBUser?.sub;

    return (
        <ViewContainer>
            <HeaderWithBackButton navigation={navigation} text="Notification Settings"/>
            <Spacer />
            <NotificationsSettingsWrapper mySub={mySub} mySettings={mySettings}/>
        </ViewContainer>
    )
}

const NotificationSettingsScrollView = styled(ScrollView)`
    width: 95%;
    height: 100%;
`;
const Divider = styled(View)`
    border-bottom-width: 1px;
    border-bottom-color: #2e2e2e;
    border-style: solid;
    height: 1px;
    opacity: 0.7;
    width: 98%;
    margin-top: 5px;
    margin-bottom: 5px;
`;

const NotificationsSettingsWrapper = ({ mySub, mySettings }) => {

    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);

    const toggleSetting = async (settingToUpdate) => {
        const oldSetting = !!mySettings[settingToUpdate];
        const mySettingsToUpdate = { [settingToUpdate]: !oldSetting }
        const res = await updateMySettings({ mySub, oldSettings: mySettings, settingsToUpdate: mySettingsToUpdate });
        if (res.error) {
            console.log(res.error);
            showErrorToast("Ruh roh! I couldn't update your mySettings. Try again?");
        }
        dispatch({ type: "updateMySettings", payload: mySettingsToUpdate });

    }

    const notificationsEnabled = !!(mySettings?.notificationsEnabled); // coerce to boolean, so (undefined | false | null) -> false
    const toggleNotificationsEnabled = async () => {
        await toggleSetting("notificationsEnabled");
    }

    const onRefresh = async () => {
        setRefreshing(true);
        const mySettingsWrapped = await getUserSettings(mySub);
        const mySettingsJSON = mySettingsWrapped?.settingsJSON
        const mySettings = JSON.parse(mySettingsJSON);
        dispatch({ type: "setMySettings", payload: mySettings });
        setRefreshing(false);
    }

    const settingsRefreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    return (
        <NotificationSettingsScrollView refreshControl={settingsRefreshControl} scrollEnabled={true} contentContainerStyle={{ alignItems: "center", display: 'flex', flexDirection: 'column' }} scr>
            <AllowNotificationsSetting enabled={notificationsEnabled} toggle={toggleNotificationsEnabled}/>
            <Divider />
            { notificationsEnabled && (
                <>
                    <FollowsNotificationCategory mySettings={mySettings} toggleSetting={toggleSetting} />
                    <Divider />
                    <CommentsNotificationCategory mySettings={mySettings} toggleSetting={toggleSetting} />
                    <Divider />
                    <LikesNotificationCategory mySettings={mySettings} toggleSetting={toggleSetting} />
                    <Divider />
                    <TagsNotificationCategory mySettings={mySettings} toggleSetting={toggleSetting} />
                    <Divider />
                    <ReelaysNotificationCategory mySettings={mySettings} toggleSetting={toggleSetting} />
                    <Divider />
                    <WatchlistsNotificationCategory mySettings={mySettings} toggleSetting={toggleSetting} />
                    <Divider />
                    <InvitesNotificationCategory mySettings={mySettings} toggleSetting={toggleSetting} />
                </>
            )}
        </NotificationSettingsScrollView>
    )
}

const AllowNotificationsSetting = ({ enabled, toggle }) => {
    return (
        <NotificationSetting
            title="Allow all notifications" 
            isToggled={enabled}
            toggleFunction={toggle}
        />
    )
}

const CategoryContainer = styled(View)`
    width: 100%;
    margin-top: 15px;
`

const CategoryHeaderText = styled(ReelayText.H5Bold)`
    align-self: flex-start;
    color: white;
    font-size: 18px;
    padding-bottom: 8px;
`

const FollowsNotificationCategory = ({ mySettings, toggleSetting }) => {
    const Follows = () => {
        const notifyFollows = !!(mySettings?.notifyFollows);
        const toggleNotifyFollows = async () => {
            await toggleSetting("notifyFollows");
        }
        return (
            <NotificationSetting
                    title="On new followers" 
                    subtext="Notify me when people follow me"
                    isToggled={notifyFollows}
                    toggleFunction={toggleNotifyFollows}
            />
        )
    }

    return (
        <CategoryContainer>
            <CategoryHeaderText>Follows</CategoryHeaderText>
            <Follows />
        </CategoryContainer>
    )
}

const CommentsNotificationCategory = ({ mySettings, toggleSetting }) => {
    const CommentsOnMyReelays = () => {
        const notifyCommentsOnMyReelays = !!(mySettings?.notifyCommentsOnMyReelays);
        const toggleNotifyCommentsOnMyReelays = async () => {
            await toggleSetting("notifyCommentsOnMyReelays");
        }
        return (
            <NotificationSetting
                title="On my reelays" 
                subtext="Notify me when people comment on my posts"
                isToggled={notifyCommentsOnMyReelays}
                toggleFunction={toggleNotifyCommentsOnMyReelays}
            />
        )
    }

    const CommentsOnOtherReelays = () => {
        const notifyCommentsOnOtherReelays = !!(mySettings?.notifyCommentsOnOtherReelays);
        const toggleNotifyCommentsOnOtherReelays = async () => {
            await toggleSetting("notifyCommentsOnOtherReelays");
        }
        return (
            <NotificationSetting
                    title="On other reelays" 
                    subtext="Notify me when people comment after I do"
                    isToggled={notifyCommentsOnOtherReelays}
                    toggleFunction={toggleNotifyCommentsOnOtherReelays}
            />
        )
    }

    return (
        <CategoryContainer>
            <CategoryHeaderText>Comments</CategoryHeaderText>
            <CommentsOnMyReelays />
            <CommentsOnOtherReelays />
        </CategoryContainer>
    )
}

const LikesNotificationCategory = ({ mySettings, toggleSetting }) => {
    const LikesOnMyReelays = () => {
        const notifyLikesOnMyReelays = !!(mySettings?.notifyLikesOnMyReelays);
        const toggleNotifyLikesOnMyReelays = async () => {
            await toggleSetting("notifyLikesOnMyReelays");
        }
        return (
            <NotificationSetting
                title="On my reelays" 
                subtext="Notify me when people like my post"
                isToggled={notifyLikesOnMyReelays}
                toggleFunction={toggleNotifyLikesOnMyReelays}
            />
        )
    }

    const LikesOnMyComments = () => {
        const notifyLikesOnMyComments = !!(mySettings?.notifyLikesOnMyComments);
        const toggleNotifyLikesOnMyComments = async () => {
            await toggleSetting("notifyLikesOnMyComments");
        }
        return (
            <NotificationSetting
                title="On my comments" 
                subtext="Notify me when people like my comments"
                isToggled={notifyLikesOnMyComments}
                toggleFunction={toggleNotifyLikesOnMyComments}
            />
        )
    }

    return (
        <CategoryContainer>
            <CategoryHeaderText>Likes</CategoryHeaderText>
            <LikesOnMyReelays />
            <LikesOnMyComments />
        </CategoryContainer>
    )
}

const TagsNotificationCategory = ({ mySettings, toggleSetting }) => {
    const TagsInReelays = () => {
        const notifyTagsInReelays = !!(mySettings?.notifyTagsInReelays);
        const toggleNotifyTagsInReelays = async () => {
            await toggleSetting("notifyTagsInReelays");
        }
        return (
            <NotificationSetting
                title="In reelays" 
                subtext="Notify me when people tag me in their posts"
                isToggled={notifyTagsInReelays}
                toggleFunction={toggleNotifyTagsInReelays}
            />
        )
    }

    const TagsInComments = () => {
        const notifyTagsInComments = !!(mySettings?.notifyTagsInComments);
        const toggleNotifyTagsInComments = async () => {
            await toggleSetting("notifyTagsInComments");
        }
        return (
            <NotificationSetting
                title="In comments" 
                subtext="Notify me when people tag me in comments"
                isToggled={notifyTagsInComments}
                toggleFunction={toggleNotifyTagsInComments}
            />
        )
    }

    return (
        <CategoryContainer>
            <CategoryHeaderText>Tags</CategoryHeaderText>
            <TagsInReelays />
            <TagsInComments />
        </CategoryContainer>
    )
}

const ReelaysNotificationCategory = ({ mySettings, toggleSetting }) => {
    const PostsOnMyReelayedTitles = () => {
        const notifyPostsOnMyReelayedTitles = !!(mySettings?.notifyPostsOnMyReelayedTitles);
        const toggleNotifyPostsOnMyReelayedTitles = async () => {
            await toggleSetting("notifyPostsOnMyReelayedTitles");
        }
        return (
            <NotificationSetting
                title="Posts about titles I reelayed" 
                subtext="Notify me when other people reelay a title after I do"
                isToggled={notifyPostsOnMyReelayedTitles}
                toggleFunction={toggleNotifyPostsOnMyReelayedTitles}
            />
        )
    }

    const PostsInMyClubs = () => {
        const notifyPostsInMyClubs = !!(mySettings?.notifyPostsInMyClubs);
        const toggleNotifyPostsInMyClubs = async () => {
            await toggleSetting("notifyPostsInMyClubs");
        }
        return (
            <NotificationSetting
                title="Posts in my clubs" 
                subtext="Notify me when other people post in one of my clubs"
                isToggled={notifyPostsInMyClubs}
                toggleFunction={toggleNotifyPostsInMyClubs}
            />
        )
    }

    const PostsInMyTopics = () => {
        const notifyPostsInMyTopics = !!(mySettings?.notifyPostsInMyTopics);
        const toggleNotifyPostsInMyTopics = async () => {
            await toggleSetting("notifyPostsInMyTopics");
        }
        return (
            <NotificationSetting
                title="Posts in my topics" 
                subtext="Notify me when other people post in a topic I created"
                isToggled={notifyPostsInMyTopics}
                toggleFunction={toggleNotifyPostsInMyTopics}
            />
        )
    }

    const PostsInOtherTopics = () => {
        const notifyPostsInOtherTopics = !!(mySettings?.notifyPostsInOtherTopics);
        const toggleNotifyPostsInOtherTopics = async () => {
            await toggleSetting("notifyPostsInOtherTopics");
        }
        return (
            <NotificationSetting
                title="Posts in other topics" 
                subtext="Notify me when other people post in a topic after I do"
                isToggled={notifyPostsInOtherTopics}
                toggleFunction={toggleNotifyPostsInOtherTopics}
            />
        )
    }

    return (
        <CategoryContainer>
            <CategoryHeaderText>Reelays</CategoryHeaderText>
            <PostsOnMyReelayedTitles />
            <PostsInMyClubs />
            <PostsInMyTopics />
            <PostsInOtherTopics />
        </CategoryContainer>
    )
}

const WatchlistsNotificationCategory = ({ mySettings, toggleSetting }) => {
    const WatchlistsCreatorRecommendationTaken = () => {
        const notifyCreatorRecommendationTaken = !!(mySettings?.notifyCreatorRecommendationTaken);
        const toggleNotifyCreatorRecommendationTaken = async () => {
            await toggleSetting("notifyCreatorRecommendationTaken");
        }
        return (
            <NotificationSetting
                    title="When I take a rec" 
                    subtext="Notify creators when I add titles to my watchlist from their reelays"
                    isToggled={notifyCreatorRecommendationTaken}
                    toggleFunction={toggleNotifyCreatorRecommendationTaken}
            />
        )
    }

    const WatchlistsMyRecommendationTaken = () => {
        const notifyMyRecommendationTaken = !!(mySettings?.notifyMyRecommendationTaken);
        const toggleNotifyMyRecommendationTaken = async () => {
            await toggleSetting("notifyMyRecommendationTaken");
        }
        return (
            <NotificationSetting
                    title="When people take my rec" 
                    subtext="Notify me when people add titles to their watchlist from my reelays"
                    isToggled={notifyMyRecommendationTaken}
                    toggleFunction={toggleNotifyMyRecommendationTaken}
            />
        )
    }

    return (
        <CategoryContainer>
            <CategoryHeaderText>Watchlists</CategoryHeaderText>
            <WatchlistsCreatorRecommendationTaken />
            <WatchlistsMyRecommendationTaken />
        </CategoryContainer>
    )
}

const InvitesNotificationCategory = ({ mySettings, toggleSetting }) => {
    const ClubInvites = () => {
        const notifyClubInvites = !!(mySettings?.notifyClubInvites);
        const toggleNotifyClubInvites = async () => {
            await toggleSetting("notifyClubInvites");
        }
        return (
            <NotificationSetting
                    title="Clubs" 
                    subtext="Notify me when someone invites me to a club."
                    isToggled={notifyClubInvites}
                    toggleFunction={toggleNotifyClubInvites}
            />
        )
    }

    return (
        <CategoryContainer>
            <CategoryHeaderText>Invites</CategoryHeaderText>
            <ClubInvites />
        </CategoryContainer>
    )
}

const NotificationSetting = ({title, subtext, isToggled, toggleFunction}) => {
    const NotificationSettingContainer = styled(View)`
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        padding: 5px;
    `;
    const FirstColumn = styled(Pressable)`
        width: 70%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: flex-start;
        padding: 5px;
    `;
    const SecondColumn = styled(View)`
        width: 30%;
        display: flex;
        justify-content: center;
        align-items: flex-end;
    `;
    const NotificationSettingText = styled(ReelayText.Body1)`
        text-align: center;
        color: white;
        margin-right: 20px;
        margin-top: 0px;
    `;
    const NotificationSettingSubtext = styled(ReelayText.Caption)`
        text-align: left;
        margin-top: 6px;
        color: #FFFFFF
        opacity: 0.5;
    `;
    const NotificationSlider = styled(Switch)``;
    return (
		<NotificationSettingContainer>
            <FirstColumn onPress={() => Linking.openSettings()}>
				<NotificationSettingText>{title}</NotificationSettingText>
				{subtext && <NotificationSettingSubtext>{subtext}</NotificationSettingSubtext>}
			</FirstColumn>
			<SecondColumn>
				<NotificationSlider
					value={isToggled}
					onValueChange={toggleFunction}
					trackColor={{ false: "#39393D", true: ReelayColors.reelayBlue }}
					thumbColor={"#FFFFFF"}
					ios_backgroundColor="#39393D"
				/>
			</SecondColumn>
		</NotificationSettingContainer>
	);
}