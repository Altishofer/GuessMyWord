import React, { useEffect, useState } from "react";
import "./styles.css";

const wordTypes = ["noun", "verb", "adjective", "adverb", "preposition"];
const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

function Index() {
    const [guessedCorrectly, setGuessedCorrectly] = useState(false);
    const [displayedWord, setDisplayedWord] = useState("");
    const [definitions, setDefinitions] = useState([]);
    const [hintIndex, setHintIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [wordType, setWordType] = useState(wordTypes[0]);
    const [cefrLevel, setCefrLevel] = useState(cefrLevels[0]);
    const [word, setWord] = useState("");
    const [hints, setHints] = useState([]);
    const [activatedWordTypes, setActivatedWordTypes] = useState(
        wordTypes.map(() => false)
    );
    const [activatedCefrLevels, setActivatedCefrLevels] = useState(
        cefrLevels.map(() => false)
    );


    useEffect(() => {
        const container = document.querySelector(".container");
        const input = document.querySelector(".input");
        console.log(word, input.value);
        if (!word.empty && word === input.value) {
            setHintIndex(word.length);
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

        console.log(word);
        setUserInput(event.target.value.slice(0, word.length)); // Limit the input characters to the length of the word
        setDisplayedWord(event.target.value.slice(0, word.length))
        if (event.target.value.slice(0, word.length) === word) {
            setGuessedCorrectly(true);
        }
        else {
            setGuessedCorrectly(false);
        }
    };


    const handleAddHint = () => {
        if (definitions.length ===0){return;}
        let newHint = definitions.pop();
        if (newHint !== null && newHint !== "no hints found in corpora"){
            setHints([...hints, `${newHint}`]);
        }
    };

    const handleRandomWord = () => {
        setGuessedCorrectly(false);
        setDisplayedWord("")
        setUserInput("");
        setHintIndex(0);
        setHints([]);
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
                    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${str}`;
                    fetch(url)
                        .then((response) => response.json())
                        .then((json_data) => {
                            const def = [];
                            for (const meaning of json_data[0]["meanings"]) {
                                if (meaning["partOfSpeech"] === "noun") { //todo: sort out selected pos
                                    for (const defin of meaning["definitions"]) {
                                        let hintToAdd = defin["definition"];
                                        hintToAdd = hintToAdd.replace(new RegExp(`[^a-zA-Z0-9 ]`, "g"), "")
                                        hintToAdd = hintToAdd.replace(word, "#".repeat(word.length));
                                        console.log(hintToAdd);
                                        def.push(hintToAdd);
                                    }
                                }
                                console.log(def)
                                if (def.length<2){
                                    handleRandomWord();
                                }
                                setDefinitions(def);
                        }

                        })
                        .catch((error) => {
                            console.error(error);
                            handleRandomWord();
                        });
                } else {
                    setWord("No Cefr & POS selected");
                }
            });
    };
    const handleRevealNextLetter = () => {
        const input = document.querySelector(".input");
        const letters = word.split("");
        let newDisplayedWord = "";
        if (letters.length > hintIndex) {
            for (let i = 0; i < hintIndex + 1; i++) {
                newDisplayedWord += letters[i];
            }
            setHintIndex(hintIndex + 1);
        } else {
            setHintIndex(0);
        }
        setDisplayedWord(newDisplayedWord); // Update the displayedWord
        setUserInput(input.value);
    };
    return (
    <div className="container">
        <h1 className="header-title">Guess my Word</h1>
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
                <button
                    onClick={handleRevealNextLetter}
                    className="btn"
                    disabled={hintIndex >= word.length || userInput === word}
                >
                    Reveal Next Letter
                </button>
                <button
                    onClick={handleRandomWord}
                    className="btn"

                    disabled={hintIndex < word.length && userInput !== word && hints.length !== 0 }
                >
                    Random Word
                </button>
            </div>
        </div>

        <div className="hints-container">
            {hints.map((hint) => (
                <p key={hint}>{hint}</p>
            ))}
            <button
                onClick={handleAddHint}
                className="btn"
                //disabled={hints.length<=0}
            >
                Add Hint
            </button>
        </div>
    </div>
    );
}

export default Index;
