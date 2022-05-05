import React, { useState, memo } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import ReelayIcon from '../../assets/icons/reelay-icon-with-dog-black.png'
import styled from 'styled-components/native';
import { getClubPicURI } from '../../api/ReelayLocalImageCache';

const ProfileImage = styled(Image)`
    border-color: white;
    border-radius: ${(props) => props.size/2}px;
    border-width: ${(props) => (props.border) ? 1 : 0}px;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
`

export default ClubPicture = ({ border = null, club, navigation, size = 16 }) => {
    const [loadState, setLoadState] = useState('local');

    const getClubPicSource = () => {
        if (loadState === 'local') {
            return { uri: getClubPicURI(club.id, true) };
        } else if (loadState === 'remote') {
            return { uri: getClubPicURI(club.id, false) };
        } else {
            return ReelayIcon;
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
        <View>
            { (loadState === 'default') && 
                <ProfileImage border size={size} source={ReelayIcon} /> 
            }
            <ProfileImage
                border={border}
                size={size}
                source={getClubPicSource()}
                style={(loadState === 'default') ? { display: 'none' } : {}}
                PlaceholderContent={<ActivityIndicator />}
                onError={onLoadError}
            />
        </View>
    );
};