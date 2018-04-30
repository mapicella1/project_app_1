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
            callBackend('../api/addCard/' + this.state.deckId + '/' + this.state.card.card_id)
                .then((data) => {
                    var card = this.state.card.card_name;
                    var deck = this.state.showing;

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

    static defaultProps = {
        regex: /[{](\w+\s*)+[}]/g,
        regex2: /,(?=[\w])/g,
        regex3: /"/g,
    }

    getOtherCard = (name, type) => {
        callBackend('../api/getCardName/?card_name=' + name)
            .then(data => {
                if (type == 'trans') {
                    this.setState({ trans: data[0].card_id })
                }
                else {
                    this.setState({ linked: data[0].card_id })
                }
            });
    }

    setDeck = (name, id) => {
        this.setState({
            showing: name,
            deckId: id,
        });
    }

    getList(key, card) {
        let array = []
        let rarity = this.state.card.rarity;
        if (key == 'mana_cost') {
            card.match(this.props.regex).map((match) => {
                array.push(<img key={shortid.generate()} className="cardListImage"
                    src={`${BucketLink}/Symbol/${match.slice(1, -1)}.jpg`} alt={match} />)
            })
        }
        else if (key == 'card_text') {
            card.split('|').map((el) => {
                array.push(<span key={shortid.generate()} >{getReg(el)}<br/></span>)
            })
        }
        else if (key == 'all_sets') {
            let sets = card.slice(0, -1).split(this.props.regex2)
            sets.map((set, index) => {
                set = set.replace(this.props.regex3, '')
                array.push(<img key={shortid.generate()} className="cardListImage"
                    src={`${BuckLink}/Set/${set.replace(':', '')}.jpg`} alt={set} />)
            })
        }
        else if (key == 'flavor_text') {
            array.push(<i key={shortid.generate()} >{card}</i>)
        }
        else if (key == 'p') {
            array.push(<span key={shortid.generate()} >{card.trim() + "/" + this.state.card.t.trim()}</span>)
        }
        else if (key == 'expansion') {
            if (this.state.card.rarity == 'Basic Land') {
                rarity = 'Land';
            }
            let symbol = card.replace(':', '') + " (" + rarity + ")";
            array.push(<img key={shortid.generate()} className="cardListImage" src={`${BucketLink}/Set/${symbol}.jpg`} alt={symbol} />)
            array.push(<span key={shortid.generate()} >&nbsp;{card}</span>)
        }
        else if (key == 'trans_card') {
            array.push(<a href={"/card/" + this.state.trans}>{card}</a>)
        }
        else if (key == 'linked_card') {
            array.push(<a href={"/card/" + this.state.linked}>{card}</a>)
        }
        else {
            return <li>{card}</li>
        }

        return (
            <li>{array}</li>
        )
    }

    getLegality(card) {
        let legal = [];
        Object.keys(card).map((key) => {
            if (card[key] == 'Legal' || card[key] == 'Banned' || card[key] == 'Restricted') {
                legal.push(
                    <tr key={shortid.generate()} >
                        <td style={{ textTransform: 'capitalize' }}>{key}</td>
                        <td>{card[key]}</td>
                    </tr>
                )
            }
        })
        return legal;
    }

    render() {
        console.log(this.state.card.card_name)
        return (
            <div>
                {(this.state.card.card_name) && ( 
                    <div className="cardGrid">
                    <div className="imageButtons">
                            <img src={`${BucketLink}/Card/${getCardName(this.state.card.card_name)}.jpg`}
                                alt={this.state.card.card_name} />
                        {(this.state.isUser) && (
                            <div id="buttons">
                                <button id="addButton" className="btn btn-primary" onClick={() => { this.addCard() }}>
                                    Add To Collection
                                </button>
                                <a className="nav-link dropdown-toggle btn btn-dark" href="javascript:void(0)"
                                    id="dropDownShow" data-toggle="dropdown"
                                    aria-haspopup="true" aria-expanded="false">
                                    {this.state.showing}
                                </a>
                                <div className="dropdown-menu" id="deckDrop" aria-labelledby="navbarDropdownMenuLink">
                                    <div id="deckMenuItems">
                                        <a className="dropdown-item" href="javascript:void(0)" onClick={() => { this.setDeck('Shoe Box', 0) }}> Shoe Box</a>
                                        {this.state.deckData.map((deck) => (
                                            <a key={shortid.generate()}  className="dropdown-item" onClick={() => { this.setDeck(deck.deck_name, deck.deck_id) }} href="javascript:void(0)" >{deck.deck_name}</a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        {Object.keys(this.state.card).map((key) => (
                            (this.state.card[key] != null && key != 'card_id'
                                && this.state.card[key] != 'Legal'
                                && this.state.card[key] != 'Banned'
                                && this.state.card[key] != 'Restricted'
                                && key != 't') && (
                                <div key={shortid.generate()} className="cardRow">
                                    {(key == 'p')
                                    ? (<div className="card_header"><strong>P/T: </strong></div>)
                                    : (<div className="card_header"><strong>{key.split('_').join(' ') + ": "}</strong></div>)}
                                    <div className="cardDets">
                                        {this.getList(key, this.state.card[key])}
                                    </div>
                                </div>
                            )))}
                        <table id="legalTable" className="table table-sm">
                            <thead>
                                <tr>
                                    <th scope="col">Format</th>
                                    <th scope="col">Legality</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.getLegality(this.state.card)}
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