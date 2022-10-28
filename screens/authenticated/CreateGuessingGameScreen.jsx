import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
    ActivityIndicator,
    Dimensions,
    Keyboard, 
    SafeAreaView, 
    TextInput, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    View,
} from 'react-native';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { HeaderWithBackButton } from '../../components/global/Headers';
import { GamesIconSVG } from '../../components/global/SVGs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TitlePoster from '../../components/global/TitlePoster';
import { getRuntimeString } from '../../components/utils/TitleRuntime';
import { postGuessingGameDraft } from '../../api/GuessingGameApi';
import { showErrorToast } from '../../components/utils/toasts';

const { width } = Dimensions.get('window');

const ActorText = styled(ReelayText.Subtitle2)`
    color: gray
`
const ContinueButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.disabled ? 'white' : ReelayColors.reelayBlue};
    border-radius: 40px;
    justify-content: center;
    height: 40px;
    width: ${width - 56}px;
`
const ContinueText = styled(ReelayText.Overline)`
    color: ${props => props.disabled ? 'gray' : 'white'};;
    font-size: 12px;
`
const CreateScreenView = styled(View)`
    background-color: black;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const HeaderView = styled(View)`
    top: ${props => props.topOffset}px;
    margin-bottom: 16px;
`
const ImageContainer = styled(View)`
    flex-direction: row;
    align-items: center;
`
const TitleInputField = styled(TextInput)`
    background-color: #1a1a1a;
    border-radius: 16px;
    color: white;
    font-family: Outfit-Regular;
    font-size: 18px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-top: 6px;
    padding: 16px;
    padding-left: 20px;
    padding-right: 20px;
`
const PromptText = styled(ReelayText.H5Bold)`
    color: white;
    display: flex;
    flex: 1;
    font-size: 24px;
    line-height: 32px;
`
const PromptView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 40px;
    margin-bottom: 12px;
`
const SectionView = styled(View)`
    margin-left: 12px;
    margin-right: 12px;
    margin-top: 16px;
`
const SectionViewBottom = styled(SectionView)`
    align-items: center;
    bottom: ${props => props.bottomOffset}px;
`
const TitleText = styled(ReelayText.Subtitle1Emphasized)`
    color: white
`
const TitleInfoView = styled(View)`
    margin-left: 12px;
    margin-right: 20px;
`
const TitleLineView = styled(View)`
    flex-direction: row;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 4px;
    width: 100%;
`
const YearText = styled(ReelayText.Subtitle2)`
    color: gray
`
const GAME_TITLE_MIN_LENGTH = 15;
const GAME_TITLE_MAX_LENGTH = 140;

export default CreateGuessingGameScreen = ({ navigation, route }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const [isSaving, setIsSaving] = useState(false);
    const topOffset = useSafeAreaInsets().top;
    const bottomOffset = useSafeAreaInsets().bottom;
    const clubID = route?.params?.clubID ?? null;
    const correctTitleObj = route?.params?.correctTitleObj;

    const dispatch = useDispatch();
    const titleFieldRef = useRef(null);
    const titleTextRef = useRef('');

    const actors = correctTitleObj?.displayActors?.map(actor => actor.name)
            .filter((actor) => actor !== undefined)
            .join(", ") 
        ?? [];


    const releaseYear = (correctTitleObj?.releaseDate && correctTitleObj?.releaseDate.length >= 4) 
        ? correctTitleObj.releaseDate.slice(0,4) : '';
    const runtimeString = getRuntimeString(correctTitleObj?.runtime);

    const focusTitle = () => titleFieldRef?.current && titleFieldRef.current.focus();

    const ContinueButton = () => {
        const isValidTitle = () => (titleTextRef.current.length >= GAME_TITLE_MIN_LENGTH);

        const onPress = async () => {
            if (!isValidTitle()) {
                showErrorToast(`Ruh roh! Your prompt needs to be at least ${GAME_TITLE_MIN_LENGTH} characters`);
                return;
            }
            setIsSaving(true);
            const titleKey = `${correctTitleObj?.titleType}-${correctTitleObj?.id}`;
            const postBody = {
                reqUserSub: reelayDBUser?.sub,
                clubID,
                correctTitleKey: titleKey,
                creatorName: reelayDBUser?.username,
                title: titleTextRef.current,
            }

            console.log('correct title: ', correctTitleObj);
            const saveDraftResult = await postGuessingGameDraft({
                authSession,
                reqUserSub: reelayDBUser?.sub,
                clubID,
                correctTitleKey: titleKey,
                creatorName: reelayDBUser?.username,
                title: titleTextRef.current,
            });

            console.log('save draft result: ', saveDraftResult);
            if (saveDraftResult?.error) {
                showErrorToast(`Ruh roh! Could not save a draft of your guessing game. Try again?`);
                return;
            }

            navigation.push('CreateGuessingGameCluesScreen', {
                game: { 
                    ...saveDraftResult, 
                    details: {
                        correctTitleKey: titleKey,
                        clueOrder: [],
                    },
                    correctTitleObj,
                    reelays: [],
                },
            });

            setIsSaving(false);
        }

        return (
            <ContinueButtonPressable onPress={onPress}>
                { isSaving && <ActivityIndicator /> }
                { !isSaving && <ContinueText>{'Continue'}</ContinueText> }
            </ContinueButtonPressable>
        );
    }

    const Header = () => {
        return (
            <HeaderView topOffset={topOffset}>
                <HeaderWithBackButton navigation={navigation} text={'back'} />
            </HeaderView>
        );
    }

    const TitleInput = () => {
        const changeTitleText = (text) => {
            titleTextRef.current = text;
        }    
        return (
            <SectionView>
                <TouchableWithoutFeedback onPress={focusTitle}>
                    <TitleInputField 
                        ref={titleFieldRef}
                        blurOnSubmit={true}
                        maxLength={GAME_TITLE_MAX_LENGTH}
                        multiline
                        defaultValue={titleTextRef.current}
                        placeholder={"What terrible netflix movie was like..."}
                        placeholderTextColor={'rgba(255,255,255,0.6)'}
                        onChangeText={changeTitleText}
                        onSubmitEditing={Keyboard.dismiss}
                        returnKeyLabel="done"
                        returnKeyType="done"
                    />
                </TouchableWithoutFeedback>   
            </SectionView> 
        );
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const CreatePrompt = () => {
        return (
            <PromptView>
                {/* <GamesIconSVG /> */}
                <PromptText>{'Write a prompt for your guessing game'}</PromptText>
            </PromptView> 
        );
    }

    const CorrectTitleLine = () => {
        return (
            <TitleLineView>
                <ImageContainer>
                    { correctTitleObj?.posterSource && (
                        <TitlePoster title={correctTitleObj} width={60} />
                    )}
                    { !correctTitleObj.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
                </ImageContainer>
                <TitleInfoView>
                    <TitleText>{correctTitleObj?.display}</TitleText>
                    <YearText>{`${releaseYear}    ${runtimeString}`}</YearText>
                    <ActorText>{actors}</ActorText>
                </TitleInfoView>
            </TitleLineView>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <CreateScreenView>
                <View style={{ display: 'flex' }}>
                    <Header />
                    <CreatePrompt />
                    <CorrectTitleLine />
                    <TitleInput />
                </View>
                <SectionViewBottom bottomOffset={bottomOffset}>
                    <ContinueButton />
                </SectionViewBottom>
            </CreateScreenView>
        </TouchableWithoutFeedback>
    );
};