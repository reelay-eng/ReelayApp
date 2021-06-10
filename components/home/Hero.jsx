import React, { useState } from 'react'
import { Dimensions, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native';
import ViewPager from '@react-native-community/viewpager'

import VideoPlayer from '../home/VideoPlayer'
import Info from '../home/Info'
import Sidebar from '../home/Sidebar'

const { height } = Dimensions.get('window');

const Container = styled(ViewPager)`
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
const Center = styled.View`
	flex: 1;
	flex-direction: row;
`

const Hero = ({ reelays }) => {
	const [selected, setSelected] = useState(0);
	console.log("Reelays in Hero: ");
	console.log(reelays);

	return (
		<Container
			orientation='vertical'
			onPageSelected={e => setSelected(e.nativeEvent.position)}
			initialPage={0}>
			{ reelays.map((reelay, index) => {

				console.log("Poster URI: " + reelay.movie.poster);

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
							<Center>
								<Info user={reelay.creator} />
								<Sidebar avatar={reelay.creator.avatar} stats={reelay.stats} />
							</Center>
						</Gradient>
					</View>
				);
			})}
		</Container>
	);
}

export default Hero;