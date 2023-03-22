import React, { useEffect, useState } from "react";
import "./styles.css";

const wordTypes = ["noun", "verb", "adjective", "adverb", "preposition"];
const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

function Index() {
    const [hintIndex, setHintIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [wordType, setWordType] = useState(wordTypes[0]);
    const [cefrLevel, setCefrLevel] = useState(cefrLevels[0]);
    const [word, setWord] = useState("");
    const [hints, setHints] = useState(["Hint 1"]);
    const [activatedWordTypes, setActivatedWordTypes] = useState(
        wordTypes.map(() => false)
    );
    const [activatedCefrLevels, setActivatedCefrLevels] = useState(
        cefrLevels.map(() => false)
    );

    activatedWordTypes[0] = true;
    activatedCefrLevels[1] = true;

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
        const newActivatedWordTypes = [...activatedWordTypes];
        newActivatedWordTypes[wordTypes.indexOf(type)] =
            !activatedWordTypes[wordTypes.indexOf(type)];
        setActivatedWordTypes(newActivatedWordTypes);
        setWordType(type);
    };

    const handleCefrLevelChange = (level) => {
        const newActivatedCefrLevels = [...activatedCefrLevels];
        newActivatedCefrLevels[cefrLevels.indexOf(level)] =
            !activatedCefrLevels[cefrLevels.indexOf(level)];
        setActivatedCefrLevels(newActivatedCefrLevels);
        setCefrLevel(level);
    };

    const handleWordChange = () => {
        const input = document.querySelector(".input");
        setUserInput(input.value);
        console.log(input.value, word);
    };

    const handleAddHint = () => {
        setHints([...hints, `Hint ${hints.length + 1}`]);
    };

    const handleRandomWord = () => {
        setUserInput("");
        setHintIndex(0);
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
                    setWord(fields[0].trim().replace('"', ""));
                } else {
                    setWord("No words found");
                }
            });
    };

    const handleRevealNextLetter = () => {
        const input = document.querySelector(".input");
        const letters = word.split("");
        if (letters.length > hintIndex){
            input.value = "";
            setUserInput("");
            for (let i=0; i<hintIndex+1; i++){
                input.value += letters[i];
            }
            setHintIndex(hintIndex +1);
        } else {
            setHintIndex(0);
        }
        setUserInput(input.value);
    };
    return (
        <div className="container">
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
                <input
                    type="text"
                    value={userInput}
                    onChange={handleWordChange}
                    className="input"
                    autoComplete="new-password"
                    disabled={hintIndex > word.length || userInput === word}
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
                        disabled={hintIndex < word.length && userInput !== word}
                    >
                        Random Word
                    </button>
                </div>
            </div>

            <div className="hints-container">
                {hints.map((hint) => (
                    <p key={hint}>{hint}</p>
                ))}
                <button onClick={handleAddHint} className="btn">
                    Add Hint
                </button>
            </div>
        </div>
    );
}

export default Index;
