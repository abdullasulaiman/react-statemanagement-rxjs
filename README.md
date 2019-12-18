### To Run the project
yarn install  
yarn start

## Explaination

The premise is simple - Your application data is a single immutable object that can only be changed by dispatching actions. Let’s get started by generating a service / single instance to serve as our global state management tool in React

Our store service only has two properties, both of which are reactive streams of data - actions and state.

```
    export class Store {
        state: Observable<any>;
        actions: Subject<Action> = new Subject();
    }
```

### Action Stream

Let’s define an action class to standardize the way changes occur.

```
    export class Action {
        constructor(public type: string, public payload?: any) {}
    }
```

Actions signal a mutation to the state container and provide an optional data payload. It is the actions stream that determines the shape of the state.

### Reducing the State

The state listens to the action stream, then changes the current state object to the next state object. In order to facilitate this task, I am extracting this logic to a custom RxJS operator named reducer.

```
    export class Store {
     constructor() {
            this.state = this.actions.pipe(reducer());
}

```

The reducer itself is just a switch statement that builds the next state object based on the action that was dispatched to it. Think of this as your event handler - it’s a pure function so I’ve defined as a regular function outside of the Store class. I’ve included some code for your basic CRUD operations on an object.

```
    export const reducer = () =>
        scan<any>((state, action) => {
            let next;
            switch (action.type) {
            case 'SET':
                next = action.payload;
                break;
            case 'UPDATE':
                next = { ...state, ...action.payload };
                break;
            default:
                next = state;
                break;
            }

            return next;
        }, {});
```

### Dispatching Actions

Dispatching an action is easy because we’re using an RxJS Subject. We can push the next value into the stream by calling next.

```
    export class Store {
    
    ...

     dispatch(action: Action) {
        this.actions.next(action);
    }

}
```

### Selecting State

Selecting data is a little more complex than it seems on the surface. First of all, we need to observe a deep path from the source state object. Also, we only want this observable to emit data when the it’s scope of interest changes. To handle that magic, we combine the Rx distinctUntilChanged operator with the Lodash isEqual function to perform a deep object comparison.

```

import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { get, isEqual } from 'lodash';

export class Store {
  select(path: string) {
    return this.state.pipe(slice(path));
  }
}

export const slice = path =>
  pipe(
    map(state => get(state, path, null)),
    distinctUntilChanged(isEqual)
  );

```

Also, we want new subscribers to receive the last value. We can tell our source subject to save the last emitted value with shareReplay and pass 1 because we only need the most recent value to be cached.

```

export class Store {
  constructor() {
    this.state = this.actions.pipe(
      reducer(),
      shareReplay(1)
    );
}

```

### Components

We have now reached the glorious promised land of pure components, where we only (1) select state or (2) dispatch actions. Components like this are much easier to debug and test.

```

import React, { Fragment, Component } from 'react';
import './App.css';
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

```

### Adding it to Redux Dev Tools

One of the main reasons people like Redux this awesome browser extension called Redux Dev Tools for visualizing state. You probably think it’s hard to wire this thing up, right? Nope, it takes only a few lines of code because we already have the necessary data in our reducer function.


```
    const win = window as any;
    win.devTools = win.__REDUX_DEVTOOLS_EXTENSION__.connect();

    export const reducer = () =>
        scan((state, action) => {
        // ...omitted
        win.devTools.send(action.type, next);
        return next;
  }, {});

```

### It's a POC we can build on top of it ;) 
You have just implemented the hottest state management pattern in web development all by yourself. Now you can build on this to create a lean solution that works exactly the way you want it.