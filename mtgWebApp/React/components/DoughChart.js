// renders doughnut chart for land count within deck

import React, { Component } from 'react';
import PropTypes from "prop-types";
import shortid from "shortid";
import { Doughnut } from 'react-chartjs-2';

class DoughChart extends Component {
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
            <Doughnut height='190' width='190'
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
                    responsive: false,
                    title: {
                        display: true,
                        text: ['Lands: ' + this.props.lands, 'Mana Symbols: ' + this.props.symbols],
                        fontSize: 12,
                        fontColor: 'black',
                    },
                    tooltips: {
                        enabled: false,
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

export default DoughChart;