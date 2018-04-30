// main app container for search results
// wrapped in div on Home.html

import React, { Component } from 'react';
import ReactDOM from "react-dom";
import SearchView from './SearchView';

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        return (
            <SearchView />
        );
    }
}

export default App;

const wrapper = document.getElementById('app');
wrapper ? ReactDOM.render(<App />, wrapper) : null;