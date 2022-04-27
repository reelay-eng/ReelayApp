import React, { useContext, useState, memo} from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import { blockCreator, removeReelay, reportReelay, suspendAccount } from '../../api/ReelayDBApi';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from 'styled-components/native';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../global/Text';
import { showMessageToast } from '../utils/toasts';
import DownloadButton from '../create-reelay/DownloadButton';

const TopicDrawerContents = ({ navigation, setDrawerVisible, topic }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [drawerState, setDrawerState] = useState('options');
    const isMyTopic = (topic.creatorSub === reelayDBUser?.sub);

}

export default TopicDotMenuDrawer = ({ topic, navigation, drawerVisible, setDrawerVisible }) => {
    const closeDrawer = () => setDrawerVisible(false);

    const ModalContainer = styled(View)`
        position: absolute;
    `
    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerVisible}>
                <Backdrop onPress={closeDrawer}/>
                <TopicDrawerContents 
                    navigation={navigation} 
                    setDrawerVisible={setDrawerVisible} 
                    topic={topic} 
                />
            </Modal>
        </ModalContainer>
    );

}
