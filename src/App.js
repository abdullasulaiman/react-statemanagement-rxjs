import React, { Fragment, Component } from 'react';
import './App.css';
// import { ConsumerA } from './Components' 
// import { subscriber } from './rxjs-utils/messageService';
import { Store, Action } from './rxjs-redux/Store'
import { ObservableComponent } from './rxjs-redux/ObservableComponent';

class App extends Component {

  handleSet() {
    Store.dispatch(new Action('SET', { hello: 'world' }))
  }

  handleUpdate() {
    Store.dispatch(new Action('UPDATE', { spanish: { hola: 'mundo' } }));
  }

  render() {
    return (
      <Fragment>
        <button onClick={this.handleSet}>Set</button>
        <button onClick={this.handleUpdate}>Update</button>
        <ObservableComponent />
      </Fragment>
    );
  }
}

export default App;
