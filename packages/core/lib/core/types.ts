import { IParameterDecorator } from '@nger/decorator';
import { IPropertyDecorator, IClassDecorator, IMethodDecorator } from '@nger/decorator';
import { Injector } from '../injector';
export interface ParameterHandler<T = any, O = any> {
    (handler: Function, parameters: Array<any>, instance: T, injector: Injector, parameter: IParameterDecorator<T, O>): void;
}
export interface PropertyHandler<T = any, O = any> {
    (value: any, instance: T, injector: Injector, parameter: IPropertyDecorator<T, O>): void;
}
export interface MethodHandler<T = any, O = any> {
    (handler: Function, instance: T, injector: Injector, parameter: IMethodDecorator<T, O>): void;
}
export interface ClassHandler<T = any, O = any> {
    (injector: Injector, parameter: IClassDecorator<T, O>): void;
}