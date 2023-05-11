import React, {useState} from 'react';
import HighlightAdmin from "../../../LobbyPlayerDisplays/HighlightAdmin";

import './ShowWords.css';

import * as wordSetConstants from '../../../../WordSets.js'
const wordSets = wordSetConstants.WORD_SETS;

const ShowWords = ({isVisible, wordSet}) => {
    console.log('wordset?', wordSet, wordSets[wordSet]);
    return(
        <div className = {isVisible}>
            {wordSets[wordSet] ? (
                    <div className="outerPreviewContainer">
                        {wordSets[wordSet].map((element, i) => (
                            <div key = {i} className="wordPreviewElements">{element}</div>
                        ))}
                    </div>
                )
                : null
            }
        </div>
    )
}

export default ShowWords;