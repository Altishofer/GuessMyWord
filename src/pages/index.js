import React, { useEffect, useState } from "react";
import "./styles.css";

const wordTypes = ["noun", "verb", "adjective", "adverb", "preposition"];
const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

function Index() {
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

    const handleWordTypeChange = (type) => {
        const newActivatedWordTypes = wordTypes.map((_, index) => index === wordTypes.indexOf(type));
        setActivatedWordTypes(newActivatedWordTypes);
        setWordType(type);
    };

    const handleCefrLevelChange = (level) => {
        const newActivatedCefrLevels = cefrLevels.map((_, index) => index === cefrLevels.indexOf(level));
        setActivatedCefrLevels(newActivatedCefrLevels);
        setCefrLevel(level);
    };

    const handleWordChange = (event) => {

        setUserInput(event.target.value.slice(0, word.length)); // Limit the input characters to the length of the word
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
            setPublicDefinitions([...publicDefinitions, `${newDefinition}`]);
        }
    };
    const handleAddExample = () => {
        setHintIndex(hintIndex - 1);
        setCountRequest(0);
        if (examples.length ===0){return;}
        let newExample = examples.pop();
        if (newExample !== null && newExample !== "no example found in corpora"){
            setPublicExamples([...publicExamples, `${newExample}`]);
        }
    };


    const handleRandomWord = () => {
        setGuessedCorrectly(false);
        setDisplayedWord("")
        setUserInput("");

        setHintIndex(hintIndex+ 5);

        setDefinitions([]);
        setExamples([]);
        setPublicExamples([]);
        setPublicDefinitions([]);
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

                                    console.log(meaning["definition"])
                                    let definitionToAdd = meaning["definition"];
                                    def.push(definitionToAdd);
                                    if (meaning.hasOwnProperty('examples'))
                                    {
                                        for (const example of meaning["examples"]) {
                                            console.log(meaning["examples"])

                                            let exampleToAdd= example;
                                            exampleToAdd = exampleToAdd.replace(new RegExp(`[^a-zA-Z0-9 ]`, "g"), "")
                                            exampleToAdd = exampleToAdd.replace(str, "*".repeat(str.length));
                                            exa.push(exampleToAdd);
                                                //todo: the reating von jedem example oder defintion
                                        }
                                    }
                                }
                            }
                            setDefinitions(def);
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
        <h2> points {hintIndex} </h2>
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
              <p className="error-text">
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
                        disabled={hintIndex >= 30 || userInput === word}
                    >
                        Reveal Next Letter
                        <br /> -2 points
                    </button>


                </div>
                <div>
                    <button
                        onClick={handleRandomWord}
                        className="btn"

                        disabled={letterShown < word.length && userInput !== word  }
                    >
                        Random Word
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
                    //disabled={hints.length<=0}
                >
                    Add definition  <br/>
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
                    //disabled={hints.length<=0}
                >
                    Add Example  <br/>
                </button>

                {publicExamples.length} of {examples.length + publicExamples.length}  revealed
            </div>
        </div>

    </div>
    );
}

export default Index;
