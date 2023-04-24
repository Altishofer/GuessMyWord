import React, { useEffect, useState } from "react";
import "./styles.css";

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import nlp from 'compromise'

const wordTypes = ["noun", "verb", "adjective", "adverb", "preposition"];
const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

function Index() {
    const [countWordsCorrect, setCountWordsCorrect] = useState(-1);
    const [showOverlayEndGame, setOverlayEndGame] = useState(false);
    const [showOverlayNextLevel, setShowOverlayNextLevel] = useState(false);
    const [guessedCorrectly, setGuessedCorrectly] = useState(false);
    const [displayedWord, setDisplayedWord] = useState("");
    const [definitions, setDefinitions] = useState([]);
    const [examples, setExamples] = useState([]);
    const [hintIndex, setHintIndex] = useState(20);
    const [letterShown, setLetterShown] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [wordType, setWordType] = useState(wordTypes[0]);
    const [cefrLevel, setCefrLevel] = useState(cefrLevels[0]);
    const [word, setWord] = useState("");
    const [error, setError] = useState("");
    const [publicDefinitions, setPublicDefinitions] = useState([]);
    const [publicExamples, setPublicExamples] = useState([]);
    const [activatedWordTypes, setActivatedWordTypes] = useState(
        wordTypes.map(() => false)
    );
    const [activatedCefrLevels, setActivatedCefrLevels] = useState(
        cefrLevels.map(() => false)
    );
    const [countRequest, setCountRequest] = useState(0);


    useEffect(() => {
        const container = document.querySelector(".container");
        const input = document.querySelector(".input");
        if (!word.empty && word === input.value) {
            container.classList.add("wiggle");
        } else {
            container.classList.remove("wiggle");
        }
    }, [word]);

    useEffect(() => {
        if(hintIndex < 0 && showOverlayEndGame !== true){
            setOverlayEndGame(true);
            setHintIndex(0);
        }
    })

    useEffect(() => {
        if(hintIndex > 40  && showOverlayNextLevel !== true && activatedCefrLevels.indexOf(true) !=5){
            setShowOverlayNextLevel(true);
        }
    })

    const handleWordTypeChange = (type) => {
        const newActivatedWordTypes = wordTypes.map((_, index) => index === wordTypes.indexOf(type));
        setActivatedWordTypes(newActivatedWordTypes);
        setWordType(type);
    };

    const handleCefrLevelIncrease = () => {
        const indexOldCurrentCefrLevels = cefrLevels.indexOf(cefrLevel)
        const newActivatedCefrLevels = cefrLevels.map((_, index) => index === indexOldCurrentCefrLevels+1);
        setActivatedCefrLevels(newActivatedCefrLevels);
        setCefrLevel(cefrLevels[indexOldCurrentCefrLevels+1]);
        setHintIndex(20);
        setShowOverlayNextLevel(false);
    };
    const handleClosingPopUp = () => {
        setShowOverlayNextLevel(false);
    };


    const handleCefrLevelChange = (level) => {
        const newActivatedCefrLevels = cefrLevels.map((_, index) => index === cefrLevels.indexOf(level));
        setActivatedCefrLevels(newActivatedCefrLevels);
        setCefrLevel(level);
    };

    const handleWordChange = (event) => {
        console.log(word);
        setUserInput(event.target.value.slice(0, word.length));
        setDisplayedWord(event.target.value.slice(0, word.length))
        if (event.target.value.slice(0, word.length) === word) {
            setGuessedCorrectly(true);
        }
        else {
            setGuessedCorrectly(false);
        }
    };


    const handleAddDefinition = () => {
        setHintIndex(hintIndex - 1);
        setCountRequest(0);
        if (definitions.length ===0){return;}
        let newDefinition = definitions.pop();
        if (newDefinition !== null && newDefinition !== "no definitions found in corpora"){
            console.log(newDefinition[1])
            setPublicDefinitions([...publicDefinitions, `${newDefinition[0]}`]);
        }
    };
    const handleAddExample = () => {
        setHintIndex(hintIndex - 1);
        setCountRequest(0);
        if (examples.length ===0){return;}
        let newExample = examples.pop();
        if (newExample !== null && newExample !== "no example found in corpora"){
            setPublicExamples([...publicExamples, `${newExample[0]}`]);
        }
    };



    function ranking(sentence) {
        const tag_importance = {
            'NN': 5, // Noun, singular or mass
            'NNS': 5, // Noun, plural
            'NNP': 7, // Proper noun, singular
            'NNPS': 7, // Proper noun, plural
            'VB': 3, // Verb, base form
            'VBD': 3, // Verb, past tense
            'VBG': 3, // Verb, gerund or present participle
            'VBN': 3, // Verb, past participle
            'VBP': 3, // Verb, non-3rd person singular present
            'VBZ': 3, // Verb, 3rd person singular present
            'JJ': 2, // Adjective
            'JJR': 2, // Adjective, comparative
            'JJS': 2, // Adjective, superlative
            'RB': 1, // Adverb
            'RBR': 1, // Adverb, comparative
            'RBS': 1, // Adverb, superlative
            'IN': 1, // Preposition or subordinating conjunction
            'CC': 1, // Coordinating conjunction
            'PRP': 1, // Personal pronoun
            'PRP$': 1, // Possessive pronoun
            'WP': 1, // Wh-pronoun
            'WP$': 1 // Possessive wh-pronoun
        };


        let sentenceValue= 0
        const doc = nlp(sentence);
        doc.tag('penn')
        let json=doc.json();
        for (const meaning of json[0]['terms']) {
           if (meaning['penn'] in tag_importance)
           {
                sentenceValue= sentenceValue + tag_importance[meaning['penn']]
           }
        }
        return sentenceValue;
    }



    const handleRandomWord = () => {
        setCountWordsCorrect(countWordsCorrect+1);
        setGuessedCorrectly(false);
        setDisplayedWord("")
        setUserInput("");
        setLetterShown(0);
        setDefinitions([]);
        setExamples([]);
        setPublicExamples([]);
        setPublicDefinitions([]);
        setHintIndex(hintIndex+ 5);
        setError(null);
        const url = `static/corpus.csv?wordType=${wordType}&cefrLevel=${cefrLevel}`;
        fetch(url)
            .then((response) => response.text())
            .then((data) => {
                const lines = data.split("\n");
                const filteredLines = lines.filter((line) => {
                    const fields = line.split(",");
                    return (
                        activatedWordTypes[wordTypes.indexOf(fields[1])] &&
                        activatedCefrLevels[cefrLevels.indexOf(fields[2])]
                    );
                });
                if (filteredLines.length > 0) {
                    const randomIndex = Math.floor(Math.random() * filteredLines.length);
                    const fields = filteredLines[randomIndex].split(",");
                    const str = fields[0].trim().replace(/"(.*)"$/, "$1");
                    setWord(str);
                    //const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${str}`;
                    const options = {
                    	method: 'GET',
                    	headers: {
                    		'X-RapidAPI-Key': '382102422cmshf0f6394b2011b79p18585bjsn297072bb9584',
                    		'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
                    	}
                    };
                    const url= 'https://wordsapiv1.p.rapidapi.com/words/'+str;
                    fetch(url, options)
                        .then((response) => response.json())
                        .then((json_data) => {

                            const def = [];
                            const exa =[];

                            for (const meaning of json_data["results"]) {
                                if (meaning["partOfSpeech"] === wordType) {

                                    let definitionToAdd = meaning["definition"];
                                    def.push([definitionToAdd,ranking(definitionToAdd)]);
                                    if (meaning.hasOwnProperty('examples'))
                                    {
                                        for (const example of meaning["examples"]) {
                                            let exampleToAdd= example;
                                            exampleToAdd = exampleToAdd.replace(new RegExp(`[^a-zA-Z0-9 ]`, "g"), "")
                                            exampleToAdd = exampleToAdd.replace(str, "*".repeat(str.length));

                                            exa.push([exampleToAdd,ranking(exampleToAdd)]);
                                                //todo: the rating von jedem example oder defintion
                                        }
                                    }
                                }
                            }
                            if (def.length <= 3 || exa.length <= 3){
                                handleRandomWord()
                            }
                            def.sort(function(a, b) {
                              return a[1] - b[1];
                            });

                            setDefinitions(def);

                            exa.sort(function(a, b) {
                              return a[1] - b[1];
                            });
                            setExamples(exa);
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    setWord("");
                    setError("No word with this parameter available")
                }
            });
    };




    const handleRevealNextLetter = () => {
        const input = document.querySelector(".input");
        const letters = word.split("");
        let newDisplayedWord = "";
        if (letters.length > letterShown) {
            for (let i = 0; i < letterShown + 1; i++) {
                newDisplayedWord += letters[i];
            }
            setLetterShown(letterShown + 1);
        } else {
            setLetterShown(0);
        }
        setDisplayedWord(newDisplayedWord); // Update the displayedWord
        setUserInput(input.value);
        setHintIndex(hintIndex - 2);
    };



    return (
    <div className="container">
        <h1 className="header-title">Guess my Word</h1>
        <h2 className="points">score: {hintIndex} | words: {countWordsCorrect}</h2>
        <Popup
            open={showOverlayEndGame}
            onClose={() => {
                setOverlayEndGame(false);
                window.location.reload(true);
            }}
            modal
            closeOnDocumentClick
        >
            <div className="overlay">
                <p>Game Over! You got {countWordsCorrect} words right</p>
                <button
                    className={"btn"}
                    onClick={() => setOverlayEndGame(false)}>Restart Game</button>
            </div>
        </Popup>
        <Popup
            open={showOverlayNextLevel}
            onClose={() => {
                setShowOverlayNextLevel(false);
            }}
            modal
            closeOnDocumentClick
        >
            <div className="overlay">
                <p>You are winning! You could go to the next level</p>
                <button
                    className={"btn"}
                    onClick={() => handleCefrLevelIncrease()}>Go to the next level</button>
                <button
                    className={"btn"}
                    onClick={() => handleClosingPopUp()}>Stay on the same level</button>
            </div>

        </Popup>
        <div className="word-types">
            {wordTypes.map((type) => (
                <button
                    key={type}
                    onClick={() => handleWordTypeChange(type)}
                    className={`btn ${
                        activatedWordTypes[wordTypes.indexOf(type)] ? "active" : ""
                    }`}
                    style={{
                        backgroundColor: activatedWordTypes[wordTypes.indexOf(type)]
                            ? "#000000"
                            : "#FFFFFF",
                        color: activatedWordTypes[wordTypes.indexOf(type)]
                            ? "#FFFFFF"
                            : "#000000",
                    }}
                >
                    {type}
                </button>
            ))}
        </div>
        <div className="cefr-levels">
            {cefrLevels.map((level) => (
                <button
                    key={level}
                    onClick={() => handleCefrLevelChange(level)}
                    className={`btn ${
                        activatedCefrLevels[cefrLevels.indexOf(level)] ? "active" : ""
                    }`}
                    style={{
                        backgroundColor: activatedCefrLevels[cefrLevels.indexOf(level)]
                            ? "#000000"
                            : "#FFFFFF",
                        color: activatedCefrLevels[cefrLevels.indexOf(level)]
                            ? "#FFFFFF"
                            : "#000000",
                    }}
                >
                    {level}
                </button>
            ))}
        </div>
        <div className="input-container">
            <div className="input-display">
                { setError &&
                    <p className={error ? "error-text" : ""}>
                        {error}
                    </p>
                }
                {displayedWord.split("").map((letter, index) => (
                    <span
                        key={index}
                        className={`input-letter${guessedCorrectly ? " rainbow" : ""}`}
                        disabled={word === displayedWord && word !== ""}
                    >
    {letter}
</span>

                ))}
                {Array(Math.max(0, word.length - displayedWord.length))
                    .fill("_")
                    .map((underline, index) => (
                        <span key={index + displayedWord.length} className="input-underline">
      {underline}
    </span>
                    ))}
            </div>
            <input
                type="text"
                value={userInput}
                onChange={handleWordChange}
                className="input"
                autoComplete="new-password"
                //disabled={hintIndex > word.length || userInput === word}
            />
            <div className="button-container">
                <div>
                    <button
                        onClick={handleRevealNextLetter}
                        className="hints-button"
                        disabled={userInput === word ||
                            !activatedWordTypes.includes(true) ||
                            !activatedCefrLevels.includes(true) ||
                            word === ""
                    }
                    >
                        Reveal Next Letter
                        <br /> -2
                    </button>
                </div>
                <h2 className="info">correct word +5</h2>
                <div>
                    <button
                        onClick={handleRandomWord}
                        className="hints-button"
                        disabled={(letterShown < word.length && userInput !== word) ||
                            (!activatedWordTypes.includes(true)) ||
                            (!activatedCefrLevels.includes(true)) }
                    >
                        Next Word
                    </button>
                </div>
            </div>
        </div>
        <div className= "hints-container">
            <div className="hints-definition">
                {publicDefinitions.map((definition) => (
                    <p key={definition}>{definition}</p>
                ))}
                <button
                    onClick={handleAddDefinition}
                    className="hints-button"
                    disabled={definitions.length<=0 || userInput === word ||
                        !activatedWordTypes.includes(true) ||
                        !activatedCefrLevels.includes(true) ||
                        word === ""}
                >
                    Add definition  <br /> -1
                </button>
                {publicDefinitions.length} of {definitions.length + publicDefinitions.length}  revealed
            </div>
            <div className="hints-example">
                {publicExamples.map((example) => (
                    <p key={example}>{example}</p>
                ))}
                <button
                    onClick={handleAddExample}
                    className="hints-button"
                    disabled={examples.length<=0 || userInput === word ||
                        !activatedWordTypes.includes(true) ||
                        !activatedCefrLevels.includes(true) ||
                        word === ""}
                >
                    Add Example
                     <br /> -1
                </button>

                {publicExamples.length} of {examples.length + publicExamples.length}  revealed
            </div>
        </div>

    </div>
    );
}

export default Index;
