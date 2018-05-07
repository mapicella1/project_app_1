// component for displaying contets of user's deck in deck.html

import React, { Component } from 'react';
import ReactDOM from "react-dom";
import shortid from "shortid";
import UserCardList from './UserCardList';
import CardTypes from './CardTypes';
import CardView from './CardView';
import { colors, BucketLink } from './MetaData';
import { callBackend, getCardName, countTypes, multiTypeCheck, buildCard } from './Funcs';

class ShoeBox extends Component {
    constructor(props) {
        super(props)
        this.state = {
            cards: [],
            dragCard: [],
            active: "btn btn-outline-info btn-sm active",
            notActive: "btn btn-outline-info btn-sm",
            typeCount: {},
            activeColors: { ...this.props.activeColors },
        }
    }

    static defaultProps = {
        cardTypes: [,
            'Creature',
            'Land',
            'Enchantment',
            'Artifact',
            'Sorcery',
            'Instant',
            'Planeswalker',
        ],
        colorClasses: [
            "btn btn-outline-success btn-sm",
            "btn btn-outline-danger btn-sm",
            "btn btn-outline-primary btn-sm",
            "btn btn-outline-light btn-sm",
            "btn btn-outline-dark btn-sm",
            "btn btn-outline-secondary btn-sm",
        ],
        activeColors: {
            'Red': false,
            'Green': false,
            'Blue': false,
            'White': false,
            'Black': false,
            'Colorless': false,
        },
    }

    // ajax fetch for user's shoe box cards
    getCards = () => {
        callBackend('../api/getUserCards/0')
            .then(data => {
                this.getCount(data);
                this.setState({
                    cards: data,
                    loaded: true,
                })
            });
    }

    // count cards of each type
    getCount = (cards) => {
        this.setState({ typeCount: countTypes(cards, this.props.cardTypes) });
    }

    // initial card fetch on mount
    componentDidMount() { this.getCards(); }

    // set top y poisiton of UserCardList
    setUserList = () => { this.userCards.setTop(100); }

    // remove card from user's shoe box
    removeCard(e, id, name) {
        e.preventDefault();
        callBackend(`../api/removeCard/0/${id}`)
            .then(data => {
            this.getCards();
            this.userCards.getSnack("showIn", `${name} removed from Shoe Box`);
        });
    }

    // sets currently dragged card
    dragCard = (e, id, name) => {
        this.setState({ dragCard: [id, name] });
    };

    // buildCard image with remove button
    buildCard = (card) => {
        return (
            <div className="scrollImages" id={card.card_id}>
                <a href={`/card/${card.card_id}`}
                    onDragStart={(e) => this.dragCard(e, card.card_id, card.card_name)}>
                    <img style={{ width: '192px' }} className="innerImage"
                        src={`${BucketLink}/Card/${getCardName(card.card_name)}.jpg`}
                        alt={card.card_name} />
                </a>
                <div className="middle">
                    <div className="shoePageRemove">
                        <a className="btn btn-danger btn-sm" href="javascript:void(0)">
                            <span className="octicon octicon-x"
                                onClick={(e) => this.removeCard(e, card.card_id, card.card_name)}>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // assign cards to their appropriate type div
    getCardTypes(cardType) {
        this.props.cardTypes;
        let cardArray = [];
        this.state.cards.map((card) => {
            // if card matched type, add to array
            if ((card.types.includes(cardType)) && (!multiTypeCheck(cardType, card))) {
                cardArray.push(this.buildCard(card));
            }
        })
        if (cardArray.length) {
            return (
                <div id={cardType + 'Div'}>
                    <div className="typeHeader"><h3>{cardType + ": " + this.state.typeCount[cardType] + " Cards"}</h3></div>
                    <div className="typeGrid">
                        {/* display array of cards inside of their corresponding type dive */}
                        {cardArray}
                    </div>
                </div>
            )
        }
        // if no cards return empty div
        else {
            return (
                <div id={cardType + 'Div'}></div>
            )
        } 
    }

    // check types of clicked button
    selectDivs = (e, type) => {
        e.preventDefault();
        let allBtn = this.allTypeBtn;
        if (type == 'all') {
            // set allBtn to active, diactive all other type buttons, show all cards
            allBtn.className = this.state.active
            this.props.cardTypes.map((cType) => {
                let div = document.getElementById(cType + 'Div');
                let typeBtn = document.getElementById(cType + 'Btn');
                typeBtn.className = this.state.notActive;
                div.hidden = false;
            })
        }
        else {
            // deactive allBtn
            allBtn.className = this.state.notActive
            let thisBtn = document.getElementById(type + 'Btn')
            let div = document.getElementById(type + 'Div');
            // set visibility of type div corresponding to clicked button
            (thisBtn.className.includes('active')) 
                ? (div.hidden = false)
                : (div.hidden = true) 
            // iterate through types, set visibility of type div 
            // equal to activity of corresponding type button
            this.props.cardTypes.map((cType) => {
                let typeBtn = document.getElementById(cType + 'Btn');
                if (type != cType) {
                    typeBtn.className = this.state.notActive;
                    let otherDiv = document.getElementById(cType + 'Div');
                    otherDiv.hidden = true;
                }
            }) 
        }
    }

    // builds button group for card type sorting
    getTypeButtons() {
        let buttonArray = [];
        this.props.cardTypes.map((type) => {
            buttonArray.push(
                <label id={type + 'Btn'} className="btn btn-outline-info btn-sm"
                    
                    onClick={(e) => { this.selectDivs(e, type) }}>
                    <input type="checkbox" />{type}
                </label>
            )
        })
        return (
            <div id="buttonContainer" className="btn-group btn-group-toggle" data-toggle="buttons" >
                <label id={'allBtn'} className="btn btn-outline-info btn-sm active"
                    ref={(allTypeBtn) => this.allTypeBtn = (allTypeBtn)}
                    onClick={(e) => { this.selectDivs(e, 'all') }}>
                    <input type="checkbox" />Show All
                </label>
                {buttonArray}
            </div>
        )
    }

    setAllColors = (allBtn) => {
        allBtn.className = "btn btn-outline-warning active btn-sm"
        // reset activeColors object, show all cards
        this.setState({ activeColors: { ...this.props.activeColors } });
        this.state.cards.map((card) => {
            let cardLink = document.getElementById(card.card_id);
            cardLink.hidden = false;
        });
        // deactivate color buttons
        colors.map((color) => {
            let colorBtn = document.getElementById(color + 'Btn');
            this.setButton(colorBtn);
        });
    }

    // checks color of clicked button
    showColors(e, color) {
        e.preventDefault();
        let allBtn = this.allColorBtn;
        if (color == 'all') {
            this.setAllColors(allBtn);
        }
        else {
            // deactivate allBtn
            this.setButton(allBtn);
            let activeColors = this.state.activeColors
            //allBtn.className = "btn btn-outline-warning btn-sm"
            let colorBtn = document.getElementById(color + 'Btn')

            // get activitiy of clicked button and add to activeColors
            if (colorBtn.className.includes('active')) {
                activeColors[color] = true
                this.setState({
                    activeColors: activeColors,
                });
            }
            else {
                activeColors[color] = false;
                this.setState({
                    activeColors: activeColors,
                });
            }
            // check cards against activeColor object
            this.state.cards.map((card) => {
                this.setColors(activeColors, card);
            })
            // check if all color buttons are inactive
            let checkActive = Object.keys(activeColors).filter(key => {
                return activeColors[key] == true;
            });
            // set all colors visible if no active colors
            if (!checkActive.length) {
                this.setAllColors(allBtn);
            }
        }
    }

    // set button to inactive
    setButton = (button) => button.className = button.className.replace('active', '');

    // iterate through active colors and assign card visibility if they match
    setColors = (activeColors, card) => {
        let counter = 0;
        let cardLink = document.getElementById(card.card_id);
        let cardColors = Object.keys(activeColors).filter((key) => {
            // assign card visibility to colorless if not mana cost
            if (!card.mana_cost && !card.color_indicator) {
                return activeColors['Colorless'];
            }
            // assign card visibility to color button if color indicator matches active color button
            else if (card.color_indicator && card.color_indicator.includes(key)) {
                return activeColors[key];
            }
            // assign card visibility if active color button exists in mana cost or rules text
            // exclude cards with color indicator 
            else if (!card.color_indicator && key != 'Colorless' && (card.mana_cost.includes(key)
                    || (card.card_text && card.card_text.includes("{" + key + "}")))) {
                return activeColors[key];
            }
            // increment counter if no match
            else {
                counter += 1;
            }
        })

        // if cardColors is empty, hide card
        if (!cardColors.length) {
            cardLink.hidden = true;
        }
        else {
            cardLink.hidden = false;
        }
        // if card didn't match any of previous checks, assign visibility to colorless button
        if (counter == 6) {
            cardLink.hidden = !activeColors['Colorless'];
        }
    }

    // builds button group for color sorting
    getColorButtons = () => {
        let buttonArray = colors.map((color, i) => {
            return (
                <label id={color + 'Btn'} className={this.props.colorClasses[i]}
                    onClick={(e) => { this.showColors(e, color) }}>
                    <input type="checkbox" />{color}
                </label>
            );
        });
        return (
            <div id="colorContainer" className="btn-group btn-group-toggle" data-toggle="buttons" >
                <label id={'allColorsBtn'} className="btn btn-outline-warning active btn-sm"
                    ref={(allColorBtn) => this.allColorBtn = (allColorBtn)}
                    onClick={(e) => { this.showColors(e, 'all') }}>
                    <input type="checkbox" />All Colors
                </label>
                {buttonArray}
            </div>
        )
    }

    render() {
        return (
            <div>
                <div className="shoeGrid">
                    <div style={{ textAlign: 'center' }}><h2>{`Your Shoe Box: ${this.state.cards.length} Cards`}</h2></div>
                    <div>
                         { this.getTypeButtons() }
                    </div>
                    <div >
                        { this.getColorButtons() }
                    </div>
                    {this.props.cardTypes.map((type) => (
                        this.getCardTypes(type)
                    ))}
                </div>
                <UserCardList dragCard={this.state.dragCard} hasShoe={false}
                    y={100} ref={(child) => { this.userCards = child }} />
            </div>
        );
    }
}

const wrapper = document.getElementById('shoe');
wrapper ? ReactDOM.render(<ShoeBox />, wrapper) : null;