import { Injector, InjectFlags } from '../lib';
export class Demo1 {
    time: number = new Date().getTime() + Math.random()
}
export class Demo2 {
    time: number = new Date().getTime()
    constructor(public demo1: Demo1) { }
}
// ConstructorProvider
const injector = Injector.create([
    {
        provide: Demo1,
        useFactory: () => {
            return new Demo1();
        }
    }
]);

const injector2 = Injector.create([{
    provide: Demo1,
    useFactory: () => {
        return new Demo1();
    }
}, {
    provide: Demo2,
    deps: [
        [Demo1, InjectFlags.SkipSelf]
    ]
}], injector)

const demo1 = injector2.get(Demo1, undefined, InjectFlags.SkipSelf)
const demo2 = injector.get(Demo1)
const demo3 = injector.get(Demo2)

// true
const isEqual = demo2 === demo1;
debugger;