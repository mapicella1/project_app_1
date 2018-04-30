// renders hoverable links for each card in deck.html

import React, { Component } from 'react';
import PropTypes from "prop-types";
import shortid from "shortid";
import { getCardName, getCardQuant } from './Funcs';
import { BucketLink } from './MetaData';

class CardTypes extends Component {

    // hide card image on mouseOut
    hideImage = (e, id) => {
        e.preventDefault();
        let img = document.getElementById('card' + id);
        img.className = "deckImage";
        img.hidden = true;
    }

    // show image on link mouseOver
    showImage = (e, id) => {
        e.preventDefault();
        let img = document.getElementById('card' + id);
        img.hidden = false;
        let imgRect = img.getBoundingClientRect();
        // set image bottom position to bottom of window if it goes beyond
        ((imgRect.bottom) >= (window.innerHeight))
            ? (img.className = 'cardShift')
            : (img.className = 'deckImage')
    }

    // send dragCard to Deck
    onDragStart = (ev, id, name) => this.props.dragCard([id, name]);

    render() {
        const { card, deckCards } = this.props

        return (
            <li key={card.card_id} 
                onDragStart={(e) => this.onDragStart(e, card.card_id, card.card_name)}>
                <span onMouseOver={(e) => this.showImage(e, card.card_id)}
                    onMouseOut={(e) => this.hideImage(e, card.card_id)}>
                    <a href={`/card/${card.card_id}`} >
                        {card.card_name}
                    </a>
                    {` x${getCardQuant(card.card_id, this.props.deckCards)}`}
                    <img id={'card' + card.card_id} className="deckImage" hidden
                        src={`${BucketLink}/Card/${getCardName(card.card_name, deckCards)}.jpg`} />
                </span>
                
            </li>
        );
    }
}

export default CardTypes;