import React, { Component } from "react";
import { Store } from './Store'

export class ObservableComponent extends Component {
    
    componentDidMount() {
        Store.select('spanish.hola').subscribe( e => console.log(e));
    }
    render() {
        return(
        <h1>ObservableComponent</h1>
        )
    }
}