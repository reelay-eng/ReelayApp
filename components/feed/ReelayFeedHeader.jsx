import React, { Fragment, memo } from 'react';
import { Easing, Pressable, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faComments, faBackwardStep, faForwardStep, faPipe } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextTicker from 'react-native-text-ticker';
import ClubPicture from '../global/ClubPicture';
import ProfilePicture from '../global/ProfilePicture';
import { LinearGradient } from 'expo-linear-gradient';
import ReelayColors from '../../constants/ReelayColors';

const ActivityTicker = styled(TextTicker)`
    color: white;
    display: flex;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    line-height: 20px;
    letter-spacing: 0.15px;
    margin-top: 4px;
    text-align: center;
`
const FeedHeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-left: 11px;
    padding-right: 11px;
    position: absolute;
    top: ${props => props.topOffset}px;
`
const ForwardBackButton = styled(TouchableOpacity)`
    align-items: center;
    border-color: ${props => props.disabled ? '#a8a8a8' : 'white'};
    border-radius: 80px;
    border-width: 1px;
    justify-content: center;
    margin-left: 8px;
    margin-right: 8px;
    padding: 4px;
`
const HeaderGradient = styled(LinearGradient)`
    height: ${props => props.topOffset + 38}px;
    position: absolute;
    width: 100%;
`
const HeaderText = styled(ReelayText.Subtitle2)`
    color: white;
`
const PositionText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    font-size: 12px;
`
const RowView = styled(View)`
    align-items: center;
    flex-direction: row;
`
const RowPressable = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
`
const ActivityInfoView = styled(View)`
    align-items: center;
    display: flex;
    flex-direction: row;
    flex: 1;
`
const Spacer = styled(View)`
    width: 10px;
`

const ActivityInfoBar = ({ club, feedSource, navigation, topic }) => {
    const topicScrollDuration = 60 + topic?.title?.length * 180;
    const clubScrollDuration = 60 + (club?.name?.length * 180);
    const dividerScrollDuration = 60;
    const Divider = () => <HeaderText>{'|'}</HeaderText>;

    const ClubInfo = () => {
        const advanceToActivityFeed = () => {
            if (club) {
                // advance to club feed
                navigation.push('ClubActivityScreen', { club });
            }
        }
    
        return (
            <RowPressable onPress={advanceToActivityFeed}>
                <ClubPicture club={club} size={30} />
                <Spacer />
                <HeaderText numberOfLines={1}>{club?.name}</HeaderText>
            </RowPressable>
        );
    }

    const GlobalInfo = () => {
        const getDisplayFeedSource = () => {
            switch (feedSource) {
                case 'festivals': return 'At Festivals';
                case 'following': return 'Friends are watching';
                case 'global': return '';
                case 'popularTitlesDiscover': return 'Popular titles';
                case 'popularTitlesFollowing': return 'Popular titles with friends';
                case 'single': return '';
                case 'streaming': return 'On Streaming'; 
                case 'theaters': return 'In Theaters';
                case 'trending': return 'Top of the Week';
                default: return '';
            }
        }

        const getDisplayIcon = () => {
            switch (feedSource) {
                case 'festivals': return 'pagelines';
                case 'following': return 'people';
                case 'global': return 'earth';
                case 'popularTitlesDiscover': return 'flame';
                case 'popularTitlesFollowing': return 'earth';
                case 'single': return 'notifications';
                case 'streaming': return 'earth'; // should be different if following
                case 'theaters': return 'ticket';
                case 'trending': return 'ribbon';
                default: return 'earth';
            }
        }

        const getDisplayIconSource = () => {
            switch (feedSource) {
                case 'theaters': 
                case 'festivals':
                    return 'font-awesome';
                default: return 'ionicon';
            }
        }

        return (
            <RowView>
                <Icon type={getDisplayIconSource()} name={getDisplayIcon()} size={21} color='white' />
                <Spacer />
                <HeaderText>{getDisplayFeedSource()}</HeaderText>
            </RowView>
        );
    }

    const TopicInfo = () => {
        return (
            <RowView>
                <FontAwesomeIcon icon={ faComments } color='white' size={21} />
                <Spacer />
                <HeaderText numberOfLines={1}>{topic?.title}</HeaderText>
            </RowView>
        );
    }

    if (club && topic) {
        return (
            <ActivityTicker
                animationType={'scroll'} 
                bounce={false} 
                duration={
                    clubScrollDuration + 
                    dividerScrollDuration +
                    topicScrollDuration
                } 
                easing={Easing.linear} 
                loop 
                marqueeDelay={1000} 
                repeatSpacer={25}
            >
                <RowView>
                    <ClubInfo />
                    <Spacer />
                    <Divider />
                    <Spacer />
                    <TopicInfo />
                </RowView>
            </ActivityTicker>
        );
    } else if (club) {
        return (
            <ActivityTicker
                animationType={'scroll'} 
                bounce={false} 
                duration={clubScrollDuration} 
                easing={Easing.linear} 
                loop 
                marqueeDelay={1000} 
                repeatSpacer={25}
            >
                <ClubInfo />
            </ActivityTicker>
        );
    } else if (topic) {
        return (
            <ActivityTicker
                animationType={'scroll'} 
                bounce={false} 
                duration={topicScrollDuration} 
                easing={Easing.linear} 
                loop 
                marqueeDelay={1000} 
                repeatSpacer={25}
            >
                <RowView>
                    <GlobalInfo />
                    <Divider />
                    <Spacer />
                    <TopicInfo />
                </RowView>
            </ActivityTicker>
        );
    } else {
        return <GlobalInfo />;
    }
}

const ActivityInfoBarMemo = memo(ActivityInfoBar, (thread0, thread1) => {
    return (
        thread0.club?.id === thread1.club?.id &&
        thread0.topic?.id === thread1.topic?.id
    );
});

export default ReelayFeedHeader = ({ 
    navigation, 
    club = null, 
    topic = null, 
    feedSource = 'global',
    position,
    reelay,
    stackLength,
    onTappedOldest,
    onTappedNewest,
}) => {

    const BackButton = () => {
        return (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
                <Icon type='ionicon' name={'arrow-back-outline'} color={'white'} size={24} />
            </TouchableOpacity>
        );
    }

    const ForwardBack = () => {
        const atOldestReelay = (position === 0);
        const atNewestReelay = (position === stackLength - 1);
        const positionString = `${position + 1}/${stackLength}`;

        const onTappedOldestSafe = () => (onTappedOldest) ? onTappedOldest() : {};
        const onTappedNewestSafe = () => (onTappedNewest) ? onTappedNewest() : {};

        return (
            <RowView>
                <ForwardBackButton onPress={onTappedOldestSafe} disabled={atOldestReelay}>
                    <FontAwesomeIcon icon={ faBackwardStep } size={18} color={atOldestReelay ? '#a8a8a8' : 'white'} />
                </ForwardBackButton>
                <PositionText>{positionString}</PositionText>
                <ForwardBackButton onPress={onTappedNewestSafe} disabled={atNewestReelay}>
                    <FontAwesomeIcon icon={ faForwardStep } size={18} color={atNewestReelay ? '#a8a8a8' : 'white'} />
                </ForwardBackButton>
            </RowView>
        );
    }

    const topOffset = useSafeAreaInsets().top;

    if (feedSource === 'profile') {
        return (
            <FeedHeaderView topOffset={topOffset}>
                <RowView>
                    <BackButton navigation={navigation} />
                    <ProfilePicture user={reelay?.creator} size={24} />
                </RowView>
            </FeedHeaderView>
        );
    }

    return (
        <Fragment>
            <HeaderGradient colors={[ReelayColors.reelayBlack,'transparent']} topOffset={topOffset} />
            <FeedHeaderView topOffset={topOffset}>
                { feedSource !== 'global' && <BackButton navigation={navigation} /> }
                <Spacer />
                <ActivityInfoView>
                    <ActivityInfoBarMemo club={club} feedSource={feedSource} navigation={navigation} topic={topic} />
                </ActivityInfoView>
                { stackLength > 1 && (
                    <RowView>
                        <ForwardBack />
                    </RowView>
                )}
            </FeedHeaderView>
        </Fragment>
    );
}