// secondary container within Table, creates grid 
// that each search result item will be nested within 

import React, { Component } from 'react';
import CardList from './CardList';


class CardTable extends Component {
    // passes currently dragged card from CardList to Table
    getCard = (dragCardFromChild) => this.props.dragCard(dragCardFromChild);

    render() {
        const { display, cardTotal, data } = this.props;

        return (
            <div>
                <h2 className="subtitle">

                    {/* number of currently displayed cards on the page */}
                    {`Showing ${display[0] + 1} - ${display[1]} out of `} <strong>{cardTotal} items</strong>

                </h2>
                <div className="searchResults">

                    {/* iterate currently displayed cards into CardList */}
                    {data.map((el) => (
                        <CardList key={el.card_id} dragCard={this.getCard} card={el} />
                    ))}

                    <hr />
                </div>
            </div>
        );
    }
}

export default CardTable;