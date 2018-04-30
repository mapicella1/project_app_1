// renders list of users decks and pie chart of their mana symbol distribution
// wrapped within div in navbar

import React, { Component } from 'react';
import ReactDOM from "react-dom";
import SmallPie from './SmallPie';
import shortid from "shortid";
import { callBackend } from './Funcs';

class DeckList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            deckData: [],
            loaded: false,
            placeholder: "Loading...",
        }
    }

    // ajax call for user's deck
    getDecks = () => {
        callBackend('../api/userDecks/')
            .then(data => this.setState({ deckData: data, loaded: true }));     
    }

    // call getDecks on initial mount
    componentDidMount() {
        this.getDecks();
    }

    // creates new deck
    addDeck = (e) => {
        e.preventDefault();
        if (this.newDeck.value) {
            callBackend('../api/addDeck/' + this.newDeck.value).then(data => {
                this.getDecks();
                this.newDeck.value = '';
            });
        }
    }

    render() {
        return (
            <div>
                <div className="deckList">
                    {this.state.deckData.map((deck) => (
                        <div key={shortid.generate()} className="navGrid">
                            <div>
                                <a className="dropdown-item" href={"/deck/" + deck.deck_id}>
                                    {deck.deck_name}
                                </a>
                            </div>
                            <div className="deckPies"><SmallPie height="30" width="30" deckId={deck.deck_id} /></div> 
                        </div>
                    ))}
                </div>
                <div className="input-group mb-3">
                    <input type="text" className="form-control"
                        ref={(input) => { this.newDeck = input }} placeholder="Create New Deck" />
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" onClick={this.addDeck} type="submit">Add</button>
                    </div>
                </div>
            </div>
        );
    }
}

const wrapper = document.getElementById('modal');
wrapper ? ReactDOM.render(<DeckList />, wrapper) : null;

