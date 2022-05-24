import React, { useState, memo } from 'react';
import { ActivityIndicator, Image, Pressable } from 'react-native';
import ReelayIcon from '../../assets/icons/reelay-icon-with-dog-black.png'
import styled from 'styled-components/native';
import { cacheProfilePic, checkRefreshProfilePic, getProfilePicURI } from '../../api/ReelayLocalImageCache';

const ProfileImage = styled(Image)`
    border-color: white;
    border-radius: ${(props) => props.size/2}px;
    border-width: ${(props) => (props.border) ? 1 : 0}px;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
`

export default ProfilePicture = memo(({ border = null, user, navigation, size = 16 }) => {
    const userSub = user?.sub ?? user?.attributes?.sub;
    const [loadState, setLoadState] = useState('local');

    const getProfilePicSource = () => {
        if (loadState === 'local') {
            return { uri: getProfilePicURI(userSub, true) };
        } else if (loadState === 'remote') {
            return { uri: getProfilePicURI(userSub, false) };
        } else {
            return ReelayIcon;
        }
    }

    const onLoad = () => {
        // if we can only load the default club pic, cache that one
        // else, cache the one in cloudfront
        if (loadState === 'local') {
            checkRefreshProfilePic(user?.sub);
        } else if (loadState === 'remote') {
            cacheProfilePic(user?.sub, false);
        } else if (loadState === 'default') {
            cacheProfilePic(user?.sub, true);
        }
    }

    const onLoadError = () => {
        if (loadState === 'local') {
            setLoadState('remote');
        } else if (loadState === 'remote') {
            setLoadState('default');
        }
    }

    return (
        <Pressable onPress={() => {
            if (navigation) {
                navigation.push('UserProfileScreen', { creator: user });
            }
        }}>
            { (loadState === 'default') && 
                <ProfileImage border size={size} source={ReelayIcon} /> 
            }
            <ProfileImage
                border={border}
                size={size}
                source={getProfilePicSource()}
                style={(loadState === 'default') ? { display: 'none' } : {}}
                PlaceholderContent={<ActivityIndicator />}
                onLoad={onLoad}
                onError={onLoadError}
            />
        </Pressable>
    );
}, (prevProps, nextProps) => {
    return (prevProps?.user?.sub === nextProps?.user?.sub);
});