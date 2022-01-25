import React, { useContext } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { Icon } from 'react-native-elements';
import { FeedContext } from '../../context/FeedContext';
import styled from 'styled-components/native';
import { getUserByUsername } from '../../api/ReelayDBApi';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';

export default LikesDrawer = ({ reelay, navigation }) => {

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13

    const CLOSE_BUTTON_SIZE = 36;
    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const DrawerContainer = styled(View)`
        background-color: black;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        height: auto;
        margin-top: auto;
        max-height: 70%;
        padding: 20px;
        padding-bottom: 30px;
        width: 100%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const { likesVisible, setLikesVisible } = useContext(FeedContext);
    const closeDrawer = () => setLikesVisible(false);


    const DragToCloseIndicator = () => {
        return (
            <View style={{
                alignSelf: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: 10,
                height: 5,
                marginTop: 10,
                width: 120,
            }}
            />
        );  
    }

    const Header = () => {
        const HeaderContainer = styled(View)`
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
            margin: 12px;
        `
        const HeaderText = styled(ReelayText.H6Emphasized)`
            color: white;
        ` 
        const headerText = reelay.likes.length ? `Likes (${reelay.likes.length})` : 'Likes';
        return (
            <HeaderContainer>
                <HeaderText>{headerText}</HeaderText>
                <Pressable onPress={closeDrawer}>
                    <Icon color={'white'} type='ionicon' name='close' size={CLOSE_BUTTON_SIZE} />
                </Pressable>
            </HeaderContainer>
        );
    }

    const Likes = () => {
        const LikesContainer = styled(View)`
            width: 100%;
        `
        const LikeItemContainer = styled(Pressable)`
            margin: 10px;
            width: 100%;
        `
        const UsernameText = styled(ReelayText.Body1)`
            color: white;
        `
        const goToProfile = async (username) => {
            const creator = await getUserByUsername(username);
            setLikesVisible(false);
            navigation.push('UserProfileScreen', {
                creator: creator
            })
        }

        return (
            <LikesContainer>
                <Header />
                { reelay.likes.map(like => {
                    return (
                        <LikeItemContainer key={like.username} onPress={() => goToProfile(like.username)}>
                            <UsernameText>{like.username}</UsernameText>
                        </LikeItemContainer>
                    );
                })}
            </LikesContainer>
        );
    }

    return (
        <ModalContainer>
            <GestureRecognizer
                style={{ flex: 1 }}
                onSwipeDown={() => setLikesVisible(false)}>
                <Modal animationType='slide' transparent={true} visible={likesVisible}>
                    { likesVisible && <Backdrop onPress={closeDrawer} /> }
                    <DrawerContainer>
                        <DragToCloseIndicator/>
                        <Likes />
                    </DrawerContainer>
                </Modal>
            </GestureRecognizer>
        </ModalContainer>
    );
}