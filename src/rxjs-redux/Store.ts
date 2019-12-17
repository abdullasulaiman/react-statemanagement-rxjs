import { Subject, Observable, pipe } from "rxjs";
import { map, scan, shareReplay, distinctUntilChanged } from "rxjs/operators";
import { get, isEqual } from "lodash";

class Action {
  constructor(public type: string, public payload?: any) {}
}

class StoreState {
  state: Observable<any>;
  actions: Subject<Action> = new Subject();

  constructor() {
    this.state = this.actions.pipe(reducer(), shareReplay(1));
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
    distinctUntilChanged(isEqual)
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
    return next;
  }, {});
};

let Store = new StoreState();

export { Store, Action };
