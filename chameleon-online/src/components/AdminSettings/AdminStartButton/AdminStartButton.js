import React, {useState} from 'react';
import ShowWords from "./ShowWords/ShowWords";
import { CaretLeftIcon, CaretRightIcon} from 'react-open-iconic-svg';
import { FaCircle } from "react-icons/fa";
import './AdminStartButton.css';

import * as wordSetConstants from '../../../WordSets'
const wordSetTitles = wordSetConstants.WORD_SET_TITLES;
const wordSets = wordSetConstants.WORD_SETS;

function startGame(gameData, socket, setIsAdmin, room){
    // checks if the person clicking the button actually is an admin and hasn't just spoofed being one.
    socket.emit('startGame', {gameData, room})
}

const AdminStartButton = ({socket, admin, user, room}) => {
    console.log('Attempting to render admin options:')
    // TODO: Tidy this up using JSON data setters rather than individual ones for each thing.
    const [isAdmin, setIsAdmin] = useState(false)
    const [gameMode, setGameMode] = useState('Phobias');
    const [gameModeIndex, setGameModeIndex] = useState(0);
    const [numberOfChameleons, setNumberOfChameleons] = useState('');
    const [validNumberOfChameleons, setValidNumberOfChameleons] = useState('');

    const [wordSetPreview, setWordSetPreview] = useState('invisibleWordSetPreview')

    const [randMinChameleons, setRandMinChameleons] = useState('');
    const [validRandMinChameleons, setValidRandMinChameleons] = useState('');

    const [randMaxChameleons, setRandMaxChameleons] = useState('');
    const [validRandMaxChameleons, setValidRandMaxChameleons] = useState('');

    //states for selection stuff:
    const [chameleonButton1State, setChameleonButton1State] = useState('chameleonButtonActive chameleonButton');
    const [chameleonButton2State, setChameleonButton2State] = useState('chameleonButtonInactive chameleonButton');

    const [chameleonTextState1, setChameleonTextState1] = useState('');
    const [chameleonTextState2, setChameleonTextState2] = useState('greyedOut');

    const [wordSetButton1State, setWordSetButton1State] = useState('chameleonButtonActive chameleonButton');
    const [wordSetButton2State, setWordSetButton2State] = useState('chameleonButtonInactive chameleonButton');

    const [wordSetTextState1, setWordSetTextState1] = useState('');
    const [wordSetTextState2, setWordSetTextState2] = useState('greyedOut');

    const [wordInput1, setWordInput1] = useState('');
    const [wordInput2, setWordInput2] = useState('inactiveInput');

    const [chameleonInput1, setChameleonInput1] = useState('');
    const [chameleonInput2, setChameleonInput2] = useState('inactiveInput');

    const [customWords, setCustomWords] = useState('')

    const handleChange = (e, setter, validSetter) => {
        if (!isNaN(e.target.value) && (parseInt(e.target.value) < 10)) {
            validSetter(e.target.value);
        } else if (!isNaN(e.target.value)) {
            setter(numberOfChameleons);
        } else {
            setter('');
        }
    };


    function onKeyDown (e, setter) {
        // 8 : backspace, 46 : delete
        if (e.keyCode === 8 || e.keyCode === 46) {
            setter('');
        }
    }

    function updateActiveChameleonMode (buttonPressed) {
        if (buttonPressed === '1') {
            setChameleonButton1State('chameleonButtonActive chameleonButton')
            setChameleonButton2State('chameleonButtonInactive chameleonButton')
            setChameleonTextState1('')
            setChameleonTextState2('greyedOut')
            setChameleonInput1('')
            setChameleonInput2(' inactiveInput')
        } else if (buttonPressed === '2') {
            setChameleonButton1State('chameleonButtonInactive chameleonButton')
            setChameleonButton2State('chameleonButtonActive chameleonButton')
            setChameleonTextState2('')
            setChameleonTextState1('greyedOut')
            setChameleonInput2('')
            setChameleonInput1('inactiveInput')
        }
    }

    function updateWordSetMode (buttonPressed) {
        if (buttonPressed === '1') {
            setWordSetButton1State('chameleonButtonActive chameleonButton')
            setWordSetButton2State('chameleonButtonInactive chameleonButton')
            setWordSetTextState1('')
            setWordSetTextState2('greyedOut')
            setWordInput1('')
            setWordInput2('inactiveInput')

        } else if (buttonPressed === '2') {
            setWordSetButton1State('chameleonButtonInactive chameleonButton')
            setWordSetButton2State('chameleonButtonActive chameleonButton')
            setWordSetTextState2('')
            setWordSetTextState1('greyedOut')
            setWordInput2('')
            setWordInput1('inactiveInput')
        }
    }

    // when Admin presses start, generates the necessary information to send to server to start game.
    function createGameForm (){
        let isChameleonNumberRandom = (chameleonInput2 === '');
        let chameleonNumber;
        let randChameleonNumberMin;
        let randChameleonNumberMax;
        // determine if chameleon number is random or not and set return info accordingly
        if (isChameleonNumberRandom){
            if(validRandMinChameleons !== '' && validRandMinChameleons){
                randChameleonNumberMin = validRandMinChameleons;
            } else {
                randChameleonNumberMin = 1;
            }
            if(validRandMaxChameleons !== '' && validRandMaxChameleons){
                randChameleonNumberMax = validRandMaxChameleons;
            } else {
                randChameleonNumberMax = 2
            }
        } else {
            //info not random
            if (validNumberOfChameleons !== '' && validNumberOfChameleons) {
                chameleonNumber = validNumberOfChameleons

            } else {
                chameleonNumber = 1;
            }
        }

        let isWordSetCustom = (wordInput2 === '')
        let wordSetName;
        let wordSet;
        if (isWordSetCustom) {
            wordSetName = 'Custom';
            wordSet = customWords;
        } else {
            // non custom word set
            wordSetName = wordSetTitles[gameModeIndex % wordSetTitles.length]
            wordSet = wordSets[wordSetName]
        }

        return {
            isChameleonNumberRandom: isChameleonNumberRandom,
            chameleonNumber: chameleonNumber,
            randChameleonNumberMin: randChameleonNumberMin,
            randChameleonNumberMax: randChameleonNumberMax,

            isWordSetCustom: isWordSetCustom,
            wordSetName: wordSetName,
            wordSet: wordSet
        }
    }

    function changeWordSet(direction){
        if (direction.toLowerCase() === 'r'){
            setGameMode(wordSetTitles[((gameModeIndex + 1) % wordSetTitles.length)])
            setGameModeIndex(gameModeIndex + 1);
        }
        if (direction.toLowerCase() === 'l'){
            setGameMode(wordSetTitles[((gameModeIndex + 1) % wordSetTitles.length)])
            setGameModeIndex(gameModeIndex - 1);
        }
    }

    if (admin.name === user) {
        return (
            <div className = "gameFormContainer">
            {/*<div id = "darkenedBackground" className = {wordSetPreview}>
            </div>*/}

            <ShowWords isVisible = {wordSetPreview+"Child"} wordSet = {wordSetTitles[gameModeIndex % (wordSetTitles.length)]}/>
            <div className ={wordSetPreview+"Button"}>
            <button onClick = {()=>setWordSetPreview('invisibleWordSetPreview')} className="formButton backFromPreviewButton"> back </button>
            </div>
            <div className = "setUpGameForm">
                <div className = "chameleonsFormSubtitle formElements"><span>Number of chameleons:</span></div>
                    <div className =  "formElements chameleonNumber">
                        <FaCircle onClick = {() => updateActiveChameleonMode('1')}className = {chameleonButton1State}/>
                        <span className = {chameleonTextState1}>Constant:</span>
                        <input
                            placeholder = "1"
                        value = {validNumberOfChameleons}
                        className ={'chameleonNumberInput '+ chameleonInput1}
                        onChange={e => handleChange(e, setNumberOfChameleons, setValidNumberOfChameleons)}
                        onKeyDown={e=>onKeyDown(e, setValidNumberOfChameleons)}>
                        </input>
                    </div>
                <div className =  "formElements randomChameleonNumber">
                    <FaCircle onClick = {() => updateActiveChameleonMode('2')} className ={chameleonButton2State}/>
                        <span className = {chameleonTextState2}>Random: Between </span>
                        <input
                            placeholder = "1"
                        value = {validRandMinChameleons}
                        className = {'chameleonNumberInput ' + chameleonInput2}
                        onChange={e => handleChange(e, setRandMinChameleons, setValidRandMinChameleons)}
                        onKeyDown={e=>onKeyDown(e, setValidRandMinChameleons)}>
                        </input>
                        <span className = {chameleonTextState2}> and </span>
                        <input
                            placeholder = "2"
                        value = {validRandMaxChameleons}
                        className = {'chameleonNumberInput '+ chameleonInput2}
                        onChange={e => handleChange(e, setRandMaxChameleons, setValidRandMaxChameleons)}
                        onKeyDown={e=>onKeyDown(e, setValidRandMaxChameleons)}>
                        </input>
                </div>
                <div className = "formElements chameleonsFormSubtitle"><span>Word set:</span></div>
                <div className ="formElements wordSet">
                    <FaCircle onClick = {() => updateWordSetMode('1')} className ={wordSetButton1State}/>
                    <span className = {wordSetTextState1}>Word Set: </span>
                    <CaretLeftIcon onClick={()=>changeWordSet('r')} className = {wordInput1 + " arrow leftArrow"}/>
                    <div className ="gameMode"><span>{gameMode}</span></div>
                    <CaretRightIcon onClick={()=>changeWordSet('r')} className = {wordInput1 + " arrow rightArrow"}/>
                    <button onClick = {()=> setWordSetPreview('wordSetPreview')} className = {wordInput1 + " formButton seeWordsButton"}>See words</button>
                </div>

                <div className ="formElements customWordSet">
                    <FaCircle onClick = {() => updateWordSetMode('2')} className ={wordSetButton2State}/>
                    <span className = {wordSetTextState2}>Custom. (Enter words below) </span>

                </div>
                <div className ="formElements">
                    <textarea className = {"customWordsInput " + wordInput2}
                              value={customWords}
                              onChange={({target: {value}}) => setCustomWords(value)}
                              placeholder='Separate words with commas...'> </textarea>
                </div>
                <button onClick={() =>startGame(createGameForm(), socket, setIsAdmin, room)} className = "formElements formButton startGameButton">Start</button>
            </div>
        </div>
    )
    }
    else {
        // dont render anything here.
        return null;
    }
}

export default AdminStartButton;