// container component for hiding/viewing advanced search table

import React, { Component } from 'react';
import { Collapse } from 'react-collapse';
import PropTypes from 'prop-types';
import AdvSearch from './AdvSearch';
import shortid from "shortid";

class Toggle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpened: false,
            params: [],
            paramStrings: [],
        }

        this.handleClick = this.handleClick.bind(this);
    }

    // closes the table
    setClosed = () => {
        this.setState({
            isOpened: false,
        })
    }

    // clears parameters and removes all param labels
    reset = () => {
        this.setState({
            params: [],
            paramString: []
        });
        this.advSearch.reset();
        let paramDiv = this.paramDiv
        while (paramDiv.firstChild) {
            paramDiv.removeChild(paramDiv.firstChild);
        }
    }

    // receives parameters from AdvSearch and passes it to SearchView
    setParams = (params) => this.props.setParams(params);

    // receives parameterString from AdvSearch, appends it to state
    getPString = (pString) => {    
        let newArray = this.state.paramStrings;
        newArray.push(pString);
        this.setState({
            paramStrings: newArray,
        });
        this.props.clearButton(false); // show clear button
    }

    // removes a specific parameter
    removeParam = (e, param) => {
        e.preventDefault();
        this.advSearch.removeParam(param);
        var label = document.getElementById(param.id + param.text);
        label.remove();
        if (!this.paramDiv.firstChild) this.props.clearButton(true); // hide clear button if no parameters
    }

    setExclude = (excludeFromChild) => this.props.setExclude(excludeFromChild);

    // sets AdvSearch to visible or hidden
    handleClick = () => {
        let tempBool = this.state.isOpened;
        this.setState({
            isOpened: !tempBool
        });

        this.setTop(tempBool);
    }

    // passes up y location to parent for sidebar positioning
    setTop(tempBool) {
        let container = document.getElementById("containGrid");
        if (container && !tempBool) {
            this.props.y(670);
        }
        else if (container) {
            setTimeout(() => {
                this.props.y(290);
            }, 290); // setTimeout to wait for table collapse animation
        }
    }

    // iterates over paramString array and creates parameter labels
    makeLabels = (paramString) => {
        let paramArray = [];
        paramString.map((param) => {
            paramArray.push(
                <label id={param.id + param.text} className="paramText" key={param.id + param.text}>
                    {param.string}
                    <a href="javascript:void(0)">
                        <span className="octicon octicon-x" onClick={(e) => this.removeParam(e, param)} style={{ color: 'red' }}></span>
                    </a>
                    ,
                </label>
            );
        })
        
        return paramArray
    }

    render() {
        const { isOpened, paramStrings } = this.state;
        
        return (
            <div style={{position: 'relative'}}>
                <button type="button" id="toggleButton" className="btn btn-secondary" onClick={this.handleClick}>
                    Advanced Search
                </button>
                <div id="paramDiv" ref={(param) => this.paramDiv = (param)}>
                    {this.makeLabels(paramStrings)}
                </div>
                <Collapse id="collapse" isOpened={isOpened}>
                    <AdvSearch ref={(child) => this.advSearch = child} setExclude={this.setExclude}
                        setParams={this.setParams} paramString={this.getPString} />
                </Collapse>
            </div>
        );
    }
}

export default Toggle;
