import { rootInjector, Injectable, INJECTOR_SCOPE, InjectionToken } from '../lib';
@Injectable({
    providedIn: 'root'
})
export class Demo1 {
    time: number = new Date().getTime() + Math.random();
    title: string;
}

@Injectable({
    providedIn: 'platform'
})
export class Demo2 {
    time: number = new Date().getTime() + Math.random();
    title: string;
}
const token = new InjectionToken(`token`)
const inejctor = rootInjector.create([{ provide: INJECTOR_SCOPE, useValue: 'platform' }, { provide: token, useValue: 1, multi: true }])
const appModuleInjector = inejctor.create([{ provide: token, useValue: 2, multi: true }, { provide: token, useValue: 3, multi: true }], 'AppModule')
debugger;
const tokens = appModuleInjector.get(token)
debugger;