// component for displaying contets of user's deck in deck.html

import React, { Component } from 'react';
import ReactDOM from "react-dom";
import shortid from "shortid";
import UserCardList from './UserCardList';
import CardTypes from './CardTypes';
import SmallPie from './SmallPie';
import { callBackend, multiTypeCheck } from './Funcs';

class Deck extends Component {
    constructor(props) {
        super(props)
        this.state = {
            deckCards: [],
            cards: [],
            deckName: '',
            loaded: false,
            dragCard: [],
            style: {},
            hidden: false,
            totalCards: 0,
            failed: false,
            oldCards: [],
        }
    }

    static defaultProps = {
        // regex used to match 'x(number)' from end of textarea line
        regex: /(\sx\d+)$/g,
        cardTypes: [
            'Creature',
            'Land',
            'Enchantment',
            'Artifact',
            'Sorcery',
            'Instant',
            'Planeswalker',
        ],
    }

    // receives dragged card from CardTypes, passes it to UserCardList
    getCard = (cardFromChild) => this.setState({ dragCard: cardFromChild });

    // ajax call for deck's cards
    getCards = () => {
        this.setState({ loaded: false })
        callBackend(`api/getUserCards/${this.state.id}`)
            .then(data => {
                this.setState({
                    cards: data,
                })
                this.getDeckCards()
            });
    }

    // ajax call for name of deck
    getDeckName = () => {
        callBackend(`api/userDeckName/${this.state.id}`)
            .then(data => {
                this.setState({
                    deckName: data[0].deck_name,
                })
        });
    }

    // sets initial window 
    componentDidMount() {
        this.setState({
            top: window.scrollY,
        })
        this.getCards();
        this.getDeckName();
    }

    // gets deck id from dataset on django template, sets before initial render
    componentWillMount() {
        let div = document.getElementById('deck');
        let id = div.dataset.id;
        this.setState({ id: id });
    }

    // ajax call for deck card information
    getDeckCards = () => {
        callBackend(`api/DeckCards/${this.state.id}`)
            .then(data => {
                this.countDeckCards(data)
                this.deckGraph.countColors(this.state.cards, data, '');
                this.setState({
                    deckCards: data,
                    loaded: true,
                });
            });
    }

    // counts total cards within deck
    countDeckCards = (cards) => {
        let cardCount = cards.reduce((total, card) => {
            return total + card.quantity;
        }, 0);
        this.setState({ totalCards: cardCount })
        
    }

    // set top y poisiton of UserCardList
    setUserList = () => this.userCards.setTop(100);

    // alerts user if input format was incorrect
    saveAlert(quant, lineText, index, type) {
        document.getElementById(type + 'alert').hidden = false;
        let error = `error on line ${index}: ${lineText}`;

        (quant) 
           ? this.userCards.getSnack("showIn", `Quant ${error}`)
           : this.userCards.getSnack("showIn", `Name ${error}`)
    }

    // check format of textarea, make ajax call to Django if successful
    saveCards = (text, type) => {
        let quantArray = [];
        let cardArray = [];
        let failed = false;
        if (!text.value.length) {
            this.setElements(false, type)
            return;
        }
        // split textarea at linebreak
        text.value.split('\n').map((line, index) => {
            let match = line.match(this.props.regex)
            try {
                // store quantity from end of line
                quantArray.push(match[0].substring(2));
                // store card name
                cardArray.push(line.replace(match[0], ''));
            }
            catch (err) {
                this.saveAlert(true, line, (index + 1), type)
                this.setElements(true, type)
                failed = true;
            }
        })
        // break out of function if there was an error
        if (failed) {
            return;
        }
        let sendData = JSON.stringify({
            cards: cardArray,
            quants: quantArray,
            deckId: this.state.id, 
            oldCards: this.state.oldCards,
        });
        callBackend('/api/bulkAdd/?&update=' + sendData)
            .then((data) => {
            this.setElements(!data[0], type)
            if (data[0]) {
                this.getCards();
                this.getDeckCards();
                this.deckGraph.getUserCards();
                this.userCards.getSnack("showAdd", this.state.deckName + ' Updated');
            }
            else {
                this.saveAlert(false, data[1], (parseInt(data[2]) + 1), type)
            }
        })
    }

    // changes cardType div into editable list of card links, or saveable textarea
    editCards = (e, card, type, save) => {
        let text = document.getElementById(type + 'Text');
        // check if button was 'save' or 'edit'
        if (save) {
            this.saveCards(text, type);
        }
        // populates textarea with cards of that type and their quantity
        else {
            const { cards, deckCards } = this.state
            let oldCardArray = [];
            let cardArray = [];
            let rowCounter = 2; // used to set extra space at end of textarea
            cards.map((card) => {
                if ((card.types.includes(type)) && (!multiTypeCheck(type, card))) {
                    deckCards.map((dc) => {
                        if (card.card_id == dc.card) {
                            rowCounter++;
                            oldCardArray.push(card.card_id);
                            cardArray.push(card.card_name + ' x' + dc.quantity);
                        }
                    });
                }
            });
            this.setState({ oldCards: oldCardArray });
            text.rows = rowCounter;
            text.value = cardArray.join('\n');
            this.setElements(false, type);
        }
    }

    // set items to hidden/visible, do nothing if error when save button clicked
    setElements = (failed, type) => {
        if (!failed) {
            let alert = document.getElementById(type + 'alert')
            let text = document.getElementById(type + 'Text');
            let saveBtn = document.getElementById(type + 'save');
            let editBtn = document.getElementById(type + 'edit');
            let list = document.getElementById(type + 'List');

            let hidden = this.state.hidden;
            [list, editBtn, text, saveBtn]
                .map((el, i) => el.hidden = (i < 2) ? !hidden : hidden);
            alert.hidden = true;
            this.setState({
                hidden: !hidden,
            });
        }  
    }

    // iterate cards, populate type div with list of matching card links
    getCardTypes(cardType) {
        let cardArray = this.state.cards.map((card) => {
            if (card.types.includes(cardType) && (!multiTypeCheck(cardType, card))) {
                return (
                    <CardTypes key={card.card_id} dragCard={this.getCard} card={card}
                        type={cardType} deckCards={this.state.deckCards} />
                );
            }
        })
        // send back type div to render
        return (
            <div id={cardType} className="deckColumns">
                <div style={{ margin: 'auto', textAlign: 'center' }}>
                        <strong>{cardType}</strong>
                    <button type="button" id={cardType + "edit"} style={{ marginLeft: '10px' }}
                        onClick={(e) => this.editCards(e, this.state.cards, cardType, false)}
                        className="btn btn-secondary btn-sm">Edit</button>
                    <button type="button" hidden id={cardType + "save"} style={{ marginLeft: '10px' }}
                        onClick={(e) => this.editCards(e, this.state.cards, cardType, true)}
                        className="btn btn-danger btn-sm">Save</button>
                </div>
                <ul id={cardType + 'List'}>
                    {/* render card array */}
                    {cardArray}
                </ul>
                <textarea className="deckText" hidden id={cardType + 'Text'}></textarea>
                <div className="alertSpan">
                    <a hidden className="alertLink" id={cardType + "alert"}
                        data-toggle="modal" href="#alert">
                        Error. Click here for more info.
                    </a>
                </div>
            </div>
        )
    }

    // deletes user's deck
    deleteDeck = () => {
        callBackend('../api/deleteDeck/' + this.state.id)
            .then((data) => {
                this.userCards.getSnack("showAdd", "Deck deleted");
            });
        // clear session, redirect to homepage after timer
        sessionStorage.clear();
        setTimeout(() => {
            window.location.href = "/";
        }, 750);
    }

    // update deck's name
    updateName = (newName) => {
        callBackend('../api/updateDeckName/' + this.state.id + '/' + newName)
            .then((data) => {
            this.setState({ deckName: newName })
            this.userCards.getSnack("showAdd", "Deck Name updated to " + newName);
        })
    }

    // hides deckname text on edit click, shows input for new name
    editDeckName(save) {
        let header = document.getElementById('nameHeader')
        let input = document.getElementById('headerInput')
        let text = this.nameText;
        if (!save) {
            header.hidden = true;
            input.hidden = false;
        }
        else {
            // check for empty text input
            if (text.value) {
                this.updateName(text.value);
                header.hidden = false;
                input.hidden = true;
            }
            else {
                this.userCards.getSnack("showIn", "Deck Name cannnot be empty!")
                text.placeholder = "Please enter a name";
            }
        }
    }

    render() {
        const { totalCards, deckName, id, dragCard, loaded } = this.state;

        return (
            <div className="deckPage">
                <div className="contain">
                    <div className="deckHeader">
                        <div className="deckPie">
                            <SmallPie ref={(graph) => { this.deckGraph = (graph) }} height="50" width="50" deckId={id} />
                        </div> 
                        <div className="deckName">
                            <span id="nameHeader"><h2>{`${deckName}: ${totalCards} Cards`}</h2></span>
                            <div hidden id="headerInput" className="input-group mb-3">
                                <input type="text" ref={(value) => this.nameText = (value)} />
                                <div className="input-group-append">
                                    <button className="btn btn-danger" onClick={() => this.editDeckName(true)}>Save</button>
                                </div>
                            </div>
                        </div>
                        <div id="deckDropdown" className="dropdown">
                            <button className="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span className="octicon octicon-gear"
                                    id="deckOptions"></span>
                            </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a className="dropdown-item" href="#" onClick={() => this.editDeckName(false) }>Edit Deck Name</a>
                                <a className="dropdown-item" href="#deleteCheck"
                                    data-toggle="modal">
                                    Delete Deck
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* split types into 3 on left side and 4 on right side */}
                        <div>
                            {loaded && (this.props.cardTypes.map((type, index) => (
                                (index < 3) &&
                                this.getCardTypes(type)
                            )))}
                        </div>
                        <div>
                            {loaded && (this.props.cardTypes.map((type, index) => (
                                (index >= 3) &&
                                this.getCardTypes(type)
                            )))}
                        </div>                    
                    
                    <UserCardList hasShoe={true} dragCard={dragCard}
                       y={100} ref={(child) => { this.userCards = child }} />
                </div>

                {/* modal for correct input format */}
                <div id="alert" className="modal" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Correct Format</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            {/* helper text */}
                            <div className="modal-body">
                                <span>Card name must be <strong>exact</strong>, followed by a single space, 
                                    a single lower-case 'x', and finally a non-decimal integer.
                                    Also ensure that there are no empty lines in the text area.
                                </span>
                                <br />
                                <br />
                                <span><strong>Example:</strong></span>
                                <br />
                                <span><i>Shivan Dragon x4</i></span>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* modal for delete deck verification */}
                <div className="modal fade" id="deleteCheck" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Deck Deletion</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                Are you sure that you want to delete <i>{" " + deckName}</i>?
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-danger"
                                    onClick={() => this.deleteDeck() }>Delete Deck</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const wrapper = document.getElementById('deck');
wrapper ? ReactDOM.render(<Deck />, wrapper) : null;

