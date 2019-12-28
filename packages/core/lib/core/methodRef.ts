import { ParameterHandler } from './types';
import { Injector } from '../injector_ng';
import { IMethodDecorator } from '@nger/decorator'
export class MethodRef<T, O>{
    instance: T;
    metadata: IMethodDecorator<T, O>;
    options: O;
    injector: Injector
    constructor(metadata: IMethodDecorator<T, O>, injector: Injector) {
        this.metadata = metadata;
        this.injector = injector.create([], metadata.property as string)
        if (metadata.metadataKey) {
            const handler = this.injector.get<any>(metadata.metadataKey)
            if (handler) handler(this)
        }
        if (this.metadata.options) this.options = this.metadata.options;
    }
    call(injector: Injector, ...args: any[]) {
        injector.getRecords().forEach((it, key) => {
            this.injector.setRecord(key, it)
        });
        this.instance = this.instance || this.injector.get(this.metadata.type);
        const call = Reflect.get(this.instance as any, this.metadata.property)
        let length = this.metadata.paramTypes.length > args.length ? this.metadata.paramTypes.length : args.length;
        const parameters = new Array(length).fill(undefined);
        this.metadata.parameters.map(it => {
            const handler = this.injector.get<ParameterHandler>(it.metadataKey, undefined)
            if (handler) handler(call, parameters, this.instance, this.injector, it)
        });
        const pars = parameters.map((it, index) => {
            return Reflect.get(args, index) || it;
        });
        if (call) return call.bind(...pars)
    }
}