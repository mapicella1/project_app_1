// builds card image/link with buttons to remove from deck and input to increase quantity

import React, { Component } from 'react';
import shortid from "shortid";
import { callBackend, getCardName, getCardQuant } from './Funcs';
import { BucketLink } from './MetaData';

class CardView extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    // sends entered quantity through ajax. if quantity is 0, card is removed
    setQuant = () => {
        const { reloadQuant, deckId, card, deckName, loadCards, setGraph } = this.props;
        if (this.quant.value) {
            callBackend(`../api/updateQuant/${deckId}/${card.card_id}/${this.quant.value}`)
                .then((data) => {
                if (data) {
                    loadCards(deckName, deckId)
                    reloadQuant(true, card.card_name, 0);
                }
                else {
                    // card wasn't removed, value cleared and placeholder set to new quantity
                    reloadQuant(false, card.card_name, this.quant.value);
                    this.quant.placeholder = this.quant.value;
                    this.quant.value = '';
                }
            });
        }
    }

    // remove card from deck in sidebar, reload sidebar and graph
    removeCard = (e, card) => {
        e.preventDefault();
        callBackend(`../api/removeCard/${this.props.deckId}/${card}`)
            .then((data) => {
                this.props.loadCards(this.props.deckName, this.props.deckId);
                this.props.reloadQuant(true, this.props.card.card_name, '');
            });
    }

    // checks whether the currently loaded collection is a deck
    isDeck = () => (this.props.deckId != 0);

    render() {
        const { card, width, btnDivClass, deckId, deckCards } = this.props

        return (
            <div className="scrollImages" id={card.card_id}>
                <a href={`/card/${card.card_id}`}>
                    <img className="innerImage"
                        src={`${BucketLink}/Card/${getCardName(card.card_name)}.jpg`}
                        alt={card.card_name} />
                </a>
                <div className="middle">
                    <div className={btnDivClass}>
                        <a className="btn btn-danger btn-sm" href="javascript:void(0)">
                            <span className="octicon octicon-x"
                                onClick={(e) => this.removeCard(e, card.card_id, card.card_name)}>
                            </span>
                        </a>
                    </div>
                    {(this.isDeck()) && // adds number input and button if deck
                        (
                            <div className="textbox" >
                                <div className="input-group mb-3">
                                    <input className="form-control" min="0" ref={(num) => { this.quant = num }} type="number"
                                        id="quantInput" placeholder={getCardQuant(card.card_id, deckCards)} />
                                    <div className="input-group-append">
                                        <button className="btn btn-secondary" onClick={this.setQuant.bind(this)} type="button">Save</button>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        );
    }
}

export default CardView;