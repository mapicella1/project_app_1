// renders pie chart within UserCardList for symbol distribution

import React, { Component } from 'react';
import PropTypes from "prop-types";
import shortid from "shortid";
import { Pie } from 'react-chartjs-2';

class PieChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartData: [],
        }
    }

    // set graph data in state
    setData = (data) => this.setState({ chartData: data });

    render() {
        return (
            <Pie height='100' width='100'
                data={{
                    labels: ['Red', 'Blue', 'Green', 'White', 'Black'],
                    datasets: [{
                        label: 'colors',
                        data: this.state.chartData,
                        backgroundColor: [
                            'red',
                            'blue',
                            'green',
                            'white',
                            'black',
                        ],
                        hoverBorderWidth: 2,
                        hoverBorderColor: 'black',
                    }],
                }} 
                options={{
                    maintainAspectRatio: false,
                    responsive: false,
                    title: {
                        display: false,
                        text: 'Mana Distribution',
                        fontSize: 25,
                        fontColor: 'black',
                        padding: 20,
                    },
                    legend: {
                        display: this.props.displayLegend,
                        position: this.props.legendPosition,
                        labels: {
                            fontColor: 'black',
                        }
                    },
                }}
            />
        );
    }
}

export default PieChart;