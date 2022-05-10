import React, { useState, useRef, useContext, useCallback, useEffect } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';

import ProfilePicture from '../global/ProfilePicture';
import SearchField from '../create-reelay/SearchField';
import { AuthContext } from '../../context/AuthContext';

import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import { ScrollView } from 'react-native-gesture-handler';
import ReelayColors from '../../constants/ReelayColors';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const CheckmarkIconContainer = styled(View)`
    align-items: center;
    justify-content: center;
    height: 30px;
    width: 30px;
`
const ProfilePictureContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const RowContainer = styled(Pressable)`
    display: flex;
    align-items: center;
    background-color: ${(props) => props.backgroundColor};
    flex-direction: row;
    justify-content: space-between;
    padding: 6px;
    padding-left: 20px;
    padding-right: 20px;
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;    
`
const ScrollViewContainer = styled(ScrollView)`
    margin-bottom: 10px;
`
const SearchFieldContainer = styled(View)`
    width: ${width * 1.05}px;
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
    followObj, 
    isAlreadyMember, 
    hasMarkedToSend, 
    markFollowToSend, 
    unmarkFollowToSend,
}) => {
    const [rowHighlighted, setRowHighlighted] = useState(hasMarkedToSend);
    const backgroundColor = (rowHighlighted) ? ReelayColors.reelayBlue : '#1a1a1a';
    const iconName = (isAlreadyMember) ? 'checkmark-done' : 'checkmark';
    const iconColor = (isAlreadyMember) ? 'gray' : 'white';

    const { followSub, followName } = followObj;
    const creator = { sub: followSub, username: followName };
    
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
                    <Icon type='ionicon' name={iconName} size={30} color={iconColor} />
                </CheckmarkIconContainer>                        
            )}
            {(!rowHighlighted && !isAlreadyMember) && (
                <CheckmarkIconContainer>
                    <Icon type='ionicon' name={'person-add'} size={20} color={iconColor} />
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

export default InviteMyFollowsList = ({ clubMembers, followsToSend, }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const myFollowers = useSelector(state => state.myFollowers);
    const myFollowing = useSelector(state => state.myFollowing);

    const markFollowToSend = (followObj) => {
        followsToSend.current.push(followObj);
        return true;
    };

    const unmarkFollowToSend = (followObj) => {
        followsToSend.current = followsToSend.current.filter((nextFollowObj) => {
            return followObj.followSub !== nextFollowObj.followSub;
        });
        return false; // isMarked
    };

    const iAmFollowing = (followObj) => (followObj.followerName === reelayDBUser?.username);
    const getFollowName = (followObj) => iAmFollowing(followObj) ? followObj.creatorName : followObj.followerName;
    const getFollowSub = (followObj) => iAmFollowing(followObj) ? followObj.creatorSub : followObj.followerSub;
    const sortByFollowName = (followObj0, followObj1) => (followObj0.followName > followObj1.followName);

    const allFollowsConcat = [...myFollowers, ...myFollowing].map((followObj) => {
        // allows us to treat the object the same whether it's a creator or a follower
        return {
            ...followObj,
            followIsCreator: iAmFollowing(followObj),
            followName: getFollowName(followObj),
            followSub: getFollowSub(followObj),
        }
    });

    const allFollowsUnique = (allFollowsConcat.filter((followObj, index) => {
        const prevFollowIndex = allFollowsConcat.slice(0, index).findIndex((prevFollowObj) => {
            return (followObj.followName === prevFollowObj.followName);
        });
        return (prevFollowIndex === -1);
    })).sort(sortByFollowName);

    const [displayFollows, setDisplayFollows] = useState(allFollowsUnique);

    const updateSearch = useCallback(async (newSearchText) => {
        if (!newSearchText.length) {
            setDisplayFollows(allFollowsUnique);
        } else {
            const cleanedSearchText = newSearchText.toLowerCase();
            const filteredFollows = allFollowsUnique.filter((followObj) => {
                const cleanedFollowName = followObj.followName.toLowerCase();
                return cleanedFollowName.indexOf(cleanedSearchText) !== -1;
            });
            const sortedFollows = filteredFollows.sort(sortByFollowName);
            setDisplayFollows(sortedFollows);
        }
    }, []);
    
    return (
        <React.Fragment>
            <FollowerSearch updateSearch={updateSearch} />
            <ScrollViewContainer>
                { displayFollows.map((followObj, index) => {
                    const findFollowMarked = (nextFollowObj) => nextFollowObj.followSub === followObj.followSub;
                    const hasMarkedToSend = followsToSend.current.find(findFollowMarked);

                    const findFollowInMembers = (member) => member.userSub === followObj.followSub;
                    const isAlreadyMember = clubMembers.find(findFollowInMembers);

                    return <FollowerRow key={index} 
                        followObj={followObj}
                        hasMarkedToSend={!!hasMarkedToSend}
                        isAlreadyMember={isAlreadyMember}
                        markFollowToSend={markFollowToSend}
                        unmarkFollowToSend={unmarkFollowToSend}
                    />;
                })}
            </ScrollViewContainer>
        </React.Fragment>
    );
};
