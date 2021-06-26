import React, { Component } from 'react';
import logo from './logo.svg';
import MyDiagram from './Components/MyDiagram';
import './App.css';
import {GoDiagram} from "./Components/diagram";

class App extends Component {
    render() {
        return (
            <div className="App">
             
                <GoDiagram />
            </div>
        );
    }
}

export default App;
