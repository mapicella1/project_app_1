// renders notification to user that their creation, addition, deletion request
// to database was successful or not

import React, { Component } from 'react';
import ReactDOM from "react-dom";

class SnackBar extends Component {
    constructor(props) {
        super(props)
        this.state = { snackBar: '' }
    }

    // set snackBar class and message
    setSnack = (name, cardState) => {
        this.setState({ snackBar: cardState });
        var snack = document.getElementById("snackbar");
        snack.className = name;
        setTimeout(function () { snack.className = snack.className.replace(name, ""); }, 3000);
    }

    render() {
        return (
            <div id="snackbar">{this.state.snackBar}</div>
        );
    }
}

export default SnackBar;