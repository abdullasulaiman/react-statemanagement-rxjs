import { Subject, Observable, pipe } from "rxjs";
import { map, scan, shareReplay, distinctUntilChanged } from "rxjs/operators";
import { get, isEqual } from "lodash";

/** add to redux dev tools */
const win = window as any;

/** Base Action Base to create new action Object
 *  Can be interface if required
 */ 
class Action {
  constructor(public type: string, public payload?: any) {}
}

/** Basic Store Implementation */
class StoreState {
  state: Observable<any>;
  actions: Subject<Action> = new Subject();

  constructor() {
    this.state = this.actions.pipe(reducer(), shareReplay(1));

    // Redux Dev Tools. This we can customize based on environment
    win.devTools = win.__REDUX_DEVTOOLS_EXTENSION__.connect();
  }

  dispatch(action: Action) {
    this.actions.next(action);
  }

  select(path: string) {
    return this.state.pipe(slice(path));
  }
}

export const slice = (path: string) =>
  pipe(
    map(state => get(state, path, null)),
    distinctUntilChanged(isEqual) // Rxjs Operator used to Only emit when the current value is different than the last.
  );

export const reducer = () => {
  return scan<any>((state, action) => {
    let next;
    switch (action.type) {
      case "SET":
        next = action.payload;
        break;
      case "UPDATE":
        next = { ...state, ...action.payload };
        break;
      default:
        next = state;
        break;
    }
    // This sends out a signal to redux dev tools to show the actions flow
    win.devTools.send(action.type, next);
    return next;
  }, {});
};

let Store = new StoreState();

export { Store, Action };
