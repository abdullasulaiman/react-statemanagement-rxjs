import React, { Component } from 'react'

import { subscriber } from './rxjs-utils/messageService';

class ConsumerA extends Component {
    constructor(props) {
        super(props)
        this.state = {
            counter: 0
        }
    }

    componentDidMount() {
        subscriber.subscribe((v) => {
            this.setState({ counter: v })
        })
    }

    render() {
        let { counter } = this.state;
        return(
            <div>
                <hr />
                <h3>Counter for Consumer A</h3>
                <div>Counter: { counter } </div>
            </div>
        )
    }
}

export { ConsumerA }