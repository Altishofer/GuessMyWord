import React, {useEffect, useState} from 'react';
import './styles.css';

const wordTypes = ['Noun', 'Verb', 'Adjective'];

function Index() {
    const [wordType, setWordType] = useState(wordTypes[0]);
    const [word, setWord] = useState('');
    const [hints, setHints] = useState(['Hint 1']);

    useEffect(() => {
        var container = document.querySelector(".container");
        if (word === str) {
            container.classList.add("wiggle");
        } else {
            container.classList.remove("wiggle");
        }
    }, [word]);

    const handleWordTypeChange = (type) => {
        setWordType(type);
    };

    const handleWordChange = (event) => {
        setWord(event.target.value);
    };

    const handleAddHint = () => {
        setHints([...hints, `Hint ${hints.length + 1}`]);
    };

    let str = "dog";
    let letters = str.split("");

    const handleRevealNextLetter = () => {
        const input = document.querySelector(".input");
        if (!letters.isNull && letters.length > 0) {
            const letter = letters.shift();
            input.value += letter;
        } else {
            input.value = "";
            letters = str.split("");
        }
    };

    return (
        <div className="container">
            <div className="word-types">
                {wordTypes.map((type) => (
                    <button key={type} onClick={() => handleWordTypeChange(type)} className="btn">
                        {type}
                    </button>
                ))}
            </div>
            <div className="input-container">
                <input type="text" value={word} onChange={handleWordChange} className="input" autocomplete="new-password" />
            </div>
            <div>
                <button onClick={handleRevealNextLetter} className="btn" disabled={letters.length===0}>Reveal Next Letter</button>
            </div>
            <div className="hints-container">
                {hints.map((hint) => (
                    <p key={hint}>{hint}</p>
                ))}
                <button onClick={handleAddHint} className="btn">Add Hint</button>
            </div>
        </div>
    );
}

export default Index;


