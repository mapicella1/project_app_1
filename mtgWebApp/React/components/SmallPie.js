// renders small pie chart for use in deck.html and DeckList in the navbar

import React, { Component } from 'react';
import PropTypes from "prop-types";
import shortid from "shortid";
import { Pie } from 'react-chartjs-2';
import { callBackend } from './Funcs';

class SmallPie extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartData: [],
            colors: [],
            deckCards: [],
            cards: [],
        }
    }

    // make ajax call for cards before intial mount
    componentWillMount() {
        this.getUserCards();
    }

    // count number of colored symbols
    countColors(cards, deckCards) {
        let cardColors = {
            Red: 0,
            Blue: 0,
            Green: 0,
            White: 0,
            Black: 0,
        }

        cards.map((card) => {
            if (card.mana_cost) {
                card.mana_cost.split(' ').map((color) => {
                    let sliceColor = color.slice(1, -1); // remove '{' and '}' from color
                    if (sliceColor == 'Red' || sliceColor == 'Blue' || sliceColor == 'Green' ||
                        sliceColor == 'White' || sliceColor == 'Black') {
                        deckCards.map(dc => {
                            cardColors[sliceColor] += 1 * dc.quantity;
                        });
                    }
                })
            }
        });

        // put values cardColors obj into an array
        let cardArray = Object.values(cardColors);

        this.setState({ colors: cardArray })
    }

    // ajax call to get user's card in deck
    getUserCards() {
        callBackend(`../api/getUserCards/${this.props.deckId}`)
            .then(data => {
                this.getDeckCards(this.props.deckId, data)
                this.setState({
                    data: data,
                });
            });
    }

    // ajax call to get deck card data
    getDeckCards = (id, cards) => {
        callBackend(`../api/DeckCards/${id}`)
            .then(data => {
                this.countColors(cards, data);
                this.setState({
                    deckCards: data,
                    loaded: true
                })
            });
    }

    render() {
        return (
            <Pie height={this.props.height} width={this.props.width}
                data={{
                    labels: ['Red', 'Blue', 'Green', 'White', 'Black'],
                    datasets: [{
                        label: 'colors',
                        data: this.state.colors,
                        backgroundColor: [
                            'red',
                            'blue',
                            'green',
                            'white',
                            'black',
                        ],
                        hoverBorderWidth: 0,
                        borderWidth: 0,
                    }],
                }}
                options={{
                    maintainAspectRatio: false,
                    responsive: false,
                    title: {
                        display: false,
                    },
                    tooltips: {
                        enabled: false,
                    },
                    legend: {
                        display: false,
                    },
                }}
            />
        );
    }
}

export default SmallPie;