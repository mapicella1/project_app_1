// builds hoverable image links for each card in deck.html

import React, { Component } from 'react';
import ReactDOM from "react-dom";
import Table from "./Table";
import Toggle from "./Toggle";
import { nameOptions } from './MetaData';
import { callBackend } from './Funcs';

class SearchView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            searchVal: '',
            params: [],
            paramString: '',
            y: 290,
            loaded: false,
            placeholder: "Loading...",
            pages: 0,
            cardTotal: 0,
            display: [],
            exclude: '',
        }
    }

    // receives parameters from Toggle
    setParams = (paramsFromChild) => this.setState({ params: paramsFromChild });

    // Clears all parameters, calls Toggle to clear all parameters
    clearParams = (e) => {
        e.preventDefault();
        this.checkBtn.hidden = true;
        this.toggle.reset();
        this.setState({
            params: [],
            paramString: '',
        });
    }

    // checks if session variable is set -> renders previous search when component mounts from session data
    componentDidMount() {
        if (sessionStorage.getItem('isSet')) {
            let data = JSON.parse(sessionStorage.getItem('data'))
            this.setState({
                loaded: true,
                y: 290,
                pages: data['pages'],
            }, () => {
                // calls to Table to load cards, sets page to last that was viewed
                this.table.setData(data, sessionStorage.getItem('page'))
                if (data['cards'] > 1) {
                    // calls Table to render pagination if more than one page
                    (sessionStorage.getItem('page') > 1)
                        ? (this.table.getCurrentPage(sessionStorage.getItem('page')))
                        : (this.table.visPages(1))
                }
            });
        }
    }

    setExclude = (excludeFromChild) => {
        let exclude = (excludeFromChild)
                        ? ('&exclude=true')
                        : ('')
        console.log(exclude);
        this.setState({
            exclude: exclude
        });
    }

    // builds query string parameters to be sent in ajax fetch url
    buildSearch() {
        let searchText = this.search.value;
        let newParam = '';
        this.setState({
            paramString: '',
            searchVal: searchText,
        })
        // if parameters, iterate over array and append non-empty params to url query string
        if (this.state.params.length) { 
            this.state.params.map(param => {
                if (param.text) newParam += param.url + param.text;
            });

            this.setState({
                paramString: newParam
            });
        }
        this.makeSearch(searchText, newParam, 1);
        this.search.value = '';
    }

    // sets session variables for return to search results
    setStorage = (page, session, data) => {
        sessionStorage.setItem('isSet', true)
        sessionStorage.setItem('page', page);
        sessionStorage.setItem('session', session)
        sessionStorage.setItem('data', JSON.stringify(data));
    }

    // ajax fetch to card search api ${exclude}
    makeSearch(search, params, page, exclude) {
        let checked = (this.exclude.checked) ? ('&exclude=true') : ('');
        let cardTotal;
        if (search || params) {
            callBackend(`api/cards/?page=${page}${checked}&search=${search}${params}`)
                .then(data => {
                    this.setStorage(page, data['session'], data)
                    this.setState({
                        loaded: true,
                        y: 290,
                        pages: data['pages'],
                    });
                    // call Table to load cards, set initial page to 1
                    this.table.setData(data, 1);
                    this.toggle.setClosed();
                    return data['cards'];
                }).then((cardTotal) => {
                    // calls Table to render pagination if more than one page
                    if (this.state.loaded && cardTotal > 1) {
                        (page > 1) ? (this.table.getCurrentPage(page)) : (this.table.visPages(1))
                    }
                });
            // setTimeout to wait for sidebar positioning after table collapse animation
            setTimeout(() => {
                this.setY(290);
            }, 290);
        }
    }

    // receives y position from Toggle
    getY = (yPosFromChild) => {
        this.setState({ y: yPosFromChild });
        this.setY(yPosFromChild);
    }

    // send y position to Table
    setY = (y) => { if (this.table) this.table.setY(y); }

    // set clear button to visible or hidden
    clearButton = (hide) => this.checkBtn.hidden = hide;

    // search on enter key pressed
    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.buildSearch();
            this.search.focus = false;
        }
    }

    render() {
        const { searchVal, pages, loaded, y } = this.state;
        return (
            <div>
                <div className="input-group mb-3">
                    <input list="cardNames" type="search" className="form-control" placeholder="Search Here"
                        ref={(input) => { this.search = input }} id="sb"
                        aria-label="Search Here" aria-describedby="basic-addon2" onKeyPress={(e) => this.handleKeyPress(e) }/>

                    <datalist id="cardNames">
                        {nameOptions}
                    </datalist>

                    <div className="input-group-append">
                        <button className="btn btn-primary" type="button"
                            onClick={this.buildSearch.bind(this)}>
                                Search
                        </button>
                    </div>                    
                </div>
                <div hidden ref={(checkBtn) => { this.checkBtn = (checkBtn) }}>
                    <button id="clearBtn" ref={(clear) => this.clearBtn = (clear)}
                        onClick={this.clearParams.bind(this)}
                        className="btn btn-danger">Clear</button>

                    <label className="colorCheck">
                        <input type="checkbox" tabIndex="0" data-toggle="tooltip"
                            ref={(exclude) => { this.exclude = (exclude) }}
                        id="colorExclude" title="Exclude Unselected" />
                        <span>
                            Exclude unselected Colors
                        </span>
                    </label>
                    
                </div>
                <Toggle ref={(child) => { this.toggle = child }} y={this.getY}
                    setParams={this.setParams} setExclude={this.setExclude}
                    clearButton={this.clearButton} />                

                {/* wait for loaded to be true before rendering results in Table*/}
                {(loaded) && (
                    <div>

                        {(searchVal.length > 0) && (<p>{'Search results for: ' + searchVal}</p>)}

                        <Table y={y} pages={pages}
                            ref={(table) => { this.table = table }} />

                    </div>
                )}
            </div>
        );
    }
}

export default SearchView;