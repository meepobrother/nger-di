import { StaticInjector } from "./injector_ng";
import { INJECTOR_SCOPE } from "./scope";
import { PLATFORM_ID } from "./injector";
import { GET_INGER_DECORATOR } from "./providerToStaticProvider";
import { getINgerDecorator } from "@nger/decorator";

export const topInjector = new StaticInjector([{
    provide: INJECTOR_SCOPE,
    useValue: 'top'
}, {
    provide: PLATFORM_ID,
    useValue: `unknown`
}, {
    provide: GET_INGER_DECORATOR,
    useValue: getINgerDecorator
}])
