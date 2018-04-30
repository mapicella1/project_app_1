// renders main list of cards from search result

import React, { Component } from 'react';
import { BucketLink } from './MetaData';
import { getCardName, getReg } from './Funcs';
import shortid from "shortid";

class CardList extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    static defaultProps = {
        // regex to symbol placeholders - ex. {Green} - in card's rules text
        regex: /[{](\w+\s*)+[}]/g,
    }

    // passes id and name of dragged card to CardTable
    onDragStart = (ev, id, name) => this.props.dragCard([id, name]);

    // match {mana} identifiers in mana cost, add mana symbol image to line, then add converted mana cost
    getManaCost = (card, mana) => {
        card.mana_cost.match(this.props.regex).map((match) => {
            mana.push(<img key={shortid.generate()} className="cardListImage"
                src={`${BucketLink}/Symbol/${match.slice(1, -1)}.jpg`} alt={match} />)
        })
        mana.push(
            <span key={shortid.generate()} style={{ marginLeft: '2%', fontSize: '15px' }}>
                {`(${card.converted_mana_cost.trim()})`}
            </span>
        );

        return mana;
    }

    // populates list with card information of search results
    cardList(card) {
        let cardText = []
        let rarity = card.rarity;
        let type;
        let text;
        let pt;
        let titleRow;
        let mana = [];
        // get mana symbol images if card has mana cost, as well as converted mana cost
        if (card.mana_cost) {
            mana = this.getManaCost(card, mana);
        }
        // add card name link -and mana symbols, if any- as first list item
        cardText.push(
            <li key={shortid.generate()}>
                <h4>
                    <a style={{ color: '#2b2b2b', marginRight: '2%' }} href={`/card/${this.props.card.card_id}`}>
                        {this.props.card.card_name}
                    </a>
                    {mana}
                </h4>
            </li>)
        // create span to display card types and subtypes if any
        if (card.subtypes) {
            type = <span key={shortid.generate()} className="cardType">{card.types}&nbsp;&mdash;&nbsp;{card.subtypes}</span>;
        }
        else {
            type = <span key={shortid.generate()} className="cardType">{card.types}</span>;
        }

        // creates span for card's power and toughness if any, formatted as: (p/t)
        if (card.p && card.t) {
            pt = (
                <span key={shortid.generate()} style={{ marginLeft: '2%' }}>
                    {`(${card.p.trim()}/${card.t.trim()})`}
                </span>
            );
        }

        // change 'Basic Land' rarity to 'Land' in order to match rarity symbol image name
        if (card.rarity == 'Basic Land') {
            rarity = 'Land';
        }

        // correctly format rarity symbol to match image name
        let symbol = `${card.expansion.replace(':', '')} (${rarity})`;
        // create span for set image
        let set = <span key={shortid.generate()} className="setImage"><img className="cardListImage"
            src={`${BucketLink}/Set/${symbol}.jpg`} /></span>

        // add type, p/t, and set spans to second list item
        cardText.push(<li key={shortid.generate()} style={{ position: 'relative' }}>{type}{pt} {set}</li>)

        // if card has rules text, line break at '|' and send to getReg() for correct formatting
        // then add as last line of list
        if (card.card_text) {
            card.card_text.split('|').map((el) => {
                cardText.push(<li key={shortid.generate()}><b>{getReg(el)}</b></li>)
            })
        }
        
        return (
             cardText
        )
    }

    render() {
        return (
            <div className="gridRow">
                <div>
                    <div className="cardImage">
                        <a href={"/card/" + this.props.card.card_id}
                            draggable="true" onDragStart={(e) => this.onDragStart(e, this.props.card.card_id, this.props.card.card_name)}>
                            <img className="searchImage" src={`${BucketLink}/Card/${getCardName(this.props.card.card_name)}.jpg`}
                                alt={this.props.card.card_id} />
                        </a>
                    </div>
                </div>         
                <div>
                    <ul className="cardText">
                        {this.cardList(this.props.card)}
                    </ul>
                    
                </div>
            </div>
        );
    }
}

export default CardList;