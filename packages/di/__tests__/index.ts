import { Injectable, Inject, createInjector, INJECTOR_SCOPE } from '@nger/di';
import { initNgDevMode } from '@nger/di.util';
initNgDevMode();

@Injectable({
    providedIn: 'root'
})
export class Demo2 { }

@Injectable({
    providedIn: 'root'
})
export class Demo3 {
    constructor(@Inject(Demo2) public d2: Demo2) { }
}

@Injectable({
    providedIn: 'root'
})
export class Demo {
    constructor(public d2: Demo2, public d3: Demo3) { }
}

const injector = createInjector({
    ɵinj: {
        factory: () => 'root'
    }
}, null, [{
    provide: Demo,
    useClass: Demo,
    deps: []
}], 'root')

const demo = injector.get(Demo);
debugger;
