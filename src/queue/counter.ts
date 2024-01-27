import { BehaviorSubject, scan } from "rxjs";

export class Counter {
  private readonly counter$ = new BehaviorSubject(0);

  asObservable() {
    return this.counter$.pipe(
      scan((prev, next) => prev + next, 0),
    );
  }

  set(newValue: number) {
    this.counter$.next(newValue);
  }

  increment() {
    this.counter$.next(1);
  }

  decrement() {
    this.counter$.next(-1);
  }
}
