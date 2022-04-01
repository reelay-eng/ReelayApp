import React, { useContext, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import StreamingSelector from './StreamingSelector';
import * as ReelayText from '../global/Text';
import { VenueIcon } from '../utils/VenueIcon';
import SeeMore from '../global/SeeMore';

import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import ReelayColors from '../../constants/ReelayColors';
import { useSelector } from 'react-redux';

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
    height: auto;
    display: flex;
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
    margin-top: 15px;
`
const TitleInfoLine = styled(View)`
    flex-direction: row;
    justify-content: space-between;
`
const TitlePoster = styled(Image)`
    width: 120px;
    height: 180px;
    border-radius: 8px;
`
const TitleReleaseYear = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`
const TitleText = styled(ReelayText.H6)`
    font-size: 16px;
    margin-top: 10px;
    color: white;
    opacity: 1;
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
    width: 100%;
`

export default OnStreaming = ({ navigation, onRefresh }) => {
    const { 
        reelayDBUser, 
    } = useContext(AuthContext);
    
    const myStacksOnStreaming = useSelector(state => state.myStacksOnStreaming);
    const myStreamingSubscriptions = useSelector(state => state.myStreamingSubscriptions);

    const goToReelay = (index, titleObj) => {
		if (!myStacksOnStreaming?.length) return;

		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'streaming',
            isOnFeedTab: false,
            preloadedStackList: myStacksOnStreaming,
		});

		logAmplitudeEventProd('openStreamingFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};

    if (!myStreamingSubscriptions?.length) return (
        <StreamingSelector onRefresh={onRefresh} />
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
                    <StreamingSelector onRefresh={onRefresh} />
                </DrawerContainer>
            </Modal>
        );
    }

    const StreamingRow = () => {
        return (
            <ReelayPreviewRowContainer horizontal showsHorizontalScrollIndicator={false}>
            { myStacksOnStreaming.map((stack, index) => {
                const onPress = () => goToReelay(index, stack[0]?.title);
                return <StreamingServicesElement key={index} index={index} onPress={onPress} stack={stack} length={myStacksOnStreaming.length}/>;
            })}
            </ReelayPreviewRowContainer>
        );
    }
    
    return (
        <StreamingServicesContainer>
            <HeaderContainer>
                <HeaderContainerLeft>
                    <Icon type='font-awesome' name='television' size={24} color='white' />
                    <HeaderText>{'On streaming'}</HeaderText>
                </HeaderContainerLeft>
                <EditButton />
            </HeaderContainer>
            { myStacksOnStreaming.length > 0 && <StreamingRow /> }
        </StreamingServicesContainer>
    )
};

const StreamingServicesElement = ({ index, onPress, stack, length }) => {
    const reelayCount = stack?.length;
    const venue = stack[0]?.content?.venue;
    const fullTitle = stack[0].title.display;
    const displayTitle = (fullTitle?.length > 26) 
        ? fullTitle.substring(0, 23) + "..."
        : fullTitle;

    if (index === length-1) {
        return (
        <ReelayPreviewContainer>
            <SeeMore 
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
            <TitlePoster source={stack[0]?.title?.posterSource} onPress={onPress} />
            <TitleInfoLine>
                <ReelayCount>{`${reelayCount} ${(reelayCount > 1) ? 'reelays' : 'reelay'}`}</ReelayCount>
            </TitleInfoLine>
            <TitleText>{displayTitle}</TitleText>
            <TitleVenue>
                <VenueIcon venue={venue} size={24} border={1} />
            </TitleVenue>
        </ReelayPreviewContainer>
    )
}
