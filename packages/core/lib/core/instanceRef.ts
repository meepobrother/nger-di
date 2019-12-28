import { Injector } from '../injector_ng';
import { INgerDecorator } from '@nger/decorator'
import { ParameterHandler } from './types';
import { IMethodDecorator } from '@nger/decorator'

import { InjectFlags } from './../type';
import { PropertyHandler } from './types';
import { IPropertyDecorator } from '@nger/decorator'

export class ProtoRef<T, O>{
    metadata: IPropertyDecorator<T, O>;
    options: O;
    injector: Injector;
    handler: any;
    parent: InstanceRef<T>;
    constructor(metadata: IPropertyDecorator<T, O>, injector: Injector, parent: InstanceRef<T>) {
        this.injector = injector.create([], metadata.property as string);
        this.metadata = metadata;
        this.parent = parent;
        if (this.metadata.options) this.options = this.metadata.options;
        this.handler = injector.get<PropertyHandler>(this.metadata.metadataKey!, null, InjectFlags.Optional);
    }
    call(injector: Injector, ...args: any[]) {
        injector.getRecords().forEach((it, key) => {
            this.injector.setRecord(key, it)
        });
        const instance = injector.get(this.metadata.type);
        const val = Reflect.get(instance, this.metadata.property)
        this.handler && this.handler(val, instance, this);
        return Reflect.get(instance, this.metadata.property)
    }
}
export class MethodRef<T, O>{
    instance: T;
    metadata: IMethodDecorator<T, O>;
    options: O;
    injector: Injector
    parent: InstanceRef<T>;
    constructor(metadata: IMethodDecorator<T, O>, injector: Injector, parent: InstanceRef<T>) {
        this.metadata = metadata;
        this.parent = parent;
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

export class InstanceRef<T> {
    properties: ProtoRef<T, any>[] = [];
    methods: MethodRef<T, any>[] = [];
    injector: Injector;
    constructor(nger: INgerDecorator<T, any>, injector: Injector) {
        this.injector = injector;
        this.properties = nger.properties.map(it => new ProtoRef(it, this.injector, this))
        this.methods = nger.methods.map(it => new MethodRef(it, this.injector, this))
    }
    get(property: any) {
        return this.properties.find(it => it.metadata.property === property)
            || this.methods.find(it => it.metadata.property === property)
    }
}
