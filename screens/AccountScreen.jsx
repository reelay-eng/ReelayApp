import React, { useContext } from 'react';
import { Image, View, SafeAreaView, TouchableHighlight } from 'react-native';
import { Icon, Text } from 'react-native-elements';

import { AuthStyles } from '../styles';
import { AuthContext } from '../context/AuthContext';

export default AccountScreen = ({ navigation, route }) => {

    const authContext = useContext(AuthContext);
    const user = authContext.user;
    const { setOverlayVisible } = route.params;

    console.log(user);

    return (
        <SafeAreaView style={{
            height: '100%',
            width: '100%',
            backgroundColor: 'black',
        }}>
            <View style={{
                flex: 0.1,
                flexDirection: 'row'
            }}>
                <Icon type='ionicon' name='chevron-back-outline' color={'white'} size={30} 
                    onPress={() => {
                        navigation.pop();
                        setOverlayVisible(true);
                    }}
                    style={AuthStyles.backButton}/>
                <Text h3 style={AuthStyles.headerText}>{'Account Settings'}</Text>
            </View>
            <View style={{ 
                flex: 1, 
            }}>
                <TouchableHighlight style={{
                    borderRadius: 75,
                    width: 150,
                    height: 150,
                    borderColor: 'white',
                    borderWidth: 1,
                    alignSelf: 'center',
                }}>
                    <Image source={{ uri: '../assets/images/icon.png' }} 
                        style={{ height: 150, width: 150 }} />
                </TouchableHighlight>
                <Text h4 style={{
                    ...AuthStyles.headerText,
                    alignSelf: 'center',
                    margin: 10,
                }}>{'@' + user.username}</Text>
            </View>
        </SafeAreaView>
    );
}