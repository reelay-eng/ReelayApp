import React, { useState, useRef, useContext, useCallback, useEffect, Fragment } from 'react';
import { Dimensions, FlatList, Keyboard, KeyboardAvoidingView, Pressable, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

import ProfilePicture from '../global/ProfilePicture';
import { AuthContext } from '../../context/AuthContext';

import * as Haptics from 'expo-haptics';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TextInput } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShareOutSVG } from '../global/SVGs';

const { height, width } = Dimensions.get('window');

const CheckmarkIconView = styled(View)`
    align-items: center;
    justify-content: center;
    height: 33px;
    width: 33px;
`
const CheckmarkIconWhiteFill = styled(View)`
    background-color: white;
    border-radius: 17px;
    height: 20px;
    position: absolute;
    width: 20px;
`
const FollowsList = styled(FlatList)`
    margin-bottom: 10px;
`
const HeaderSearchButtons = styled(View)`
    align-items: center;
    flex-direction: row;
`
const HeaderSearchRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-right: 10px;
    width: 100%;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 28px;
    line-height: 36px;
    padding: 12px;
`
const NoOneInvitedYetPrompt = styled(View)`
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    top: 20px;
    width: 100%;
`
const NoOneInvitedYetText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
    text-align: center;
`
const ProfilePictureView = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const RowView = styled(TouchableOpacity)`
    display: flex;
    align-items: center;
    background-color: black;
    flex-direction: row;
    justify-content: space-between;
    padding: 6px;
    padding-left: 12px;
    padding-right: 12px;
`
const SearchIconPressable = styled(TouchableOpacity)`
    padding: 6px;
`
const ShareIconPressable = styled(SearchIconPressable)`
    margin-right: 6px;
`
const Spacer = styled(View)`
    height: 24px;
`
const TabLabelText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 16px;
`
const UserInfoView = styled(View)`
    flex-direction: row;
`
const UsernameText = styled(ReelayText.Subtitle1Emphasized)`
    color: ${(props) => (props.isAlreadyMember) ? 'gray' : 'white' };
`
const UsernameView = styled(View)`
    align-items: flex-start;
    justify-content: center;
`

const SearchInputStyle = {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    color: 'white',
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    fontStyle: 'normal',
    justifyContent: 'flex-end',
    letterSpacing: 0.15,
    marginTop: 8,
    marginBottom: 8,
    marginRight: 12,
    paddingLeft: 16,
    paddingRight: 60,
    paddingTop: 12,
    paddingBottom: 12,
}

const FollowerRow = ({ 
    clubMembers, 
    followObj, 
    hasMarkedToSend,
    markFollowToSend,
    unmarkFollowToSend,
}) => {
    const { followSub, followName } = followObj;
    const creator = { sub: followSub, username: followName };

    const [rowHighlighted, setRowHighlighted] = useState(hasMarkedToSend);

    const backgroundColor = 'black';
    const iconName = (isAlreadyMember) ? 'checkmark-done' : 'checkmark-circle';
    const iconColor = (isAlreadyMember) ? 'gray' : ReelayColors.reelayBlue;

    const findFollowInMembers = (member) => member.userSub === followSub;
    const isAlreadyMember = clubMembers.find(findFollowInMembers);
    if (isAlreadyMember && isAlreadyMember?.role === 'banned') {
        return <View key={followSub} />
    }
    
    const markRow = () => {
        if (isAlreadyMember) return;
        if (rowHighlighted) {
            unmarkFollowToSend(followObj);
            setRowHighlighted(false);
        } else {
            markFollowToSend(followObj);
            setRowHighlighted(true);
        }
    }

    return (
        <RowView backgroundColor={backgroundColor} onPress={markRow}>
            <UserInfoView>
                <ProfilePictureView>
                    <ProfilePicture user={creator} size={32} />
                </ProfilePictureView>
                <UsernameView>
                    <UsernameText isAlreadyMember={isAlreadyMember}>{followName}</UsernameText>
                </UsernameView>
            </UserInfoView>
            { (rowHighlighted || isAlreadyMember) && (
                <CheckmarkIconView>
                    { !isAlreadyMember && <CheckmarkIconWhiteFill /> }
                    <Icon type='ionicon' name={iconName} size={33} color={iconColor} />
                </CheckmarkIconView>                        
            )}
            {(!rowHighlighted && !isAlreadyMember) && (
                <CheckmarkIconView>
                    <Icon type='ionicon' name={'ellipse-outline'} size={33} color={'gray'} />
                </CheckmarkIconView>
            )}
        </RowView>
    )
}

const HeaderFollowerSearch = ({ onShareOut, searchText, updateSearchText }) => {
    const [showSearchBar, setShowSearchBar] = useState(false);
    const searchFieldRef = useRef(null);

    const searchIconOnPress = () => {
        if (showSearchBar) {
            if (searchText?.length > 0) {
                updateSearchText('');
            } else {
                setShowSearchBar(false);
            }
        } else {
            setShowSearchBar(true)
        }
    }

    useEffect(() => {
        if (showSearchBar && searchFieldRef?.current) {
            searchFieldRef.current?.focus();
        }
    }, [showSearchBar]);

    return (
        <HeaderSearchRow>
            { !showSearchBar && <HeaderText>{'Invite friends'}</HeaderText> }
            { showSearchBar && (
                <TextInput 
                    onChangeText={updateSearchText}
                    placeholder={'Search following...'}
                    placeholderTextColor={'gray'}
                    ref={searchFieldRef}
                    returnKeyType='done'
                    style={SearchInputStyle} 
                    value={searchText}
                />
            )}
            <HeaderSearchButtons>
                { (onShareOut && !showSearchBar) && (
                    <ShareIconPressable onPress={onShareOut}>
                        <ShareOutSVG />
                    </ShareIconPressable>
                )}
                <SearchIconPressable onPress={searchIconOnPress}>
                    <FontAwesomeIcon icon={showSearchBar ? faXmark : faMagnifyingGlass} size={24} color='white' />
                </SearchIconPressable>
            </HeaderSearchButtons>
        </HeaderSearchRow>
    );
}

export default InviteMyFollowsList = ({ clubMembers, followsToSend, onShareOut }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const bottomOffset = useSafeAreaInsets().bottom;
    const myFollowers = useSelector(state => state.myFollowers);
    const myFollowing = useSelector(state => state.myFollowing);
    const sortByFollowName = (followObj0, followObj1) => (followObj0.cleanedFollowName > followObj1.cleanedFollowName);

    const getMyFollows = () => {
        const iAmFollowing = (followObj) => (followObj.followerName === reelayDBUser?.username);
        const getFollowName = (followObj) => iAmFollowing(followObj) ? followObj.creatorName : followObj.followerName;
        const getFollowSub = (followObj) => iAmFollowing(followObj) ? followObj.creatorSub : followObj.followerSub;
    
        const allFollowsConcat = [...myFollowers, ...myFollowing].map((followObj) => {
            // allows us to treat the object the same whether it's a creator or a follower
            const followName = getFollowName(followObj);
            const cleanedFollowName = followName.toLowerCase();
            return {
                ...followObj,
                followIsCreator: iAmFollowing(followObj),
                followName,
                followSub: getFollowSub(followObj),
                cleanedFollowName,
            }
        });
    
        const allFollowsUnique = (allFollowsConcat.filter((followObj, index) => {
            const prevFollowIndex = allFollowsConcat.slice(0, index).findIndex((prevFollowObj) => {
                return (followObj.followName === prevFollowObj.followName);
            });
            return (prevFollowIndex === -1);
        })).sort(sortByFollowName);    
        return allFollowsUnique;
    }

    const allFollowsUnique = useRef(getMyFollows());
    const displayFollowsRef = useRef(allFollowsUnique?.current);
    const updateSearchCountRef = useRef(0);

    const [searchText, setSearchText] = useState('');
    const [tabIndex, setTabIndex] = useState(0);
    const tabRoutes = [
        { key: 'all', title: 'All' },
        { key: 'invites', title: 'Selected' }
    ];

    const renderFollowRow = ({ item, index }) => {
        const followObj = item;
        const findFollowMarked = (nextFollowObj) => nextFollowObj.followSub === followObj.followSub;
        const hasMarkedToSend = followsToSend.current.find(findFollowMarked);

        return(
            <FollowerRow key={index} 
                clubMembers={clubMembers} 
                followObj={followObj} 
                hasMarkedToSend={hasMarkedToSend}
                markFollowToSend={markFollowToSend}
                unmarkFollowToSend={unmarkFollowToSend}
            />
        );
    }

    const updateSearch = useCallback(async (newSearchText) => {
        if (!newSearchText.length) {
            displayFollowsRef.current = allFollowsUnique?.current;
        } else {
            const cleanedSearchText = newSearchText.toLowerCase();
            const matchSearchText = (followObj) => (followObj.cleanedFollowName.startsWith(cleanedSearchText));
            const filteredFollows = allFollowsUnique?.current.filter(matchSearchText);        
            const sortedFollows = filteredFollows.sort(sortByFollowName);
            displayFollowsRef.current = sortedFollows;
        }
        updateSearchCountRef.current += 1;
    }, []);

    const updateSearchText = (newSearchText) => {
        if (searchText !== newSearchText) {
            setSearchText(newSearchText);
            updateSearch(newSearchText);
        }
    }

    const markFollowToSend = (followObj) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        followsToSend.current.push(followObj);
        updateSearchText('');
    }

    const unmarkFollowToSend = (followObj) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        followsToSend.current = followsToSend.current.filter((nextFollowObj) => {
            return followObj.followSub !== nextFollowObj.followSub;
        });
        if (followsToSend.current.length === 0 && tabIndex === 1) {
            setTabIndex(0);
        }
    }

    const AllFollowsTab = () => {
        const [displayFollows, setDisplayFollows] = useState(displayFollowsRef?.current);
        const [updateSearchCount, setUpdateSearchCount] = useState(updateSearchCountRef?.current);

        useEffect(() => {
            const displayInterval = setInterval(() => {
                if (updateSearchCount !== updateSearchCountRef?.current) {
                    setDisplayFollows(displayFollowsRef.current);
                    setUpdateSearchCount(updateSearchCountRef?.current);
                }
            }, 200);
            return () => clearInterval(displayInterval);
        }, [updateSearchCount]);

        return (
            <Fragment>
                <FollowsList 
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 300, width: '100%' }}
                    data={displayFollows}
                    onScroll={Keyboard.dismiss}
                    renderItem={renderFollowRow}
                    showVerticalScrollIndicator={false}
                />
            </Fragment>
        );
    }

    const InvitesTab = () => {
        const [displayFollowsToSend, setDisplayFollowsToSend] = useState(followsToSend?.current);

        useEffect(() => {
            const inviteCountInterval = setInterval(() => {
                const stateString = JSON.stringify(displayFollowsToSend);
                const refString = JSON.stringify(followsToSend?.current);
                if (stateString !== refString) {
                    setDisplayFollowsToSend(followsToSend?.current);
                }
            }, 200);
            return () => clearInterval(inviteCountInterval);
        }, [displayFollowsToSend]);

        if (displayFollowsToSend.length === 0) {
            return (
                <NoOneInvitedYetPrompt>
                    <NoOneInvitedYetText>{'Add people from your following'}</NoOneInvitedYetText>
                    <Spacer />
                    <NoOneInvitedYetText>{'You can share an external invite link once you\'ve started the chat'}</NoOneInvitedYetText>
                </NoOneInvitedYetPrompt>
            )
        }

        return (
            <FollowsList 
                contentContainerStyle={{ marginTop: 12, width: '100%' }}
                data={displayFollowsToSend}
                renderItem={renderFollowRow}
                showVerticalScrollIndicator={false}
            />
        );
    }

    const InvitesTabLabel = ({ route, focused, color }) => {
        const [inviteCount, setInviteCount] = useState(followsToSend?.current?.length);
        const showInviteCount = (route.title === 'Selected' && inviteCount > 0);
        const labelText = (showInviteCount) ? `${route.title} (${inviteCount})` : route.title;

        useEffect(() => {
            const inviteCountInterval = setInterval(() => {
                const refFollowCount = followsToSend?.current?.length;
                if (inviteCount !== refFollowCount) {
                    setInviteCount(refFollowCount);
                }
            }, 200);
            return () => clearInterval(inviteCountInterval);
        }, [inviteCount]);

        return <TabLabelText>{labelText}</TabLabelText>;
    }

    const renderTabLabel = ({ route, focused, color }) => {
        return <InvitesTabLabel route={route} focused={focused} color={color} />
    }

    const renderTabBar = (props) => {
        return (
            <TabBar {...props} 
                indicatorStyle={{ backgroundColor: 'white', borderRadius: 4, height: 4 }}
                indicatorContainerStyle={{ backgroundColor: 'black' }} 
                renderLabel={renderTabLabel}
            />
        );
    }

    const renderScene = SceneMap({
        all: AllFollowsTab,
        invites: InvitesTab,
    })
    
    return (
        <KeyboardAvoidingView behavior='padding'>
            <HeaderFollowerSearch onShareOut={onShareOut} searchText={searchText} updateSearchText={updateSearchText} />
            <View style={{ height: height - 200, width: '100%' }}>
                <TabView 
                    initialLayout={{ width: width }}
                    navigationState={{ index: tabIndex, routes: tabRoutes }} 
                    onIndexChange={setTabIndex}
                    renderScene={renderScene}
                    renderTabBar={renderTabBar}
                />
            </View>
        </KeyboardAvoidingView>
    );
};
