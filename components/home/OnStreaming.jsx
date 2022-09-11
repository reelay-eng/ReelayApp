import React, { useContext, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import StreamingSelector from './StreamingSelector';
import * as ReelayText from '../global/Text';
import VenueIcon from '../utils/VenueIcon';
import SeeMore from '../global/SeeMore';

import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import ReelayColors from '../../constants/ReelayColors';
import { useSelector } from 'react-redux';
import TitlePoster from '../global/TitlePoster';

const EditStreamingServicesButton = styled(Pressable)`
    padding: 15px;
`
const EditText = styled(ReelayText.Caption)`
    color: ${ReelayColors.reelayBlue};
`
const ReelayCount = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`
const ReelayPreviewContainer = styled(Pressable)`
    margin-right: 16px;
    display: flex;
    width: 120px;
`
const ReelayPreviewRowContainer = styled(ScrollView)`
    display: flex;
    flex-direction: row;
    padding-left: 15px;
    width: 100%;
`
const StreamingServicesContainer = styled(View)`
    width: 100%;
    flex-direction: column;
    margin-bottom: 10px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    padding: 15px;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
`
const HeaderContainerLeft = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 15px;
`
const TitleInfoLine = styled(View)`
    flex-direction: row;
    justify-content: space-between;
`
const TitleVenue = styled(View)`
    position: absolute;
    top: 4px;
    right: 4px;
`
const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const DrawerContainer = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    margin-top: auto;
    max-height: 70%;
    width: 100%;
`

export default OnStreaming = ({ navigation, source = 'discover' }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const homeOnStreamingFeed = useSelector(state => state.homeOnStreamingFeed?.content);
    const myStreamingSubscriptions = useSelector(state => state.myStreamingSubscriptions);

    const goToReelay = (index, titleObj) => {
		if (!homeOnStreamingFeed?.length) return;

		navigation.push("FeedScreen", {
            feedSource: 'streaming',
			initialFeedPos: index,
            preloadedStackList: homeOnStreamingFeed,
		});

		logAmplitudeEventProd('openStreamingFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};

    if (!myStreamingSubscriptions?.length) return (
        <StreamingSelector setRefreshing={setRefreshing} />
    );

    const EditButton = () => {
        const [editDrawerVisible, setEditDrawerVisible] = useState(false);
        const openDrawer = () => setEditDrawerVisible(true);

        return (
            <React.Fragment>
                <EditStreamingServicesButton onPress={openDrawer}>
                    <EditText>{'Edit'}</EditText>
                </EditStreamingServicesButton>
                { editDrawerVisible && (
                    <EditStreamingServicesDrawer 
                        editDrawerVisible={editDrawerVisible}
                        setEditDrawerVisible={setEditDrawerVisible} 
                    /> 
                )}
            </React.Fragment>
        );
    }

    const EditStreamingServicesDrawer = ({ editDrawerVisible, setEditDrawerVisible }) => {
        const closeDrawer = () => setEditDrawerVisible(false);
        return (
            <Modal animationType="slide" transparent={true} visible={editDrawerVisible}>
                <Backdrop onPress={closeDrawer} />
                <DrawerContainer>
                    <StreamingSelector setRefreshing={setRefreshing} />
                </DrawerContainer>
            </Modal>
        );
    }

    const RefreshIndicator = () => {
        const RefreshContainer = styled(View)`
            align-items: center;
            justify-content: center;
            height: 200px;
            width: 100%;
        `
        return (
            <RefreshContainer>
                <ActivityIndicator />
            </RefreshContainer>
        );
    }

    const StreamingRow = () => {
        return (
            <ReelayPreviewRowContainer horizontal showsHorizontalScrollIndicator={false}>
            { homeOnStreamingFeed.map((stack, index) => {
                const onPress = () => goToReelay(index, stack[0]?.title);
                return <StreamingServicesElement key={index} index={index} onPress={onPress} stack={stack} length={homeOnStreamingFeed?.length}/>;
            })}
            </ReelayPreviewRowContainer>
        );
    }
    
    return (
        <StreamingServicesContainer>
            <HeaderContainer>
                <HeaderContainerLeft>
                    <Icon type='font-awesome' name='television' size={24} color='white' />
                    <HeaderText>{(source === 'discover') ? 'On streaming' : 'Friends are streaming'}</HeaderText>
                </HeaderContainerLeft>
                <EditButton />
            </HeaderContainer>
            { refreshing && <RefreshIndicator /> }
            { !refreshing && homeOnStreamingFeed?.length > 0 && <StreamingRow /> }
        </StreamingServicesContainer>
    )
};

const StreamingServicesElement = ({ index, onPress, stack, length }) => {
    const reelayCount = stack?.length;
    const venue = stack[0]?.content?.venue;

    if (index === length-1) {
        return (
        <ReelayPreviewContainer>
            <SeeMore 
                display='poster'
                height={180} 
                onPress={onPress} 
                reelay={stack[0]} 
                width={117} 
            />
        </ReelayPreviewContainer>
        )
    }

    return (
        <ReelayPreviewContainer onPress={onPress}>
            <TitlePoster title={stack[0]?.title} width={120} />
            <TitleInfoLine>
                <ReelayCount>{`${reelayCount} ${(reelayCount > 1) ? 'reelays' : 'reelay'}`}</ReelayCount>
            </TitleInfoLine>
            <TitleVenue>
                <VenueIcon venue={venue} size={24} border={1} />
            </TitleVenue>
        </ReelayPreviewContainer>
    )
}
