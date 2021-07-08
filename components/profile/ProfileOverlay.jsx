import React, { useContext } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Overlay, Text } from 'react-native-elements';
import { AuthStyles, TextStyles } from '../../styles';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';

export default ProfileOverlay = ({ navigation, onClose }) => {

    const authContext = useContext(AuthContext);

    const signOut = async () => {
        // todo: confirm sign out
        const signOutResult = await Auth.signOut()
            .then((result) => {
                console.log(result);
                authContext.setSignedIn(false);
                authContext.setUser({});
                authContext.setSession({});
                authContext.setCredentials({});
            }).catch((result) => {
                console.log('Could not sign out user');
                console.log(result);
            });
    }

    return (
        <Overlay 
            fullScreen={true} 
            overlayStyle={{ 
                backgroundColor: 'black',
                alignItems: 'flex-end',
                opacity: 0.8,
            }}>
            <View style={{ marginTop: 100 }}>
                <Pressable onPress={onClose} style={{ 
                    marginBottom: 40,
                    alignSelf: 'flex-end',
                }}>
                    <Text style={AuthStyles.systemText16}>{'Close'}</Text>
                </Pressable>
                <Pressable onPress={() => { 
                    console.log('Pressed invite');
                }} style={{ 
                    marginBottom: 40, 
                    alignSelf: 'flex-end',            
                }}>
                    <Text style={AuthStyles.systemText16}>{'Invite'}</Text>
                </Pressable>
                <Pressable onPress={() => { 
                    console.log('Pressed about')
                }} style={{ 
                    marginBottom: 40,
                    alignSelf: 'flex-end',
                }}>
                    <Text style={AuthStyles.systemText16}>{'About'}</Text>
                </Pressable>
                <Pressable onPress={() => { 
                    console.log('Pressed settings')
                }} style={{ 
                    marginBottom: 40,
                    alignSelf: 'flex-end',
                }}>
                    <Text style={AuthStyles.systemText16}>{'Settings'}</Text>
                </Pressable>
                <Pressable onPress={() => { 
                    console.log('Pressed TMDB credit')
                }} style={{ 
                    marginBottom: 40,
                    alignSelf: 'flex-end',
                }}>
                    <Text style={AuthStyles.systemText16}>{'TMDB Credit'}</Text>
                </Pressable>
                <Pressable onPress={() => { 
                    console.log('Pressed report a problem')
                }} style={{ 
                    marginBottom: 40,
                    alignSelf: 'flex-end',
                }}>
                    <Text style={AuthStyles.systemText16}>{'Report a problem'}</Text>
                </Pressable>
                <Pressable onPress={signOut} style={{ 
                    marginBottom: 40,
                    alignSelf: 'flex-end',
                }}>
                    <Text style={AuthStyles.systemText16}>{'Sign out'}</Text>
                </Pressable>
            </View>
        </Overlay>
    );
}