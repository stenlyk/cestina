import React from "react";

export default class CircleGraph extends React.Component {
  render() {
    return (
      <svg
        className="circle-chart"
        viewBox="0 0 33.83098862 33.83098862"
        width="70"
        height="70"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8ac5ff" />
            <stop offset="100%" stopColor="#006eda" />
          </linearGradient>
        </defs>
        <circle
          className="circle-chart__background"
          stroke="#efefef"
          strokeWidth="2"
          fill="none"
          cx="16.91549431"
          cy="16.91549431"
          r="13.91549431"
        />
        <circle
          className="circle-chart__circle"
          strokeWidth="3"
          stroke="url(#linear)"
          strokeDasharray={this.props.percent + ",100"}
          strokeLinecap="round"
          fill="none"
          cx="16.91549431"
          cy="16.91549431"
          r="13.91549431"
        />
        <g className="circle-chart__info">
          <text
            className="circle-chart__percent"
            x="16.91549431"
            y="15.5"
            alignmentBaseline="central"
            textAnchor="middle"
            fontSize="8"
          >
            {this.props.label}
          </text>
        </g>
      </svg>
    );
  }
}
