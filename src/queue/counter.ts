import { BehaviorSubject, scan } from "rxjs";

export class Counter {
  private readonly value$ = new BehaviorSubject(0);

  asObservable() {
    return this.value$.pipe(scan((prev, next) => prev + next));
  }

  add(value: number) {
    this.value$.next(value);
  }

  increment() {
    this.value$.next(1);
  }

  decrement() {
    this.value$.next(-1);
  }
}
