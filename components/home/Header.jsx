import React from 'react';
import styled from 'styled-components/native';

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
	
	return (
		<HeaderView />
	)
}

export default Header;