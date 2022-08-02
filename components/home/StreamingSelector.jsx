import React, { memo, useContext, useState, useRef, Fragment } from 'react';
import { View, Text, TouchableOpacity } from 'react-native'
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { getStreamingVenues } from '../utils/VenueIcon';
import { BWButton } from '../global/Buttons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { getFeed, postStreamingSubscriptionToDB, removeStreamingSubscription } from '../../api/ReelayDBApi';
import { useDispatch, useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import { ScrollView } from 'react-native-gesture-handler';

const IconOptionsGridContainer = styled(View)`
    align-items: center;
    justify-content: center;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 20px;
    width: 100%;
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
    margin-bottom: 20px;
`
const StreamingServicesHeader = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    padding-left: 15px;
    padding-top: 15px;
`
const VenueSaveButtonContainer = styled(View)`
    margin-top: 10px;
    width: 88%;
    height: 40px;
`

const IconOptions = ({ setRefreshing }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    const streamingVenues = getStreamingVenues(expanded);

    // todo: consistent naming (platform or venue?)
    const myStreamingSubscriptions = useSelector(state => state.myStreamingSubscriptions);
    const myStreamingPlatforms = myStreamingSubscriptions.map(({ platform }) => platform);
    const selectedVenues = useRef(myStreamingPlatforms);
    const [saveDisabled, setSaveDisabled] = useState(false);

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
        const myStreamingStacksDiscover = await getFeed({ 
            reqUserSub: reelayDBUser?.sub, 
            feedSource: 'streaming', 
            page: 0,
        });
        const myStreamingStacksFollowing = await getFeed({ 
            reqUserSub: reelayDBUser?.sub, 
            feedSource: 'streaming', 
            page: 0,
        });

        const payload = { 
            nextDiscover: myStreamingStacksDiscover, 
            nextFollowing: myStreamingStacksFollowing,
        };
        dispatch({ type: 'setStreamingStacks', payload });
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
        justifyContent: 'center',
        paddingBottom: 20, 
    }

    const IconList = ({ onTapVenue, initSelectedVenues }) => {
        return (
            <IconOptionsGridContainer>
                { streamingVenues.map((venueObj) => {
                    const venue = venueObj.venue;
                    const matchVenue = (selectedVenue) => (venue === selectedVenue);
                    const initSelected = !!initSelectedVenues.find(matchVenue);
                    return (
                        <VenueBadge 
                            key={venue}
                            initSelected={initSelected}
                            onTapVenue={onTapVenue}
                            searchVenues={streamingVenues} 
                            venue={venue} 
                        />
                    );
                })}
            </IconOptionsGridContainer>
        )
    };

    const SeeMore = () => {
        return (
            <SeeMorePressable onPress={() => setExpanded(true)}>
                <SeeMoreText>{'see more'}</SeeMoreText>
                <FontAwesomeIcon icon={faChevronDown} color='white' size={24} />
            </SeeMorePressable>
        )
    }   
    
    return (
        <ScrollView contentContainerStyle={scrollStyle}>
            <IconList initSelectedVenues={myStreamingPlatforms} onTapVenue={onTapVenue} />
            { !expanded && <SeeMore /> }
            <VenueSaveButtonContainer>
                <BWButton disabled={saveDisabled} text="Save" onPress={onSave} />
            </VenueSaveButtonContainer>
        </ScrollView>
    );
}

const VenueBadge = ({ venue, searchVenues, initSelected, onTapVenue }) => {
    const [selected, setSelected] = useState(initSelected);
    const iconSource = venue.length ? searchVenues.find((vi) => vi.venue === venue).source : null;
    if (!iconSource) return <Fragment />;

    const TouchableVenue = styled(TouchableOpacity)`
        align-items: center;
        background-color: ${props => props.selected ? ReelayColors.reelayBlue : "transparent"};
        border-radius: 11px;
        height: 93px;
        justify-content: center;
        margin: 4px;
        width: 80px;
    `
    const PrimaryVenueImage = styled.Image`
        height: 42px;
        width: 42px;
        border-radius: 21px;
        border-width: 1px;
        border-color: white;
    `

    const onPress = () => {
        onTapVenue(venue, !selected); 
        setSelected(!selected);
    };

    const VenueImage = memo(({ source }) => {
        return <PrimaryVenueImage source={source} />
    }, (prevProps, nextProps) => {
        return prevProps.source === nextProps.source;
    });

    const VenueGradient = () => {
        const GRADIENT_START_COLOR = "#272525"
        const GRADIENT_END_COLOR = "#19242E"
        return (
            <LinearGradient
                colors={[GRADIENT_START_COLOR, GRADIENT_END_COLOR]}
                style={{
                    flex: 1,
                    opacity: 1,
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: 11,
                }}
            />
        )
    };

    return (
        <TouchableVenue onPress={onPress} selected={selected} activeOpacity={0.6}>
            { !selected && <VenueGradient /> }
            <VenueImage source={iconSource} />
        </TouchableVenue>
    );
};

export default StreamingSelector = ({ setRefreshing }) => {
    return (
        <StreamingServicesContainer>
            <StreamingServicesHeader>{'Where do you stream?'}</StreamingServicesHeader>
            <IconOptions setRefreshing={setRefreshing} />
        </StreamingServicesContainer>
    )
}
