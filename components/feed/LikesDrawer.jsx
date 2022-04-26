import React from 'react';
import { Modal, View, ScrollView, Pressable } from 'react-native';
import * as ReelayText from '../global/Text';
import { Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/native';
import { getUserByUsername } from '../../api/ReelayDBApi';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import ProfilePicture from '../global/ProfilePicture';
import FollowButton from '../global/FollowButton';

export default LikesDrawer = ({ reelay, navigation }) => {

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13

    const CLOSE_BUTTON_SIZE = 25;
    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const DrawerContainer = styled(View)`
        background-color: #1a1a1a;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        height: auto;
        margin-top: auto;
        max-height: 70%;
        padding-bottom: 30px;
        width: 100%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const likesVisible = useSelector(state => state.likesVisible);
    const dispatch = useDispatch();
    const closeDrawer = () => dispatch({ type: 'setLikesVisible', payload: false });

    const Header = () => {
        const HeaderContainer = styled(View)`
            justify-content: center;
            margin-left: 12px;
            margin-right: 20px;
            margin-bottom: 5px;
            border-bottom-color: #2D2D2D;
            border-bottom-width: 1px;
            padding-top: 10px;
            padding-bottom: 10px;
        `
        const HeaderText = styled(ReelayText.CaptionEmphasized)`
            position: absolute;
            align-self: center;
            color: white;
        `
        const CloseButtonContainer = styled(Pressable)`
            align-self: flex-end;
        `
		const headerText = (reelay.likes.length) ? `${reelay.likes.length} like${reelay.likes.length > 1 ? "s" : ""}` : "No likes... be the first!"
		
        return (
            <HeaderContainer>
                <HeaderText>{headerText}</HeaderText>
                <CloseButtonContainer onPress={closeDrawer}>
                    <Icon color={'white'} type='ionicon' name='close' size={CLOSE_BUTTON_SIZE}/>
                </CloseButtonContainer>
            </HeaderContainer>
        );
    }

    const LikeItem = ({ like }) => {
        const likeUser = {username: like.username, sub: like.userSub};

        const LikeItemContainer = styled(View)`
            height: 50px;
            flex-direction: row;
            margin-left: 10px;
            margin-right: 10px;
        `
        const LeftLikePartContainer = styled(Pressable)`
            flex: 2;
            flex-direction: row;
        `
        const ProfilePictureContainer = styled(View)`
            height: 100%;
            justify-content: center;
            margin-right: 12px;
            margin-left: 15px;
        `;
        const LikeTextContainer = styled(View)`
            width: 80%;
            height: 100%;
            justify-content: center;
        `;
        const UsernameText = styled(ReelayText.Subtitle1Emphasized)`
            color: #94959A;
        `

        const RightLikePartContainer = styled(View)`
            flex: 1;
            justify-content: center;
            align-items: center;
        `

        const goToProfile = async (username) => {
            const creator = await getUserByUsername(username);
            dispatch({ type: 'setLikesVisible', payload: false })
            navigation.push('UserProfileScreen', {
                creator: creator
            })
            logAmplitudeEventProd('viewProfile', {
                username: creator.username,
                title: reelay.title.display,
                source: 'likesDrawer',
                });
        }

        return (
            <LikeItemContainer>
                <LeftLikePartContainer onPress={() => goToProfile(likeUser.username)}>
                    <ProfilePictureContainer>
                        <ProfilePicture user={likeUser} size={32}/>
                    </ProfilePictureContainer>
                    <LikeTextContainer>
                        <UsernameText>{likeUser.username}</UsernameText>
                    </LikeTextContainer>
                </LeftLikePartContainer>
                <RightLikePartContainer>
                    <FollowButton creator={likeUser} />
                </RightLikePartContainer>
            </LikeItemContainer>
        )

    }

    const Likes = () => {
        const LikesContainer = styled(View)`
            width: 100%;
        `
        const LikesScrollView = styled(ScrollView)`
            width: 100%;
        `
        return (
            <LikesContainer>
                <Header />
                <LikesScrollView scrollEnabled={reelay.likes.length > 6}>
                    { reelay.likes.map((like, index) => {
                        return (
                            <LikeItem key={`like${index}`} like={like} />
                        );
                    })}
                </LikesScrollView>
            </LikesContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={likesVisible}>
                { likesVisible && <Backdrop onPress={closeDrawer} /> }
                <DrawerContainer>
                    <Likes />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}