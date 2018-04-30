// renders each row in advanced search table

import React, { Component } from 'react';
import shortid from "shortid";
import { typeOptions, subtypeOptions, colorOptions, rarityOptions, expansionOptions } from './MetaData'

class TableRow extends Component {
    constructor(props) {
        super(props)
        this.state = this.initialState
    }

    get initialState() {
        return {
            pObj: {},
            pString: '',
        }
    }

    // reverts to initial state
    reset = () => this.setState(this.initialState);

    // check if input is null before building parameters
    checkInput = (e) => {
        e.preventDefault();
        if (this.inputParam) {

            if (this.inputParam.value.length) this.setParams();
        }
        else {
            this.setParams();
        }
    }

    // creates string for queries and object for parameters
    setParams = () => {
        let cat = this.category.value
        let inputString = this.buildInputString(cat);
        let qString = this.buildQString(cat, inputString);
        let pObj = {
            id: this.props.param.id,
            name: this.props.param.name,
            url: this.props.param.url,
            text: this.props.param.text + qString
        }
        this.props.paramText(pObj); // send parameter pobject to AdvSearch
        let pString = {text: qString, id: this.props.param.id, string: this.buildPString(cat, inputString)};
        if (this.inputParam) {
            this.inputParam.value = ''; // reset input element 
        }
        this.props.paramString(pString); // send paramString object to AdvSearch
    }

    // build input string to be used in parameter and query
    buildInputString = (cat) => {
        if (this.isNum()) {
            return `${cat}${this.inputParam.value}`;
        }
        else if (this.isFmt()) {
            return `${cat}_${this.legalCategory.value}`;
        }
        else {
            return this.inputParam.value;
        }
    }

    // build query that will be sent to backend
    buildQString = (cat, inputString) => {
        if (cat == 'or')
            return `+|${inputString}`;
        else if (cat == 'not')
            return `+!${inputString}`;
        else if (cat == 'exact')
            return `+*${inputString}`;
        else
            return `+${inputString}`;
    }

    // build parameter string that is displayed to the user
    buildPString = (cat, inputString) => {
        let verb = (!this.isNum() ? ((cat == 'and') ? 'has' : cat) : '');
        let param = (!this.isFmt() ? inputString : this.legalCategory.value);
        return `${this.props.param.name} ${verb} ${param} `
    }

    static defaultProps = {
        categories: ['and', 'or', 'not', 'exact'],
        numCategories: ['=', '<', '>', '<=', '>='],
        fmtCategories: ['Standard', 'Modern', 'Legacy', 'Commander', 'Vintage', 'Unsets'],
        legalCategories: ['Legal', 'Banned', 'Restricted'],
        numTypes: ['Power', 'Toughness', 'CMC']
    }

    // check if paramater have numerical value types
    isNum() {
        if (this.props.numTypes.includes(this.props.param.name)) {
            return true;
        }
        else {
            return false;
        }
    }

    // check if parameter is for format/legality
    isFmt() {
        if (this.props.param.name == 'Format') {
            return true;
        }
        else {
            return false;
        }
    }

    // check if format if for colors
    isColor() {
        if (this.props.param.name == 'Colors') {
            return true;
        }
        else {
            return false;
        }
    }

    // assign appropriate datalist to input field based on param id
    getOptions = () => {
        let options;
        switch (this.props.param.id) {
            case 1:
                options = expansionOptions
                break;
            case 2:
                options = colorOptions
                break;
            case 3:
                options = typeOptions
                break;
            case 5:
                options = subtypeOptions
                break;
            case 11:
                options = rarityOptions
                break;
            default:
                options = null;
        }
        return options;
    }
    
    render() {
        let categoryOptions = this.props.categories.map(category => {
            return <option key={shortid.generate()} value={category}>{category}</option>
        });
        let numOptions = this.props.numCategories.map(num => {
            return <option key={shortid.generate()} value={num}>{num}</option>
        });
        let fmtOptions = this.props.fmtCategories.map(fmt => {
            return <option key={shortid.generate()} value={fmt}>{fmt}</option>
        });
        let legalOptions = this.props.legalCategories.map(legal => {
            return <option key={shortid.generate()} value={legal}>{legal}</option>
        });

        const { param } = this.props

        return (
        <div>
            <table className="table table-dark" >
                <tbody>
                    <tr className="advRow">
                            <td style={{ align: 'right' }}><label>{param.name}</label></td>
                            {// --exclude unselected colors checkbox; removed until functional django code implemented
                            //(this.isColor()) && 
                            //    (<td>
                            //    <span >
                            //        <input type="checkbox" tabIndex="0" data-toggle="tooltip"
                            //            id="colorExclude" title="Exclude Unselected" />
                            //    </span>
                            //</td>)
                            }
                            <td>
                                <select ref={(value) => { this.category = value }}>
                                    {(this.isFmt()) // populate select element based off of param type
                                        ? (fmtOptions)
                                        : ((this.isNum())
                                            ? (numOptions)
                                            : (this.isColor())
                                                ? (categoryOptions.slice(0, -1))
                                                : (categoryOptions))}
                                </select>
                            </td>
                            <td>
                                {(this.isFmt()) // add extra select element if param type is format
                                    ? (<select className="legalSelect" ref={(value) => { this.legalCategory = value }}>
                                        {legalOptions}
                                        </select>)
                                    : (<input list={param.id} type="text"
                                        ref={(text) => { this.inputParam = text }} />)
                                }
                                <datalist id={param.id}>
                                    {this.getOptions()}
                                </datalist>
                            </td>
                        <td><input type="button" className="btn btn-dark" value="ADD" onClick={this.checkInput.bind(this)} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
        );
    }
}

export default TableRow;