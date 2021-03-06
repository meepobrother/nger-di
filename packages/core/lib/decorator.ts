import { Type } from "./type";
import { createClassDecorator, createParameterDecorator, IParameterDecorator, IConstructorDecorator, createDecorator } from "@nger/decorator";

export const InjectableMetadataKey = `InjectableMetadataKey`;
export interface InjectableOptions {
    providedIn?: Type<any> | 'root' | 'platform' | 'any' | null | string;
    factory?: Function;
    deps?: any[];
}
export const Injectable = createClassDecorator<InjectableOptions>(InjectableMetadataKey);

/**
 * inject
 */
export const InjectMetadataKey = `InjectMetadataKey`;
export interface InjectOptions {
    token: any;
}
function isInjectOptions(opt: any): opt is InjectOptions {
    return opt && !!opt.token;
}
export const Inject = createDecorator<InjectOptions | any, InjectOptions>(InjectMetadataKey, (item: IParameterDecorator<any, InjectOptions> | IConstructorDecorator<any, InjectOptions>) => {
    if (item.options) {
        if (isInjectOptions(item.options)) {
            item.options = {
                token: item.parameterType,
                ...item.options
            }
        } else {
            item.options = {
                token: item.options
            }
        }
    } else {
        item.options = {
            token: item.parameterType
        }
    }
});

/**
 * 可空
 */
export const OptionalMetadataKey = `OptionalMetadataKey`;
export interface OptionalOptions { }
export const Optional = createParameterDecorator<OptionalOptions>(OptionalMetadataKey);

/**
 * 自己
 */
export const SelfMetadataKey = `SelfMetadataKey`;
export interface SelfOptions { }
export const Self = createParameterDecorator<SelfOptions>(SelfMetadataKey);

/**
 * 忽略自己
 */
export const SkipSelfMetadataKey = `SkipSelfMetadataKey`;
export interface SkipSelfOptions { }
export const SkipSelf = createParameterDecorator<SkipSelfOptions>(SkipSelfMetadataKey);
