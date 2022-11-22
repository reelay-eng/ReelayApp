import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, TextInput, TouchableOpacity, View } from 'react-native';

import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';

const { height, width } = Dimensions.get('window');

const NUM_COLUMNS = 6;
const BADGE_MARGIN = 4;
const BADGE_SIZE = (width - 32) / NUM_COLUMNS - (BADGE_MARGIN * 2);
const EMOJI_SIZE = BADGE_SIZE * 0.7;
const MAX_DISPLAY_COUNT = 300;

const Backdrop = styled(Pressable)`
    background-color: transparent;
    bottom: 0px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const CloseDrawerButton = styled(TouchableOpacity)`
    padding: 10px;
`
const DrawerView = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    height: auto;
    margin-top: auto;
    max-height: 50%;
    padding-top: 8px;
    padding-bottom: ${props => props.bottomOffset + 12}px;
    padding-left: 16px;
    padding-right: 16px;
    width: 100%;
`
const DrawerHeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
`
const EmojiBadgePressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: #1f1f1f;
    border-color: 4px;
    border-radius: 8px;
    justify-content: center;
    height: ${BADGE_SIZE}px;
    margin: ${BADGE_MARGIN}px;
    width: ${BADGE_SIZE}px;
`
const EmojiBadgeText = styled(ReelayText.H6)`
    text-align: center;
    font-size: ${EMOJI_SIZE}px;
    line-height: ${EMOJI_SIZE + 6}px;
    width: 100%;
`
const EmojiGridView = styled(FlatList)`
    flex-direction: row;
    flex-wrap: wrap;
    width: ${width - 32}px;
`
const HeaderText = styled(ReelayText.H6)`
    color: white;
    font-size: 18px;
`
const LeftSpacer = styled(View)`
    width: 40px;
`

const emojiList = require('../../assets/emojis');

const SearchInputStyle = {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    color: 'white',
    flexDirection: 'row',
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    fontStyle: 'normal',
    justifyContent: 'flex-end',
    letterSpacing: 0.15,
    marginLeft: 8,
    marginRight: 8,
    paddingTop: 20,
    paddingBottom: 20,
}

export default AddReactEmojiDrawer = ({ closeDrawer, onEmojiSelected }) => {
    const authSession = useSelector(state => state.authSession);
    const bottomOffset = useSafeAreaInsets().bottom;
    const { reelayDBUser } = useContext(AuthContext);

    const initDisplayEmojis = emojiList.slice(0, MAX_DISPLAY_COUNT);
    const [searchText, setSearchText] = useState('');
    const [displayEmojis, setDisplayEmojis] = useState(initDisplayEmojis);
    const gridHeight = (2 + displayEmojis?.length / NUM_COLUMNS) * (BADGE_SIZE + BADGE_MARGIN);
    
    const cleanText = (searchText) => {
        return searchText.replace('_', ' ').toLowerCase();
    }

    const updateSearchText = (newSearchText) => {
        if (searchText !== newSearchText) {
            setSearchText(newSearchText);
        }

        if (newSearchText === '') {
            setDisplayEmojis(initDisplayEmojis);
            return initDisplayEmojis;
        }

        const cleanSearchText = cleanText(newSearchText);
        const matchEmoji = (emojiObj, index) => {
            const cleanShortName = cleanText(emojiObj?.short_name ?? '');
            const matchIndex = cleanShortName.indexOf(cleanSearchText);
            emojiObj.matchIndex = matchIndex;
            return (matchIndex !== -1);
        }    

        const sortEmojis = (emojiObj0, emojiObj1) => {
            const index0 = emojiObj0?.matchIndex ?? -1;
            const index1 = emojiObj1?.matchIndex ?? -1;
            return index0 > index1 ? -1 : 1;
        }

        const nextDisplayEmojis = emojiList.filter(matchEmoji).sort(sortEmojis);
        setDisplayEmojis(nextDisplayEmojis.slice(0, MAX_DISPLAY_COUNT));
    }    

    const renderEmoji = ({ item, index }) => {
        const emojiObj = item;
        const hex = parseInt(emojiObj?.unified, 16)
        const emoji = String.fromCodePoint(hex);

        const onSelect = () => {
            closeDrawer();
            onEmojiSelected(emoji);
        }

        return (
            <EmojiBadgePressable key={emojiObj?.short_name} onPress={onSelect}>
                <EmojiBadgeText>{emoji}</EmojiBadgeText>
            </EmojiBadgePressable>
        );
    }

    const DrawerHeader = () => {
        return (
            <DrawerHeaderView>
                <LeftSpacer />
                <HeaderText>{'Add Reaction'}</HeaderText>
                <CloseDrawerButton onPress={closeDrawer}>
                    <FontAwesomeIcon icon={faXmark} size={20} color='white' />
                </CloseDrawerButton>
            </DrawerHeaderView>
        )
    }

    return (
        <Modal animationType='slide' transparent={true} visible={true}>
            <Backdrop onPress={closeDrawer} />
            <DrawerView bottomOffset={bottomOffset}>
                <DrawerHeader />
                <TextInput
                    onChangeText={updateSearchText}
                    placeholder={'Search emojis...'}
                    placeholderTextColor={'gray'}
                    returnKeyType='search'
                    style={SearchInputStyle} 
                    value={searchText}
                />
                <EmojiGridView
                    contentContainerStyle={{
                        alignItems: 'center',
                        height: gridHeight,
                        width: width - 32,
                    }}
                    data={displayEmojis}
                    numColumns={NUM_COLUMNS}
                    key={emoji => emoji?.unified}
                    renderItem={renderEmoji}
                    showsVerticalScrollIndicator={false}
                />
            </DrawerView>
        </Modal>
    )
}