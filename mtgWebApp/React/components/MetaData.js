// import json files for autocomplete fields out of option elements, reuseable card bucket link

import React from 'react';
import card_names from '../JSON/card_names.json';
import types from '../JSON/types.json';
import subtypes from '../JSON/subtypes.json';
import expansions from '../JSON/expansions.json';
import shortid from "shortid";

export const BucketLink = 'https://storage.googleapis.com/mapice_app_1/images';

export const colors = ['Green', 'Red', 'Blue', 'White', 'Black', 'Colorless']
export const rarity = ['Common', 'Uncommon', 'Rare', 'Mythic Rare', 'Special', 'Land', 'Bonus']

export const expansionOptions = expansions.map(card => {
    return <option key={shortid.generate()} value={card.expansion}>{card.expansion}</option>
});

export const nameOptions = card_names.map(card => {
    return <option key={shortid.generate()} value={card.card_name}>{card.card_name}</option>
});

export const typeOptions = types.map(card => {
    return <option key={shortid.generate()} value={card.types}>{card.types}</option>
});

export const subtypeOptions = subtypes.map(card => {
    return <option key={shortid.generate()} value={card.subtypes}>{card.subtypes}</option>
});

export const colorOptions = colors.map(color => {
    return <option key={shortid.generate()} value={color}>{color}</option>
});

export const rarityOptions = rarity.map(rare => {
    return <option key={shortid.generate()} value={rare}>{rare}</option>
});
