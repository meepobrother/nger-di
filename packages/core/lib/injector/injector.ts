import { Type, InjectFlags, Provider, StaticProvider } from "../type";
import { InjectionToken } from '../injection_token'
export interface Abstract<T> extends Function {
    prototype: T;
}
export type ITokenString<T> = string & {
    target: T
}
export type ITokenAny<T> = (number | string | object | Function | Array<any>) & {
    target?: T;
}
export type IToken<T> =
    Type<T> |
    Abstract<T> |
    InjectionToken<T> |
    ITokenString<T> |
    ITokenAny<T>;

export interface DependencyRecord {
    token: any;
    options: number;
}
export interface Record {
    fn: Function;
    useNew: boolean;
    deps: DependencyRecord[];
    value: any;
    noCache: boolean;
}
export abstract class Injector {
    scope: 'null' | 'top' | 'platform' | 'root' | string | any | null;
    source: string | null;
    parent: Injector | undefined;
    abstract get<T>(token: IToken<T>, notFoundValue?: T | undefined | null, flags?: InjectFlags): T;
    abstract getInjector(scope: string): Injector;
    abstract getRecords(): Map<any, Record>;
    abstract setProvider(providers: Provider[]): void;
    abstract setStatic(records: StaticProvider[]): void;
    abstract toString(): string;
    abstract getRecord(token: any): Record | undefined;
    abstract setRecord(token: any, record: Record): void;
    abstract create(records: StaticProvider[], source?: string): Injector;
}
