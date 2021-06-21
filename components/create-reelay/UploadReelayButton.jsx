import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-native-elements';

const UploadReelayButton = () => {
    const uploadDialog = () => {
        console.log('upload dialog initiated');
    }

    return (
        <Button type='solid' title='Post' onPress={uploadDialog} />
    );
};

export default UploadReelayButton;