import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';

import { ReelayUploadStatus } from '../create-reelay/CreateReelaySlice';
import UploadProgressBar from '../create-reelay/UploadProgressBar';

const HeaderView = styled.View`
	top: 22px;
	width: 100%;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	position: absolute;
	z-index: 1;
`
const HeaderText = styled.Text`
	color: #fff;
	letter-spacing: 0.8px;
	margin: 11px 12px;
	font-weight: ${props => (props.bold ? 'bold' : 'normal')};
	opacity: ${props => (props.bold ? 1 : 0.8)};
	font-size: ${props => (props.bold ? '16px' : '15px')};
`
const FeedSeparator = styled.View`
	width: 1px;
	height: 13px;
	background-color: #d8d8d8;
	opacity: 0.6;
`
const FeedView = styled.View`
	align-items: center;
	flex-direction: row; 
`

const Header = () => {

	const uploadStatus = useSelector((state) => state.createReelay.upload.uploadStatus);
	
	return (
		<HeaderView>
			<FeedView>
				<HeaderText>Following</HeaderText>
				<FeedSeparator />
				<HeaderText bold='true'>For You</HeaderText>
			</FeedView>
			{ (uploadStatus == ReelayUploadStatus.UPLOAD_STAGED 
				|| uploadStatus == ReelayUploadStatus.UPLOAD_IN_PROGRESS)				
				&& <UploadProgressBar /> 
			}
		</HeaderView>
	)
}

export default Header;