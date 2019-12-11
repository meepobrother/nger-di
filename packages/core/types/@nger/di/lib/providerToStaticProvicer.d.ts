import { StaticProvider, Provider } from "./type";
import { INgerDecorator } from '@nger/decorator';
export declare function providerToStaticProvider(provider: Provider): StaticProvider;
export declare function getClassInjectDeps(nger: INgerDecorator): any[];
