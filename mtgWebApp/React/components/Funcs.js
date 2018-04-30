// reused functions

import React from 'react';
import { BucketLink } from './MetaData';
import shortid from 'shortid';

// ajax fetch boilerplate
export const callBackend = (url) => {
    return (fetch(url,
        { 'credentials': 'include' })
        .then(response => {
            return response.json();
        }))
}

// remove unwanted characters from card name for image file matching
export const getCardName = (name) => {
    return name.replace(':', '').replace('?', '');
}

// checks that enchantment or artifact card of another type doesn't appear multiple times
export const multiTypeCheck = (cardType, card) => {
    if (cardType.includes('Artifact')) {
        let check = (card.types.includes('Creature') || card.types.includes('Land'))
            ? (true)
            : (false)
        return check;
    }
    else if (cardType.includes('Enchantment')) {
        let check = (card.types.includes('Creature') || card.types.includes('Artifact'))
            ? (true)
            : (false)
        return check;
    }
    return false;
}

// initial empty type count
const initialTypeCount = {
    Creature: 0,
    Land: 0,
    Enchantment: 0,
    Artifact: 0,
    Sorcery: 0,
    Instant: 0,
    Planeswalker: 0,
}

// regex for matching {mana} identifier within card's rules text
const regex = /[{](\w+\s*)+[}]/g;

// counts all cards that match each type
export const countTypes = (cards, types) => {
    let typeCount = { ...initialTypeCount };

    cards.map((card) => {
        types.map((type) => {
            if (card.types.includes(type) && !multiTypeCheck(type, card)) {
                typeCount[type] += 1;
            }
        })
    });
    return typeCount;
}

// get quantity of each card in displayed deck
export const getCardQuant = (id, deckCards) => {
    let dc = deckCards.find(card => card.card == id);
    return dc.quantity;
}

// match all {mana} identifiers in line of rules text and change to |{mana}|
const getNewText = (match, newText) => {
    match.map((m) => {
        // replaces incorrect mana symbols from Gatherer where {10} or {20} mana symbols 
        // are displayed as {1}0 and {2}0
        if (newText.includes(m + '0')) {
            let newM = new RegExp('\\' + m + '0', 'g');
            newText = newText.replace(newM, '|' + m.slice(0, -1) + '0}|');
        }
        else {
            let newM = new RegExp('\\' + m, 'g');
            newText = newText.replace(newM, '|' + m + '|');
        }
    });
    return newText;
}

// finds all matches to {mana} identifiers and replaces them with symbol image
export const getReg = (text) => {
    let textArray = [];
    let newText = text;
    let match = text.match(regex);

    if (match) {
        newText = getNewText(match, newText);
        // match mana symbol in line of rule's text, split into array at '|'
        match = newText.match(regex);
        textArray = newText.split('|');
        for (let i = 0; i < textArray.length; i++) {
            match.map((m) => {
                // replace all {mana} with image of mana symbol
                if (textArray[i] == m) {
                    let arrayString = `${BucketLink}/Symbol/${m.slice(1, -1)}.jpg`;
                    textArray[i] = <img key={shortid.generate()} style={{ height: '16px', width: 'auto' }} src={arrayString} />
                }
            })
        }
        return textArray;
    }
    else {
        return newText;
    }
}