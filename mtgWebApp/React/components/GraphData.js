// provides data for deck mana symbol and land distribution charts

import React, { Component } from 'react';
import PropTypes from "prop-types";
import shortid from "shortid";
import DoughChart from "./DoughChart";
import PieChart from "./PieChart";

class GraphData extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lCount: 0,
            sCount: 0,
        }
    }

    // iterate through mana symbols and increments symbol and land count on match
    getColors = (isSymbol, cardData, deckCards, cardId, colors) => {
        let valueArray = [];
        cardData.split(' ').map((color) => {
            let sliceColor = color.slice(1, -1); // remove '{' and '}' from color 
            if (sliceColor == 'Red' || sliceColor == 'Blue' || sliceColor == 'Green' ||
                sliceColor == 'White' || sliceColor == 'Black') {
                for (let dc of deckCards) {
                    if (cardId == dc.card) {
                        (isSymbol)
                            ? (this.setState({
                                sCount: this.state.sCount + 1 * dc.quantity,
                            }))
                            : (this.setState({
                                lCount: this.state.lCount + 1 * dc.quantity,
                            }))
                        colors[sliceColor] += 1 * dc.quantity;
                    }
                }
            }
        });
        return colors;
    }

    // count number of colored symbols
    countColors = (cards, deckCards, deckName) => {
        let cardColors = {
            Red: 0,
            Blue: 0,
            Green: 0,
            White: 0,
            Black: 0,
        };
        let landColors = { ...cardColors };

        if (deckName != 'Shoe Box') {
            cards.map((card) => {
                // count mana cost symbols, else count land colors
                if (card.mana_cost) {
                    cardColors = this.getColors(true, card.mana_cost, deckCards, card.card_id, cardColors)
                }
                else if (card.types.includes('Land')) {
                    if (card.card_text) {
                        landColors = this.getColors(false, card.card_text, deckCards, card.card_id, landColors)
                    }
                }
            })
        }

        // put values colors objects into graphs as arrays
        this.pieGraph.setData(Object.values(cardColors));
        this.doGraph.setData(Object.values(landColors));
    }

    // resets land and symbol count to 0
    resetCount = () => {
        this.setState({
            lCount: 0,
            sCount: 0,
        });
    }

    render() {
        return (
            <div className={this.props.chart}>
                <div className={this.props.doughChart}>
                    <DoughChart ref={(dough) => { this.doGraph = dough }}
                        symbols={this.state.sCount} lands={this.state.lCount} />
                </div>

                <PieChart ref={(pie) => { this.pieGraph = pie }} />
            </div>
        );
    }
}

export default GraphData;