// main container for rows in advanced search table

import React, { Component } from 'react';
import TableRow from './TableRow';
import shortid from "shortid";

class AdvSearch extends Component {
    constructor(props) {
        super(props)
        this.state = this.initialState
    }

    // initialize parameter object
    get initialState() { 
        return {
            paramText: [],
            params: [{
                id: 0,
                name: 'Rules Text',
                url: '&card_text=',
                text: ''
            }, {
                id: 1,
                name: 'Expansion',
                url: '&expansion=',
                text: ''
            }, {
                id: 2,
                name: 'Colors',
                url: '&mana_cost=',
                text: ''
            }, {
                id: 3,
                name: 'Types',
                url: '&types=',
                text: ''
            }, {
                id: 4,
                name: 'CMC',
                url: '&converted_mana_cost=',
                text: ''
            }, {
                id: 5,
                name: 'Subtypes',
                url: '&subtypes=',
                text: ''
            }, {
                id: 6,
                name: 'Power',
                url: '&p=',
                text: ''
            }, {
                id: 7,
                name: 'Flavor Text',
                url: '&flavor_text=',
                text: ''
            }, {
                id: 8,
                name: 'Toughness',
                url: '&t=',
                text: ''
            }, {
                id: 9,
                name: 'Format',
                url: '&fmt=',
                text: ''
            }, {
                id: 10,
                name: 'Artist',
                url: '&artist=',
                text: ''
            }, {
                id: 11,
                name: 'Rarity',
                url: '&rarity=',
                text: ''
            }]
        }
    }

    setExclude = (excludeFromChild) => this.props.setExclude(excludeFromChild);

    // reset parameter object to initial, call TableRow to reset
    reset = () => {
        this.setState(this.initialState);
        this.tableRow.reset();
    }

    // clear specific parameter
    removeParam = (param) => {
        let newParams = this.state.params;
        newParams[param.id].text = newParams[param.id].text.replace(param.text, '');
        this.setState({
            params: newParams
        });
        this.props.setParams(newParams) // sends up new parameter object to parent
    }

    // receives new parameter from TableRow
    getParams = (paramsFromChild) => {
        let newParams = this.state.params;
        newParams[paramsFromChild.id] = paramsFromChild;
        this.setState({
            params: newParams
        });
        this.props.setParams(newParams) // sends up new parameter object to parent
    }

    // receives qString from TableRow and passes it up to Toggle
    getPString = (pStringFromChild) => this.props.paramString(pStringFromChild);

    render() {
        return (
            <div id="advGrid" className="advGrid">
                {this.state.params.map((param) => {
                    return <TableRow ref={(child) => { this.tableRow = child }}
                        key={shortid.generate()} param={param} setExclude={this.setExclude}
                        paramText={this.getParams} paramString={this.getPString} />
                })}     
            </div>
        );
    }
}

export default AdvSearch;