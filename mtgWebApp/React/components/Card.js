// renders card information on card.html

import React, { Component } from 'react';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import shortid from "shortid";
import SnackBar from "./SnackBar";
import { callBackend, getCardName, getReg } from './Funcs';
import { BucketLink } from './MetaData';

class Card extends Component {
    constructor(props) {
        super(props)
        this.state = {
            id: null,
            card: [],
            cardstuff: {},
            deckData: [],
            trans: 0,
            linked: 0,
            loaded: false,
            deckId: 0,
            showing: 'Choose Your Deck',
            isUser: false,
        }
    }

    // ajax call to get card data
    getCard = () => {
        callBackend(`../api/getCard/${this.state.id}`)
            .then(data => {
                this.setState({
                    card: data['card'][0],
                    isUser: data['isUser'],
                    loaded: true
                })
                // if card has transformation or link, get those card ids
                if (data['card'][0].trans_card) {
                    this.getOtherCard(data['card'][0].trans_card, 'trans')
                }
                if (data['card'][0].linked_card) {
                    this.getOtherCard(data['card'][0].linked_card, 'linked')
                }
            });
    }

    // gets deck id from dataset on django template, sets before initial render
    componentWillMount() {
        let div = document.getElementById('card');
        let id = div.dataset.id;
        let user = div.dataset.user;
        this.setState({
            id: id,
            isUser: user,
        })
    }

    // get card and deck information on initial mount
    componentDidMount() {
        this.getCard();
        this.getDecks();
    }

    // if user is logged in, ajax call for their decks
    getDecks = () => {
        if (this.state.isUser) {
            callBackend('../api/userDecks/')
                .then(data => this.setState({ deckData: data, loaded: true }));
        }
    }

    // adds card to users deck, if deck is selected
    addCard = () => {
        if (this.state.showing == 'Choose Your Deck') {
            this.snack.setSnack("showNoDeck", "Please choose a deck");
        }
        else {
            callBackend(`../api/addCard/${this.state.deckId}/${this.state.card.card_id}`)
                .then((data) => {
                    let card = this.state.card.card_name;
                    let deck = this.state.showing;

                    // notify that card has been added if not already in selected deck
                    if (data == true) {
                        this.snack.setSnack("showAdd", `${card} added to ${deck}`);
                    }
                    else {
                        this.snack.setSnack("showIn", `${card} is already in ${deck}`);
                }
            });
        }
    }

    // regex for findings characters that need removal for file match
    static defaultProps = {
        manaReg: /[{](\w+\s*)+[}]/g,
        allSetReg: /,(?=[\w])/g,
        quoteReg: /"/g,
    }

    // ajax fetch for transformation/linked card id
    getOtherCard = (name, type) => {
        callBackend(`../api/getCardName/?card_name=${name}`)
            .then(data => {
                (type == 'trans') 
                    ? (this.setState({ trans: data[0].card_id }))
                    : (this.setState({ linked: data[0].card_id }))
            });
    }

    // sets user deck to add card to
    setDeck = (name, id) => {
        this.setState({
            showing: name,
            deckId: id,
        });
    }

    // check displayed attributes of card and create necessary dom elements
    getList(key, value) {
        let array = []
        let { card, trans, linked } = this.state;
        let { manaReg, allSetReg, quoteReg } = this.props;
        let rarity = card.rarity;
        if (key == 'mana_cost') {
            // match {mana} identifier in mana cost ans replace with image symbol
            array = value.match(manaReg).map((match) => {
                return (<img key={shortid.generate()} className="cardListImage"
                    src={`${BucketLink}/Symbol/${match.slice(1, -1)}.jpg`} alt={match} />);
            })
        }
        else if (key == 'card_text') {
            // split rules text at '|' and send to getReg for formatting
            array = value.split('|').map((el) => {
                return <span key={shortid.generate()} >{getReg(el)}<br /></span>;
            })
        }
        else if (key == 'all_sets') {
            // split sets into array, remove necessary characters, replace with set image
            let sets = value.slice(0, -1).split(allSetReg)
            array = sets.map((set, index) => {
                set = set.replace(quoteReg, '');
                return (<img key={shortid.generate()} className="cardListImage"
                    src={`${BucketLink}/Set/${set.replace(':', '')}.jpg`} alt={set} />);
            })
        }
        else if (key == 'flavor_text') {
            array.push(<i key={shortid.generate()} >{value}</i>)
        }
        else if (key == 'p') {
            array.push(<span key={shortid.generate()} >{`${value.trim()}/${card.t.trim()}`}</span>)
        }
        else if (key == 'expansion') {
            // replace 'Basic Land' rarity with 'Land' for correct image name match
            if (rarity == 'Basic Land') {
                rarity = 'Land';
            }
            let symbol = `${value.replace(':', '')} (${rarity})`;
            array.push(<img key={shortid.generate()} className="cardListImage"
                src={`${BucketLink}/Set/${symbol}.jpg`} alt={symbol} />);
            array.push(<span key={shortid.generate()} >&nbsp;{value}</span>);
        }
        else if (key == 'trans_card') {
            array.push(<a href={`/card/${trans}`}>{value}</a>);
        }
        else if (key == 'linked_card') {
            array.push(<a href={`/card/${linked}`}>{value}</a>);
        }
        else {
            return <li>{value}</li>
        }

        return (
            <li>{array}</li>
        )
    }

    // build table to display formats that card is banned/legal in
    getLegality(card) {
        let legal = Object.keys(card).map((key) => {
            if (card[key] == 'Legal' || card[key] == 'Banned' || card[key] == 'Restricted') {
                return (
                        <tr key={shortid.generate()} >
                            <td style={{ textTransform: 'capitalize' }}>{key}</td>
                            <td>{card[key]}</td>
                        </tr>
                );
            }
        })
        return legal;
    }

    // check current card attribute for values not to be displayed in main list
    checkAtt = (card, key) => {
        let notLegal = (key != 'card_id'
                && card[key] != 'Legal'
                && card[key] != 'Banned'
                && card[key] != 'Restricted'
                && key != 't')
            ? (true)
            : (false)
        return notLegal;
    }

    render() {
        let { card, isUser, showing, deckData } = this.state;
        return (
            <div>
                {(card.card_name) && ( 
                    <div className="cardGrid">
                    <div className="imageButtons">
                            <img src={`${BucketLink}/Card/${getCardName(card.card_name)}.jpg`}
                                alt={card.card_name} />
                        {(isUser) && ( // render buttons if user is logged in
                            <div id="buttons">
                                <button id="addButton" className="btn btn-primary" onClick={() => { this.addCard() }}>
                                    Add To Collection
                                </button>
                                <a className="nav-link dropdown-toggle btn btn-dark" href="javascript:void(0)"
                                    id="dropDownShow" data-toggle="dropdown"
                                    aria-haspopup="true" aria-expanded="false">
                                    {showing}
                                </a>
                                <div className="dropdown-menu" id="deckDrop" aria-labelledby="navbarDropdownMenuLink">
                                    <div id="deckMenuItems">
                                        <a className="dropdown-item" href="javascript:void(0)" onClick={() => { this.setDeck('Shoe Box', 0) }}> Shoe Box</a>
                                        {deckData.map((deck) => ( // populate dropdown with user's decks
                                                <a key={shortid.generate()} className="dropdown-item"
                                                    onClick={() => { this.setDeck(deck.deck_name, deck.deck_id) }}
                                                    href="javascript:void(0)" >
                                                    {deck.deck_name}
                                                </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        {// map card attributes, skip attributes that are null or match in checkAtt
                        Object.keys(card).map((key) => (
                            (card[key] != null && this.checkAtt(card, key))) && (
                                <div key={shortid.generate()} className="cardRow">
                                    {(key == 'p') // format power and toughness header for proper display
                                    ? (<div className="card_header"><strong>P/T: </strong></div>)
                                    : (<div className="card_header"><strong>{key.split('_').join(' ') + ": "}</strong></div>)}
                                    <div className="cardDets">
                                        {this.getList(key, card[key])}
                                    </div>
                                </div>
                            ))}
                        <table id="legalTable" className="table table-sm">
                            <thead>
                                <tr>
                                    <th scope="col">Format</th>
                                    <th scope="col">Legality</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.getLegality(card)}
                            </tbody>
                        </table>
                    </div>
                </div>)}
                <SnackBar ref={(value) => { this.snack = (value) }} />
            </div>
        );
    }
}

const wrapper = document.getElementById('card');
wrapper ? ReactDOM.render(<Card />, wrapper) : null;