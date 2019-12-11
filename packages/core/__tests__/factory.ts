import { Injector, InjectFlags } from '../lib';
export class Demo1 {
    time: number = new Date().getTime() + Math.random();
    title: string;
    constructor(title: string) {
        this.title = title;
    }
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
            return new Demo1(`injector0`);
        }
    }
]);

const injector2 = Injector.create([{
    provide: Demo1,
    useFactory: () => {
        return new Demo1(`injector2`);
    }
}, {
    provide: Demo2,
    deps: [
        [InjectFlags.SkipSelf, InjectFlags.Optional, Demo1]
    ]
}], injector)

const demo3 = injector2.get(Demo2)
// true
const isEqual = demo3.demo1 === injector.get(Demo1)
debugger;