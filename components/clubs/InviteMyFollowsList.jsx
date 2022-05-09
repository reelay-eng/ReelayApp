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
    color: ${(props) => (props.hasAlreadyJoined) ? 'gray' : 'white' };
`
const UsernameContainer = styled(View)`
    align-items: flex-start;
    justify-content: center;
`

const FollowerRow = ({ 
    navigation,
    followObj, 
    hasAlreadyJoined, 
    hasMarkedToSend, 
    markFollowToSend, 
    unmarkFollowToSend,
}) => {
    const [markedToSend, setMarkedToSend] = useState(hasMarkedToSend);
    const backgroundColor = (markedToSend) ? ReelayColors.reelayBlue : 'black';
    const iconName = (hasAlreadyJoined) ? 'checkmark-done' : 'checkmark';
    const iconColor = (hasAlreadyJoined) ? 'gray' : 'white';

    const { followSub, followName } = followObj;
    const creator = { sub: followSub, username: followName };
    
    const markRow = () => {
        if (hasAlreadyJoined) return;
        if (markedToSend) {
            const isMarked = unmarkFollowToSend(followObj);
            setMarkedToSend(isMarked);
        } else {
            const isMarked = markFollowToSend(followObj);
            setMarkedToSend(isMarked);    
        }
    }

    return (
        <RowContainer backgroundColor={backgroundColor} onPress={markRow}>
            <UserInfoContainer>
                <ProfilePictureContainer>
                    <ProfilePicture user={creator} size={32} navigation={navigation} />
                </ProfilePictureContainer>
                <UsernameContainer>
                    <UsernameText hasAlreadyJoined={hasAlreadyJoined}>{followName}</UsernameText>
                </UsernameContainer>
            </UserInfoContainer>
            { (markedToSend || hasAlreadyJoined) && (
                <CheckmarkIconContainer>
                    <Icon type='ionicon' name={iconName} size={30} color={iconColor} />
                </CheckmarkIconContainer>                        
            )}
            {(!markedToSend && !hasAlreadyJoined) && (
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

export default MyFollowsList = ({ 
    navigation,
    followsToSend, 
    readyToSend,
    setReadyToSend,
    // markFollowToSend, 
    // unmarkFollowToSend,
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const myFollowers = useSelector(state => state.myFollowers);
    const myFollowing = useSelector(state => state.myFollowing);
    const priorClubMembers = useRef([]);

    const markFollowToSend = useCallback((followObj) => {
        followsToSend.current.push(followObj);
        if (!readyToSend) {
            setReadyToSend(true);
        }
        console.log('marking follow', followsToSend.current, readyToSend);
        return true;
    }, []);

    const unmarkFollowToSend = useCallback((followObj) => {
        followsToSend.current = followsToSend.current.filter((nextFollowObj) => {
            return followObj.followSub !== nextFollowObj.followSub;
        });
        console.log('follows to send: ', followsToSend.current);
        if (!followsToSend.current.length) {
            setReadyToSend(false);
        }
        return false; // isMarked
    }, []);

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
    const [isLoaded, setIsLoaded] = useState(true);

    // const loadClubMembersAlready = async () => {
    //     // todo
    //     setIsLoaded(true);
    // }

    const updateSearch = useCallback(async (newSearchText) => {
        if (!newSearchText.length) {
            setDisplayFollows(allFollowsUnique);
        } else {
            const filteredFollows = allFollowsUnique.filter((followObj) => {
                const cleanedFollowName = followObj.followName.toLowerCase();
                const cleanedSearchText = newSearchText.toLowerCase();
                return cleanedFollowName.indexOf(cleanedSearchText) !== -1;
            });
            const sortedFollows = filteredFollows.sort(sortByFollowName);
            setDisplayFollows(sortedFollows);
        }
    }, []);

    // useEffect(() => {
    //     loadClubMembersAlready();
    // }, []);
    
    return (
        <React.Fragment>
            <FollowerSearch updateSearch={updateSearch} />
            <ScrollViewContainer>
                { isLoaded && displayFollows.map((followObj, index) => {
                    const hasMarkedToSend = followsToSend.current.find((nextFollowObj) => {
                        return (nextFollowObj.followSub === followObj.followSub);
                    });

                    const hasAlreadyJoined = priorClubMembers.current.find((member) => {
                        return member.userSub === followObj.followSub;
                    });

                    return <FollowerRow key={index} 
                        navigation={navigation}
                        followObj={followObj}
                        hasMarkedToSend={!!hasMarkedToSend}
                        hasAlreadyJoined={hasAlreadyJoined}
                        markFollowToSend={markFollowToSend}
                        unmarkFollowToSend={unmarkFollowToSend}
                    />;
                })}
            </ScrollViewContainer>
        </React.Fragment>
    );
};
