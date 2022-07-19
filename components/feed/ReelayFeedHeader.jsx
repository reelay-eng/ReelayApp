import React from 'react';
import { Dimensions, Easing, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faComments, faBackwardStep, faForwardStep, faPipe } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextTicker from 'react-native-text-ticker';
import ClubPicture from '../global/ClubPicture';
import ProfilePicture from '../global/ProfilePicture';

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
    top: ${props => props.topOffset - 11}px;
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
const RowFlexView = styled(RowView)`
    display: flex;
    flex: 1;
`
const Spacer = styled(View)`
    width: 10px;
`
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
    const ActivityInfoBar = () => {
        const topicScrollDuration = 60 + topic?.title?.length * 180;
        const clubScrollDuration = 60 + (club?.name?.length * 180);
        const dividerScrollDuration = 60;
        const Divider = () => <HeaderText>{'|'}</HeaderText>;
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
                    <TopicInfo />
                </ActivityTicker>
            );
        } else {
            return <GlobalInfo />;
        }
    }

    const BackButton = () => {
        return (
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon type='ionicon' name={'arrow-back-outline'} color={'white'} size={30} />
            </TouchableOpacity>
        );
    }

    const ClubInfo = () => {
        return (
            <RowView>
                <ClubPicture club={club} size={30} />
                <Spacer />
                <HeaderText numberOfLines={1}>{club?.name}</HeaderText>
            </RowView>
        );
    }

    const GlobalInfo = () => {
        const getDisplayFeedSource = () => {
            switch (feedSource) {
                case 'festivals': return 'At Festivals';
                case 'following': return 'Friends are watching';
                case 'global': return 'Global';
                case 'popularTitlesDiscover': return 'Popular titles';
                case 'popularTitlesFollowing': return 'Popular titles with friends';
                case 'profile': return '';
                case 'single': return '';
                case 'streaming': return 'On Streaming'; 
                case 'theaters': return 'In Theaters';
                case 'trending': return 'Top of the Week';
                default: return '';
            }
        }

        const getDisplayIcon = () => {
            switch (feedSource) {
                case 'festivals': return 'leaf';
                case 'following': return 'people';
                case 'global': return 'earth';
                case 'popularTitlesDiscover': return 'flame';
                case 'popularTitlesFollowing': return 'earth';
                case 'profile': return 'person'; // should actually be their profile pic
                case 'single': return 'notifications';
                case 'streaming': return 'earth'; // should be different if following
                case 'theaters': return 'ticket';
                case 'trending': return 'ribbon';
                default: return 'earth';
            }
        }

        const renderIcon = () => {
            if (feedSource === 'profile') {
                return <ProfilePicture user={reelay?.creator} size={30} />
            } else {
                return <Icon type='ionicon' name={getDisplayIcon()} size={21} color='white' />
            }
        }

        return (
            <RowView>
                { renderIcon() }
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

    return (
        <FeedHeaderView topOffset={topOffset}>
            { feedSource !== 'global' && <BackButton navigation={navigation} /> }
            <Spacer />
            <RowFlexView>
                <ActivityInfoBar />
            </RowFlexView>
            <RowView>
                <ForwardBack />
            </RowView>
        </FeedHeaderView>
    );
}