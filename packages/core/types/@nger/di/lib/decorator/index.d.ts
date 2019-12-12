import { Provider, Type, ModuleWithProviders } from '../type';
/**
 * Module
 */
export declare const ModuleMetadataKey = "ModuleMetadataKey";
export interface ModuleOptions {
    id?: any;
    providers?: (Provider[] | Provider)[];
    imports?: Array<Type<any> | ModuleWithProviders<any>>;
    exports?: Array<any>;
    bootstrap?: Array<Type<any>>;
}
export declare const Module: (opts?: ModuleOptions | undefined) => ClassDecorator;
export declare const NgModule: (opts?: ModuleOptions | undefined) => ClassDecorator;
/**
 * 可注入的
 */
export declare const InjectableMetadataKey = "InjectableMetadataKey";
export interface InjectableOptions {
    providedIn?: Type<any> | 'root' | null;
}
export declare const Injectable: (opts?: InjectableOptions | undefined) => ClassDecorator;
/**
 * inject
 */
export declare const InjectMetadataKey = "InjectMetadataKey";
export interface InjectOptions {
    token: any;
}
export declare const Inject: (opt?: InjectOptions | undefined) => ParameterDecorator;
/**
 * 可空
 */
export declare const OptionalMetadataKey = "OptionalMetadataKey";
export interface OptionalOptions {
}
export declare const Optional: (opt?: OptionalOptions | undefined) => ParameterDecorator;
/**
 * 自己
 */
export declare const SelfMetadataKey = "SelfMetadataKey";
export interface SelfOptions {
}
export declare const Self: (opt?: SelfOptions | undefined) => ParameterDecorator;
/**
 * 忽略自己
 */
export declare const SkipSelfMetadataKey = "SkipSelfMetadataKey";
export interface SkipSelfOptions {
}
export declare const SkipSelf: (opt?: SkipSelfOptions | undefined) => ParameterDecorator;
