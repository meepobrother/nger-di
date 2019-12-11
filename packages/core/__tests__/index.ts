import { Injector } from '../lib';
export class Demo1 {
    time: number = new Date().getTime() + Math.random()
}
export class Demo2 {
    time: number = new Date().getTime()
    constructor(public demo1: Demo1) { }
}
const injector = Injector.create([
    {
        provide: Demo1,
        deps: []
    },
    {
        provide: Demo2,
        deps: [
            Demo1
        ]
    }
]);

const demo1 = injector.get(Demo1)
const demo2 = injector.get(Demo2)
// true
const isEqual = demo2.demo1 === demo1;
debugger;