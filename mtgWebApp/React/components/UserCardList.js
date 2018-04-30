// scrolling sidebar that displays user's deck/shoe box cards

import React, { Component } from 'react';
import shortid from "shortid";
import CardView from "./CardView";
import GraphData from "./GraphData";
import SnackBar from "./SnackBar";
import Grid from 'react-virtualized/dist/commonjs/Grid';
import { callBackend, countTypes, multiTypeCheck } from './Funcs';

class UserCardList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            deckData: [],
            deckCards: [],
            showing: '',
            deckName: '',
            loaded: false,
            deckId: 0,
            placeholder: "Loading...",
            graph: false,
            height: 0,
            fix: false,
            typeIndex: 0,
            typeCount: {},
        }
        this.scroll = this.handleScroll.bind(this);
        this.resize = this.updateWindowDimensions.bind(this);
    }

    static defaultProps = {
        cardTypes: [
            '',
            'Creature',
            'Land',
            'Enchantment',
            'Artifact',
            'Sorcery',
            'Instant',
            'Planeswalker',
        ],
    }

    // count cards of type currently loaded in sidebar
    getCount = (cards) => this.setState({ typeCount: countTypes(cards, this.props.cardTypes) });

    // reverts certain state items before loading cards
    loadCardState = (deckId, deckName) => {
        this.setState({
            loaded: false,
            deckId: deckId,
            deckName: deckName,
        })
    }

    // ajax call for user's cards from loaded deck, deckId = 0 for shoe box
    loadCards = (deckName, deckId) => {
        const { cardTypes } = this.props;
        (deckId != 0)
            ? (this.loadCardState(deckId, deckName))
            : (this.loadCardState(0, 'Shoe Box'));
        callBackend(`../api/getUserCards/${deckId}`)
            .then(data => {
                this.getCount(data)
                this.getDeckCards(deckId, data, deckName)
                const { typeCount, typeIndex } = this.state;
                // if index isn't 0, display card count of current type
                (this.state.typeIndex != 0)
                    ? (this.setDataShow(data, typeIndex,
                            `${deckName}: ${typeCount[cardTypes[typeIndex]]} ${cardTypes[typeIndex]} Cards`))
                    : (this.setDataShow(data, typeIndex,
                            `${deckName}: ${data.length} Cards`));
            });
    };
    
    // sets state from loadCards' data
    setDataShow = (data, index, showing) => {
        this.setState({
            data: data,
            typeIndex: index,
            showing: showing,
        });
    }

    // ajax call for deck's cards, skip graph functions if shoe box
    getDeckCards = (id, cards, deckName) => {
        callBackend(`../api/DeckCards/${id}`)
            .then(data => {
                if (deckName != 'Shoe Box' && data.length > 0) {
                    this.graphData.resetCount();
                    this.graphData.countColors(cards, data, deckName);
                }
                this.setState({
                    deckCards: data,
                    loaded: true
                })
            });
    }

    // sets intial y position and height of sidebar
    setInitialPos = () => {
        let newHeight = window.innerHeight - this.props.y - 50;
        this.setState({ height: newHeight });
    }

    // calls necessary functions to build component on initial mount
    componentDidMount() {
        this.getDecks(true);
        window.addEventListener('scroll', this.scroll);
        window.addEventListener('resize', this.resize);
        this.resize;
        this.setInitialPos();
    }

    // resize listener to adjust hieght of sidebar on window
    updateWindowDimensions = (e) => {
        let userInnerTop = this.userInner.getBoundingClientRect().top; 
        let height = window.innerHeight - userInnerTop - 50;
        this.setState({ height: height });
    }

    // gets user's deck, calls loadCards if intial page load
    getDecks = (firstLoad) => {
        callBackend('../api/userDecks/')
            .then(data => {
                this.setState({ deckData: data });
                if (firstLoad) {
                    let deckName = (this.props.hasShoe) ? ('Shoe Box') : (data[0].deck_name)
                    let deckId = (this.props.hasShoe) ? (0) : (data[0].deck_id)
                    this.loadCards(deckName, deckId)
                } 
            });
    }

    // creates new deck
    addDeck = (e) => {
        if (this.newDeck.value) {
            e.preventDefault();
            callBackend(`../api/addDeck/${this.newDeck.value}`)
                .then(data => {
                    this.getDecks(false);
                    this.getSnack(showAdd, `${this.newDeck.value} created`);
                    this.newDeck.value = '';
                });
        }
    }

    // preventDefault so that onDrop will trigger
    onDragOver = (ev) => {
        ev.preventDefault();
    }

    // preventDefault so that onDrop will trigger
    onDragEnter = (ev) => {
        ev.preventDefault();
    }

    // card dropped into sidebar, ajax call to add card to currently loaded collection
    onDrop = (ev, dragCard) => {
        ev.preventDefault();
        callBackend(`../api/addCard/${this.state.deckId}/${dragCard[0]}`)
            .then((data) => {
                var card = dragCard[1];
                var deck = this.state.deckName;
                if (data == true) {
                    this.loadCards(this.state.deckName, this.state.deckId);
                    this.getSnack("showAdd", `${card} added to ${deck}`);
                }
                else {
                    this.getSnack("showIn", `${card} is already in ${deck}`);
                }
            });
    }

    // removes event listeners on unmount
    componentWillUnmount() {
        window.removeEventListener('scroll', this.scroll);
        window.removeEventListener('resize', this.resize);
    }

    // receives new y position from parent
    setTop = (newY) => {
        let userInnerTop = this.userInner.getBoundingClientRect().top; 
        let originalHeight = window.innerHeight - userInnerTop - 48;
        let newHeight = window.innerHeight - 48;

        // fixes to top if current y is greater than current new y
        (window.scrollY >= newY)
            ? (this.setBounds(true, newHeight))
            : (this.setBounds(false, originalHeight))
    }

    // sets height and top position of sidebar
    setBounds = (fixed, height) => {
        this.setState({
            fix: fixed,
            height: height,
        });
    }

    // scroll listener to calculates bounds of sidebar, fix to top if scrolled past
    handleScroll = (event) => {
        let userInnerTop = this.userInner.getBoundingClientRect().top; 
        let originalHeight = window.innerHeight - userInnerTop - 48;
        let newHeight = window.innerHeight - 48;

        // fixes to top if scrolled past
        (window.scrollY >= this.props.y)
            ? (this.setBounds(true, newHeight))
            : (this.setBounds(false, originalHeight))
    }

    // calls function in snackbar to display message
    getSnack = (className, text) => this.snack.setSnack(className, text);

    // sets snackbar message and reloads deck card's after successful quantity update
    reloadQuant = (removed, card, quant) => {
        (removed) 
            ? (this.getSnack("showIn", `${card} removed from ${this.state.deckName}`))
            : (this.getSnack("showUp", `${card} quantity updated to ${quant}`))
        this.getDeckCards(this.state.deckId, this.state.data, this.state.deckName);
    }

    // changes displayed card type in sidebar based on current type index
    changeType = (e, direction) => {
        e.preventDefault();
        const { typeIndex, deckName, data, typeCount } = this.state

        let index = typeIndex + direction;
        let types = this.props.cardTypes;

        if (index < 0) {
            this.setDataShow(data, 7,
                `${deckName}: ${typeCount[types[7]]} ${types[7]} Cards`)
        }
        else if (index > 7 || index == 0) {
            this.setDataShow(data, 0,
                `${deckName}: ${data.length} Cards`)
        }
        else {
            this.setDataShow(data, index,
                `${deckName}: ${typeCount[types[index]]} ${types[index]} Cards`)
        }
    }

    // 
    buildCard = (card) => {
        const { deckId, deckCards, deckName } = this.state;
        let props = {
            'card': card,
            'btnDivClass': (deckId > 0) ? ("deckRemove") : ("shoeRemove"),
            'deckId': deckId,
            'deckName': deckName,
            'reloadQuant': this.reloadQuant,
            'deckCards': deckCards,
            'loadCards': this.loadCards,
        }
        return (
            <CardView key={shortid.generate()} {...props} />
        );
    }

    // populates 2D array with cards
    getScrollCards = (cards, index) => {
        const { data, typeIndex, deckId, deckCards, deckName } = this.state;
        let type = this.props.cardTypes[typeIndex];
        let cardList = [[], []]
        let count = 0; // manual index of card types
        data.map((card) => {
            if (card.types.includes(type) && !multiTypeCheck(type, card)) {
                // puts card of even index in first array, odd in second array
                (count % 2 == 0)
                    ? (cardList[0].push(this.buildCard(card)))
                    : (cardList[1].push(this.buildCard(card)))
                count += 1;
            }
        });
        return cardList;
    }

    // builds main grid of sidebar with array from getScrollCards
    cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
        let cardArray = this.getScrollCards();
        return (
            <div key={key} style={style}>
                {cardArray[columnIndex][rowIndex]}
            </div>
        )
    }

    // gets number of rows needed for main grid of sidebar -> halved type count rounded up
    getRows = () => {
        if (this.state.typeCount[this.props.cardTypes[this.state.typeIndex]]) {
            return Math.ceil((this.state.typeCount[this.props.cardTypes[this.state.typeIndex]]) / 2);
        }
        else {
            return Math.ceil((this.state.data.length) / 2);
        }
    }

    //shouldComponentUpdate() {
    //    if (this.state.loaded) return true;
    //    return false;
    //}

    render() {
        const { height, fix, deckName, data, showing, deckData, loaded } = this.state
        const { y, hasShoe, dragCard } = this.props

        return (
            <div id="userCardOuter">
                <div id="userCardInner" style={fix ? { top: '0' } : { top: y }} 
                    ref={(div) => { this.userInner = (div) }} className={fix ? 'floating' : ''}>

                    {(deckName != 'Shoe Box' && data.length != 0) &&
                        (<GraphData ref={(graph) => { this.graphData = graph }}
                            chart="chart" doughChart="doughChart"/>)
                    }

                    <a className="btn btn-dark" id="leftButton" onClick
                        href="javascript:void(0)" onClick={(e) => this.changeType(e, -1)}> 
                            <span className="octicon octicon-triangle-left"
                                style={{ color: 'white', textAlign: 'middle' }}></span>
                        </a>

                    <a className="btn btn-dark" id="rightButton"
                        href="javascript:void(0)" onClick={(e) => this.changeType(e, 1)}>
                            <span className="octicon octicon-triangle-right"
                                style={{ color: 'white', textAlign: 'middle' }}></span>
                        </a>

                    <a className="nav-link dropdown-toggle btn btn-dark" href="javascript:void(0)"
                        id="" data-toggle="dropdown" 
                        aria-haspopup="true" aria-expanded="false">
                        {showing}
                    </a>

                    <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                        <div id="deckMenuItems">
                            {(hasShoe) && (
                                <a className="dropdown-item" onClick={() => { this.loadCards('Shoe Box', 0) }} href="javascript:void(0)" > Shoe Box</a>
                            )}
                            {deckData.map((deck) => (
                                <a key={shortid.generate()}  className="dropdown-item" onClick={() => { this.loadCards(deck.deck_name, deck.deck_id) }} href="javascript:void(0)" >{deck.deck_name}</a>
                            ))}
                        </div>
                        <span className="dropdown-item" onClick={(e) => e.preventDefault()}>
                            <div className="input-group mb-3" >
                                <input type="text" className="form-control" 
                                    ref={(input) => { this.newDeck = input }} placeholder="Create New Deck" />
                                <div className="input-group-append">
                                    <button className="btn btn-outline-secondary" onClick={this.addDeck} type="submit">Add</button>
                                </div>
                            </div>
                        </span>
                    </div>

                    <div onDragOver={(e) => this.onDragOver(e)} onDragEnter={(e) => this.onDragEnter(e)}
                        onDrop={(e) => this.onDrop(e, dragCard)} draggable="false">
                        {(loaded) && (
                            <Grid
                                cellRenderer={this.cellRenderer.bind(this)}
                                columnCount={2}
                                columnWidth={175}
                                height={height}
                                rowCount={this.getRows()}
                                rowHeight={244}
                                width={367}
                            />
                        )}
                    </div>
                </div>
                <SnackBar ref={(value) => { this.snack = (value) }} />
            </div>
        );
    }
}

export default UserCardList;