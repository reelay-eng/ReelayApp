import React from 'react';
import { Dimensions, Easing, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faComments, faBackwardStep, faForwardStep } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextTicker from 'react-native-text-ticker';

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
    position,
    stackLength,
    onTappedOldest,
    onTappedNewest,
}) => {
    const ActivityInfoBar = () => {
        const scrollDuration = topic?.title?.length * 180;
        if (club && topic) {
            return (
                <ActivityTicker
                    animationType={'scroll'} 
                    bounce={false} 
                    duration={scrollDuration} 
                    easing={Easing.linear} 
                    loop 
                    marqueeDelay={1000} 
                    repeatSpacer={25}
                >
                    <RowView>
                        <ClubInfo />
                        <TopicInfo />
                    </RowView>
                </ActivityTicker>
            );
        } else if (club) {
            return <ClubInfo />;
        } else if (topic) {
            return (
                <ActivityTicker
                    animationType={'scroll'} 
                    bounce={false} 
                    duration={scrollDuration} 
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

            </RowView>
        );
    }

    const GlobalInfo = () => {
        return <Icon type='ionicon' name='earth' size={21} color='white' />;
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
            <BackButton navigation={navigation} />
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