import React, {useEffect, useState} from 'react';
import './styles.css';

const wordTypes = ['Noun', 'Verb', 'Adjective'];

function Index() {
    const [wordType, setWordType] = useState(wordTypes[0]);
    const [word, setWord] = useState('');
    const [hints, setHints] = useState(['Hint 1']);

    // use useEffect to add or remove the .wiggle class
    useEffect(() => {
        // get the container element
        var container = document.querySelector(".container");
        // check if the word state is equal to "dog"
        if (word === "dog") {
            // add the .wiggle class to the container element
            container.classList.add("wiggle");
        } else {
            // remove the .wiggle class from the container element
            container.classList.remove("wiggle");
        }
    }, [word]); // run this effect whenever the word state changes

    const handleWordTypeChange = (type) => {
        setWordType(type);
    };

    const handleWordChange = (event) => {
        setWord(event.target.value);
    };

    const handleAddHint = () => {
        setHints([...hints, `Hint ${hints.length + 1}`]);
    };

    let input = document.querySelector(".input");
    let button = document.querySelector(".btn");
    let str = "dog";
    let letters = str.split("");

    const handleRevealNextLetter = () => {
        if (letters.length > 0) {
            const letter = letters.shift();
            input.value += letter;
        } else {
            button.disabled = true;
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
                <input type="text" value={word} onChange={handleWordChange} className="input" />
            </div>
            <div>
                <button onClick={handleRevealNextLetter} className="btn">Reveal Next Letter</button>
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


