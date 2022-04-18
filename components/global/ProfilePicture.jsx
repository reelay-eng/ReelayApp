import React, { useState, memo, useEffect } from 'react';
import { ActivityIndicator, Image, Pressable } from 'react-native';
import Constants from 'expo-constants';
import ReelayIcon from '../../assets/icons/reelay-icon-with-dog-black.png'
import styled from 'styled-components/native';
import { getSingleProfilePic } from '../../api/ReelayLocalImageCache';

const ProfileImage = styled(Image)`
    border-color: white;
    border-radius: ${(props) => props.size/2}px;
    border-width: ${(props) => (props.border) ? 1 : 0}px;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
`

export default ProfilePicture = memo(({ border = null, user, navigation, size = 16 }) => {
    const [validProfileImage, setValidProfileImage] = useState(true);
    const [source, setSource] = useState(ReelayIcon);
    const userSub = user?.sub ?? user?.attributes?.sub;

    const loadImage = async () => {
        const rand = String(Math.random()).substring(0,3);
        console.log('started loading profile pic: ', userSub, rand);
        const uri = await getSingleProfilePic(userSub);
        console.log('finished loading profile pic: ', userSub, rand);
        setSource({ uri });
    }

    useEffect(() => {
        loadImage();
    }, []);

    return (
        <Pressable onPress={() => {
            if (navigation) {
                navigation.push('UserProfileScreen', { creator: user });
            }
        }}>
            { validProfileImage ? null : (
                <ProfileImage border size={size} source={ReelayIcon} />) 
            }
            <ProfileImage
                border={border}
                size={size}
                source={source}
                style={(validProfileImage) ? {} : { display: 'none' }}
                PlaceholderContent={<ActivityIndicator />}
                onError={() => { setValidProfileImage(false) }}
            />
        </Pressable>
    )
}, (prevProps, nextProps) => {
    return (prevProps?.user?.sub === nextProps?.user?.sub);
});