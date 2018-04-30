// render pagination

import React, { Component } from 'react';
import shortid from 'shortid';
class PageDisplay extends Component {
    constructor(props) {
        super(props)
    }

    // sets newly clicked page
    setPage = (ev, page) => {
        ev.preventDefault();
        let thisPage = document.getElementById("page" + page);
        sessionStorage.setItem('page', page);
        this.props.currentPage(page);
    }
   
    render() {
        const { pages, totalPages, thisPage } = this.props

        // builds visible pages, sets current page from Table to active
        const pageNums = pages.map((page) => (
            (page == thisPage) ? (
                <a key={shortid.generate()} className="btn btn-outline-dark btn-sm active" id={"page" + page}
                        onClick={(e) => this.setPage(e, page)}>
                    {page}
                </a>
            ) : (
                    <a key={shortid.generate()} className="btn btn-outline-dark btn-sm" id={"page" + page}
                        onClick={(e) => this.setPage(e, page)}>
                    {page}
                </a>
            )));

        return (
            <div className="pages">
                {/* page buttons for first and last available pages */}
                <nav id="pageNav" className="btn-group btn-group">
                    <a className="btn btn-outline-dark btn-sm"
                            onClick={(e) => this.setPage(e, 1)} aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                        <span className="sr-only">Previous</span>
                    </a>
                    {pageNums}
                    <a className="btn btn-outline-dark btn-sm"
                            onClick={(e) => this.setPage(e, totalPages)} aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                        <span className="sr-only">Next</span>
                    </a>
                </nav>
            </div>
        );
    }
}

export default PageDisplay;