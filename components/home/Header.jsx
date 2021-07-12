import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';

import { ReelayUploadStatus } from '../create-reelay/CreateReelaySlice';
import UploadProgressBar from '../create-reelay/UploadProgressBar';

const HeaderView = styled.View`
	top: 30px;
	width: 100%;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	position: absolute;
	z-index: 1;
`

const Header = () => {

	const uploadStatus = useSelector((state) => state.createReelay.upload.uploadStatus);
	
	return (
		<HeaderView>
			{ (uploadStatus == ReelayUploadStatus.UPLOAD_STAGED 
				|| uploadStatus == ReelayUploadStatus.UPLOAD_IN_PROGRESS)				
				&& <UploadProgressBar /> 
			}
		</HeaderView>
	)
}

export default Header;