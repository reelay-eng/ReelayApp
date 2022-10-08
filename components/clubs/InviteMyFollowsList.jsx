import React, { useState, useRef, useContext, useCallback, useEffect } from 'react';
import { Dimensions, FlatList, Pressable, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';

import ProfilePicture from '../global/ProfilePicture';
import SearchField from '../create-reelay/SearchField';
import { AuthContext } from '../../context/AuthContext';

import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';

const { width } = Dimensions.get('window');

const CheckmarkIconContainer = styled(View)`
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
const DisplayFollowsToSendView = styled(View)`
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;  
`
const FollowPillView = styled(View)`
    align-items: center;
    background-color: #1a1a1a;
    border-radius: 8px;
    flex-direction: row;
    margin-right: 8px;
    margin-bottom: 8px;
    padding: 8px;
`
const FollowsList = styled(FlatList)`
    margin-bottom: 10px;
`
const ProfilePictureContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const RowContainer = styled(TouchableOpacity)`
    display: flex;
    align-items: center;
    background-color: black;
    flex-direction: row;
    justify-content: space-between;
    padding: 6px;
    padding-left: 12px;
    padding-right: 12px;
`
const SearchFieldContainer = styled(View)`
    width: 100%;
`
const UserInfoContainer = styled(View)`
    flex-direction: row;
`
const UsernameText = styled(ReelayText.Subtitle1Emphasized)`
    color: ${(props) => (props.isAlreadyMember) ? 'gray' : 'white' };
`
const UsernameContainer = styled(View)`
    align-items: flex-start;
    justify-content: center;
`

const FollowerRow = ({ 
    clubMembers, 
    displayFollowsToSend, 
    setDisplayFollowsToSend, 
    followObj, 
    followsToSend,
}) => {
    const { followSub, followName } = followObj;
    const creator = { sub: followSub, username: followName };

    const findFollowMarked = (nextFollowObj) => nextFollowObj.followSub === followObj.followSub;
    const hasMarkedToSend = followsToSend.current.find(findFollowMarked);
    const [rowHighlighted, setRowHighlighted] = useState(hasMarkedToSend);

    const backgroundColor = 'black';
    const iconName = (isAlreadyMember) ? 'checkmark-done' : 'checkmark-circle';
    const iconColor = (isAlreadyMember) ? 'gray' : ReelayColors.reelayBlue;

    const findFollowInMembers = (member) => member.userSub === followSub;
    const isAlreadyMember = clubMembers.find(findFollowInMembers);
    if (isAlreadyMember && isAlreadyMember?.role === 'banned') {
        return <View key={followSub} />
    }
    
    const markFollowToSend = () => {
        followsToSend.current.push(followObj);
        setDisplayFollowsToSend([...followsToSend.current]);
        return true;
    };

    const unmarkFollowToSend = () => {
        followsToSend.current = followsToSend.current.filter((nextFollowObj) => {
            return followObj.followSub !== nextFollowObj.followSub;
        });
        setDisplayFollowsToSend([...followsToSend.current]);
        return false; // isMarked
    };

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
        <RowContainer backgroundColor={backgroundColor} onPress={markRow}>
            <UserInfoContainer>
                <ProfilePictureContainer>
                    <ProfilePicture user={creator} size={32} />
                </ProfilePictureContainer>
                <UsernameContainer>
                    <UsernameText isAlreadyMember={isAlreadyMember}>{followName}</UsernameText>
                </UsernameContainer>
            </UserInfoContainer>
            { (rowHighlighted || isAlreadyMember) && (
                <CheckmarkIconContainer>
                    { !isAlreadyMember && <CheckmarkIconWhiteFill /> }
                    <Icon type='ionicon' name={iconName} size={33} color={iconColor} />
                </CheckmarkIconContainer>                        
            )}
            {(!rowHighlighted && !isAlreadyMember) && (
                <CheckmarkIconContainer>
                    <Icon type='ionicon' name={'ellipse-outline'} size={33} color={'gray'} />
                </CheckmarkIconContainer>
            )}
        </RowContainer>
    )
}

const FollowerSearch = ({ updateSearch }) => {
    const [searchText, setSearchText] = useState('');

    const updateSearchText = (newSearchText) => {
        if (searchText !== newSearchText) {
            setSearchText(newSearchText);
            updateSearch(newSearchText);
        }
    }
    return (
        <SearchFieldContainer>
            <SearchField
                borderRadius={4}
                searchText={searchText}
                updateSearchText={updateSearchText}
                placeholderText={`Search followers and following...`} />
        </SearchFieldContainer>
    );
}

const DisplayFollowsToSend = ({ displayFollowsToSend, setDisplayFollowsToSend, followsToSend }) => {
    return (
        <DisplayFollowsToSendView>
            { displayFollowsToSend.map(followObj => {
                const { followSub, followName } = followObj;
                const user = { sub: followSub, username: followName };
                return (
                    <FollowPillView key={followSub}>
                        <ProfilePicture user={user} />
                        <UsernameText isAlreadyMember={false}>{followName}</UsernameText>
                    </FollowPillView>
                );
            })}
        </DisplayFollowsToSendView>
    );
}

export default InviteMyFollowsList = ({ clubMembers, followsToSend }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const myFollowers = useSelector(state => state.myFollowers);
    const myFollowing = useSelector(state => state.myFollowing);
    const sortByFollowName = (followObj0, followObj1) => (followObj0.followName > followObj1.followName);

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
    const [displayFollows, setDisplayFollows] = useState(allFollowsUnique?.current);
    const [displayFollowsToSend, setDisplayFollowsToSend] = useState(followsToSend?.current);

    const updateSearch = useCallback(async (newSearchText) => {
        if (!newSearchText.length) {
            setDisplayFollows(allFollowsUnique?.current);
        } else {
            const cleanedSearchText = newSearchText.toLowerCase();
            const matchSearchText = (followObj) => (followObj.cleanedFollowName.startsWith(cleanedSearchText));
            const filteredFollows = allFollowsUnique?.current.filter(matchSearchText);        
            const sortedFollows = filteredFollows.sort(sortByFollowName);
            setDisplayFollows(sortedFollows);
        }
    }, []);

    const renderFollowRow = ({ item, index }) => {
        const followObj = item;
        return(
            <FollowerRow key={index} 
                clubMembers={clubMembers} 
                displayFollowsToSend={displayFollowsToSend}
                setDisplayFollowsToSend={setDisplayFollowsToSend}
                followObj={followObj} 
                followsToSend={followsToSend} 
            />
        );
    }
    
    return (
        <React.Fragment>
            <DisplayFollowsToSend 
                displayFollowsToSend={displayFollowsToSend}
                setDisplayFollowsToSend={setDisplayFollowsToSend}     
                followsToSend={followsToSend}       
            />
            <FollowerSearch updateSearch={updateSearch} />
            <FollowsList 
                contentContainerStyle={{ width: '100%' }}
                data={displayFollows}
                renderItem={renderFollowRow}
                showVerticalScrollIndicator={false}
            />
        </React.Fragment>
    );
};
