// main container for search results and pagination display

import React, { Component } from 'react';
import PropTypes from "prop-types";
import shortid from "shortid";
import UserCardList from './UserCardList';
import PageDisplay from './PageDisplay';
import CardTable from './CardTable';
import { callBackend } from './Funcs';

class Table extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isUser: false,
            cards: [],
            dragCard: [],
            currentPage: 1,
            visPages: [],
        }
    }

    static defaultProps = {
        firstDisplay: 1,
        lastDisplay: 13,
    }

    // receives this.state values from Searchview
    setData = (data, curPage) => {
        this.setState({
            isUser: data['isUser'],
            currentPage: curPage,
            cardTotal: data['cards'], 
            display: data['display'],
            cards: data['data'],
        }) 
    }

    // ajax fetch to Django for getting current page data
    getNewPage = (current) => {
        callBackend(`api/cards/pages/?page=${current}&sess=${sessionStorage.getItem('session')}`)
            .then(data => {
                this.setState({
                    display: data['display'],
                    cards: data['data'],
                });
            });
    }

    // sets range of visible pages, limited to 13
    visPages = (current) => {
        const { pages, firstDisplay, lastDisplay } = this.props;
        let firstPage = firstDisplay;
        let lastPage = lastDisplay;
        let newVis = [];
        // if less than 13 pages, last displayed will be highest available page
        if (pages <= lastDisplay) {
            lastPage = pages;
        }
        else {
            // set page range to (last page - 12) if current page is within 6 of last page
            if ((current + 6) >= pages) {
                firstPage = pages - 12;
                lastPage = pages;
            }
            // if current page is above 7, keep centered in pagination
            else if ((current + 6) > lastPage) {
                firstPage = current - 6;
                lastPage = current + 6;
            }
            
        }
        // build array of integers from lowest visible page to highest
        Array((lastPage+1) - firstPage).fill().map((_, i) => newVis.push(i + firstPage));

        this.setState({ visPages: newVis });
    }

    // receives currently dragged card from CardTable
    getCard = (dataFromChild) => this.setState({ dragCard: dataFromChild });

    // sets current page
    getCurrentPage = (page) => {
        this.setState({ currentPage: page });
        this.getNewPage(page);
        this.visPages(page);
    }

    // set top y poisiton of UserCardList
    setY = (newY) => {
        try {this.userCards.setTop(newY) }
        catch (err) { }
    }

    // redirects to specific card page if only one result from search
    goToCard = (card) => {
        window.location.href = "/card/" + card.card_id;
    };

    // render page numbers if more than one page
    getRenderedPages = (pages) => {
        if (pages > 1) {
            return (
                <PageDisplay thisPage={this.state.currentPage}
                    pages={this.state.visPages} totalPages={pages}
                    currentPage={this.getCurrentPage} />
            );
        }
    }

    render() {
        const { pages, y } = this.props;
        const { cards, display, cardTotal, currentPage, dragCard, isUser } = this.state

        return (
            (!cards.length)
                ? (<p>No Results.</p>)
                : ((cards.length == 1)
                    ? (this.goToCard(cards[0]))
                    : (<div>
                        <div id="containGrid" className="containGrid">

                            {this.getRenderedPages(pages)}

                            <div className="grid" id="grid">
                                <CardTable data={cards} display={display}
                                    page={currentPage} cardTotal={cardTotal}
                                    dragCard={this.getCard} />
                            </div>

                            {this.getRenderedPages(pages)}

                            {(isUser) && //render side bar if user is logged in
                                (<UserCardList y={y} hasShoe={true} dragCard={dragCard}
                                    ref={(child) => { this.userCards = child }} />)
                            }
                        </div>
                    </div>
            ))
        );
    }
}

export default Table;