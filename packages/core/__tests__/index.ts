// import { Injector } from '../lib';
// import { } from 'typescript';
// export class Demo1 {
//     time: number = new Date().getTime() + Math.random()
// }
// export class Demo2 {
//     time: number = new Date().getTime()
//     constructor(public demo1: Demo1) { }
// }
// // ConstructorProvider
// const injector = Injector.create([
//     {
//         provide: Demo1
//     },
//     {
//         provide: Demo2,
//         deps: [
//             Demo1
//         ]
//     }
// ]);

// const demo1 = injector.get(Demo1)
// const demo2 = injector.get(Demo2)
// // true
// const isEqual = demo2.demo1 === demo1;

const a: never | { b: { c: number } } = {} as any;
function add(a?: any) {
    console.log({
        a
    })
}
add(a?.b?.c);

