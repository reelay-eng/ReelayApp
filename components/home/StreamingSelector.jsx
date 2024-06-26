import React, { memo, useContext, useState, useRef, Fragment } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { getStreamingVenues } from '../utils/VenueIcon';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons';

import { getFeed, postStreamingSubscriptionToDB, removeStreamingSubscription } from '../../api/ReelayDBApi';
import { useDispatch, useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');
const VENUE_BUTTON_WIDTH = (width - 40) / 4;

const BodyText = styled(ReelayText.Body2)`
    color: white;
    font-size: 13px;
    line-height: 24px;
`
const HeaderText = styled(ReelayText.Body1)`
    color: white;
    font-size: 16px;
`
const HeaderView = styled(View)`
    align-items: center;
    padding: 12px;
    width: 100%;
`
const IconOptionsGridContainer = styled(View)`
    align-items: center;
    justify-content: center;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
`
const PrimaryVenueImage = styled.Image`
    height: 42px;
    width: 42px;
    border-radius: 21px;
    border-width: 1px;
    border-color: white;
`
const SaveButtonGradient = styled(LinearGradient)`
    border-radius: 20px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const SaveButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: white;
    border-color: white;
    border-radius: 20px;
    border-width: 1px;
    height: 40px;
    justify-content: center;
    margin-top: 16px;
    width: 90%;
`
const SaveButtonText = styled(ReelayText.CaptionEmphasized)`
    color: ${ReelayColors.reelayBlue};
`
const SeeMorePressable = styled(TouchableOpacity)`
    align-items: center;
    padding-top: 16px;
    padding-bottom: 16px;
    width: 100%;
`
const SeeMoreText = styled(ReelayText.Body2)`
    color: white;
    padding-bottom: 6px;
`
const StreamingServicesContainer = styled(View)`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
`
const TouchableVenue = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.selected ? ReelayColors.reelayBlue : "transparent"};
    border-radius: 11px;
    height: 93px;
    justify-content: center;
    margin: 4px;
    width: ${VENUE_BUTTON_WIDTH}px;
`
const VenueGradient = styled(LinearGradient)`
    border-radius: 11px;
    flex: 1;
    height: 100%;
    opacity: 1;
    position: absolute;
    width: 100%;
`
const VenueText = styled(ReelayText.Body2)`
    color: white;
    font-size: 13px;
    line-height: 15px;
    padding-top: 6px;
`

export const StreamingSelectorGrid = ({ venueList = [], setRefreshing }) => {
    const authSession = useSelector(state => state.authSession);
    const bottomOffset = useSafeAreaInsets().bottom;
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const hasVenueList = (venueList?.length > 0);
    const [expanded, setExpanded] = useState(true);

    const searchVenues = getStreamingVenues(expanded);
    const getVenuesFromList = () => venueList.map(venueStr => {
        const matchVenueStr = (venueObj) => venueObj?.venue === venueStr;
        return searchVenues.find(matchVenueStr);
    });

    const myStreamingSubscriptions = useSelector(state => state.myStreamingSubscriptions);
    const myStreamingPlatforms = myStreamingSubscriptions?.map(({ platform }) => platform);
    const selectedVenues = useRef(myStreamingPlatforms);
    const streamingVenues = hasVenueList ? getVenuesFromList() : searchVenues;

    const addAndRemoveSubscriptionChanges = async () => {
        // compare to find new subscriptions to post
        const postIfNewSubscription = async (selectedVenue) => {
            const matchSelectedVenue = (platform) => (selectedVenue === platform);
            if (!myStreamingPlatforms.find(matchSelectedVenue)) {
                // adding a new subscription
                postStreamingSubscriptionToDB(reelayDBUser?.sub, { platform: selectedVenue });
            }
        }

        // compare to find old subscriptions to remove
        const removeIfOldSubscription = async (platform) => {
            const matchSubscribedPlatform = (selectedVenue) => (selectedVenue === platform);
            if (!selectedVenues.current.find(matchSubscribedPlatform)) {
                // remove unselected platform from subscriptions
                removeStreamingSubscription(reelayDBUser?.sub, { platform });
            };
        }

        const myNextStreamingSubscriptions = selectedVenues.current.map((venue) => {
            return { userID: reelayDBUser?.sub, platform: venue };
        });

        dispatch({ type: 'setMyStreamingSubscriptions', payload: myNextStreamingSubscriptions });
        // todo: use a loading indicator
        setRefreshing(true);
        await selectedVenues.current.map(postIfNewSubscription);
        await myStreamingPlatforms.map(removeIfOldSubscription);
        const homeOnStreamingFeed = await getFeed({ 
            authSession,
            reqUserSub: reelayDBUser?.sub, 
            feedSource: 'streaming', 
            page: 0,
        });
        const payload = { 
            content: homeOnStreamingFeed, 
            nextPage: 1,
        };
        dispatch({ type: 'setHomeOnStreamingFeed', payload });
        setRefreshing(false);
    }

    const onSave = async () => {
        if (reelayDBUser?.username === 'be_our_guest') {
            dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
            return;
        }
        await addAndRemoveSubscriptionChanges();
    }

    const onTapVenue = (venue) => {
        if (selectedVenues.current.includes(venue)) {
            // remove from list
            selectedVenues.current = selectedVenues.current.filter(v => v !== venue);
        } else {
            // add to list
            selectedVenues.current = [...selectedVenues.current, venue];
        }
    }

    const scrollStyle = {
        alignItems: 'center', 
        height: 750 + bottomOffset,
    }

    const SaveButton = memo(() => {
        const [saving, setSaving] = useState(false);

        const saveSubscriptions = async () => {
            setSaving(true);
            await onSave();
            setSaving(false);
        }

        return (
            <SaveButtonPressable onPress={saveSubscriptions}>
                { !saving && <SaveButtonText>{'Save'}</SaveButtonText> }
                { saving && <ActivityIndicator /> }
            </SaveButtonPressable>
        );
    }, (prevProps, nextProps) => true);

    const SeeMore = () => {
        return (
            <SeeMorePressable onPress={() => setExpanded(true)}>
                <SeeMoreText>{'see more'}</SeeMoreText>
                <FontAwesomeIcon icon={faChevronDown} color='white' size={24} />
            </SeeMorePressable>
        )
    }   

    const VenueBadgeList = ({ initSelectedVenues, onTapVenue }) => {
        const renderStreamingVenue = (venueObj) => {
            const { venue, display } = venueObj;
            const matchVenue = (selectedVenue) => (venue === selectedVenue);
            const initSelected = !!initSelectedVenues.find(matchVenue);
            return (
                <VenueBadge 
                    key={venue}
                    displayName={display}
                    initSelected={initSelected}
                    onTapVenue={onTapVenue}
                    searchVenues={streamingVenues} 
                    venue={venue} 
                />
            );
        }

        return (
            <IconOptionsGridContainer>
                { streamingVenues.map(renderStreamingVenue) }
            </IconOptionsGridContainer>
        );
    };
    
    return (
        <ScrollView contentContainerStyle={scrollStyle}>
            <VenueBadgeList initSelectedVenues={myStreamingPlatforms} onTapVenue={onTapVenue} />
            { !expanded && <SeeMore /> }
            <SaveButton />
        </ScrollView>
    );
}

const VenueBadge = ({ displayName, initSelected, onTapVenue, searchVenues, venue }) => {
    const [selected, setSelected] = useState(initSelected);
    const iconSource = venue.length ? searchVenues.find((vi) => vi.venue === venue).source : null;
    if (!iconSource) return <Fragment />;

    const VenueImage = memo(({ source }) => {
        return <PrimaryVenueImage source={source} />
    }, (prevProps, nextProps) => {
        return prevProps.source === nextProps.source;
    });
    
    const onPress = () => {
        setSelected(!selected);
        onTapVenue(venue); 
    };

    const GRADIENT_START_COLOR = "#272525"
    const GRADIENT_END_COLOR = "#19242E"

    return (
        <TouchableVenue onPress={onPress} selected={selected} activeOpacity={0.6}>
            { !selected && <VenueGradient colors={[GRADIENT_START_COLOR, GRADIENT_END_COLOR]} /> }
            <VenueImage source={iconSource} />
            <VenueText numberOfLines={2}>{displayName}</VenueText>
        </TouchableVenue>
    );
};

export default StreamingSelector = ({ setRefreshing }) => {
    return (
        <StreamingServicesContainer>
            <HeaderView>
                <HeaderText>{'Select your streaming services'}</HeaderText>
                <BodyText numberOfLines={2}>{'Curate your feed of subscriptions'}</BodyText>
            </HeaderView>
            <StreamingSelectorGrid setRefreshing={setRefreshing} />
        </StreamingServicesContainer>
    )
}
