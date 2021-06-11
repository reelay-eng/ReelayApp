import React, { useState } from 'react'
import { Dimensions, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';

import VideoPlayer from '../home/VideoPlayer'
import Info from '../home/Info'
import Sidebar from '../home/Sidebar'

const { height } = Dimensions.get('window');

const PagerViewContainer = styled(PagerView)`
	height: ${height}px;
`
const Gradient = styled(LinearGradient)`
	height: 100%;
	justify-content: space-between;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 1;
`
const Overlay = styled.View`
	flex: 1;
	flex-direction: row;
`

const Words = styled.Text

const Hero = ({ reelays }) => {
	const [selected, setSelected] = useState(0);

	return (
		<PagerViewContainer 
			initialPage={0}
			orientation='vertical'
			onPageSelected={e => setSelected(e.nativeEvent.position)}
		>
			{ reelays.map((reelay, index) => {
				return (
					<View key={index}>
						<VideoPlayer
							videoURI={reelay.videoURI}
							poster={require('../../assets/images/splash.png')}
							isPlay={selected === index}
						/>
						<Gradient
							locations={[0, 0.26, 0.6, 1]}
							colors={[
								'rgba(26,26,26,0.6)',
								'rgba(26,26,26,0)',
								'rgba(26,26,26,0)',
								'rgba(26,26,26,0.6)'
							]}>
							<Overlay>
								<Info user={reelay.creator} movie={reelay.movie} />
								<Sidebar avatar={reelay.creator.avatar} stats={reelay.stats} />
							</Overlay>
						</Gradient>
					</View>
				);
			})}
		</PagerViewContainer>
	);
}  

export default Hero;