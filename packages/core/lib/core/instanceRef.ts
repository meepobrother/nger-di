import { InjectionToken } from './../injection_token';
import { Injector, INJECTOR, StaticInjector } from '../injector_ng';
import { INgerDecorator, IPropertyDecorator, IMethodDecorator, IClassDecorator } from '@nger/decorator'
import { ParameterHandler, PropertyHandler } from './types';
import { InjectFlags, StaticProvider } from './../type';
import { providerToStaticProvider } from '../providerToStaticProvider';
export const CURRENT_METHOD_REF = new InjectionToken<InstanceRef<any>>(`@nger/di CURRENT_METHOD_REF`)
export const CURRENT_PROTO_REF = new InjectionToken<InstanceRef<any>>(`@nger/di CURRENT_PROTO_REF`)
export const PARENT_REF = new InjectionToken<InstanceRef<any, any>>(`@nger/di PARENT_REF`)

export class ProtoRef<T, O>{
    metadata: IPropertyDecorator<T, O>;
    options: O;
    injector: Injector;
    handler: any;
    parent: InstanceRef<T>;
    constructor(metadata: IPropertyDecorator<T, O>, injector: Injector, parent: InstanceRef<T>) {
        this.injector = injector.create([{
            provide: PARENT_REF,
            useValue: parent
        }, {
            provide: CURRENT_PROTO_REF,
            useValue: this
        }], metadata.property as string);
        this.metadata = metadata;
        this.parent = parent;
        if (this.metadata.options) this.options = this.metadata.options;
        this.handler = injector.get<PropertyHandler>(this.metadata.metadataKey!, null, InjectFlags.Optional);
    }
    call(providers: StaticProvider[], ...args: any[]) {
        this.injector.setStatic(providers)
        const instance = this.injector.get(this.metadata.type);
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
        if (metadata.options) this.options = metadata.options;
        const staticProviders: StaticProvider[] = [];
        if (parent.metadata.options) {
            const providers = Reflect.get(parent.metadata.options as any, 'providers')
            if (Array.isArray(providers)) {
                staticProviders.push(...providers.map(it => providerToStaticProvider(it)))
            }
        }
        this.injector = injector;
        this.injector.setStatic([
            {
                provide: PARENT_REF,
                useValue: parent
            }, {
                provide: CURRENT_METHOD_REF,
                useValue: this
            },
            providerToStaticProvider(metadata.type),
            ...staticProviders
        ])

        if (metadata.metadataKey) {
            const handler = this.injector.get<any>(metadata.metadataKey)
            if (handler) handler(this)
        }
        if (this.metadata.options) this.options = this.metadata.options;
    }
    call(providers: StaticProvider[], ...args: any[]) {
        this.injector.setStatic(providers)
        this.instance = this.instance || this.injector.get(this.metadata.type);
        this.parent.properties.map(it => {
            const handler = this.injector.get<PropertyHandler>(this.metadata.metadataKey!, null, InjectFlags.Optional);
            const val = Reflect.get(this.instance as any, this.metadata.property)
            handler && handler(val, this.instance, this.injector, it.metadata);
            const property = Reflect.get(this.instance as any, this.metadata.property)
            Reflect.set(this.instance as any, it.metadata.property, property)
        })
        const call = Reflect.get(this.instance as any, this.metadata.property);
        let length = this.metadata.paramTypes.length > args.length ? this.metadata.paramTypes.length : args.length;
        const parameters = new Array(length).fill(undefined);
        this.metadata.parameters.map(it => {
            const handler = this.injector.get<ParameterHandler>(it.metadataKey, undefined)
            if (handler) handler(call, parameters, this.instance, this.injector, it)
        });
        const pars = parameters.map((it, index) => {
            return Reflect.get(args, index) || it;
        });
        if (call) return call.bind(this.instance)(...pars)
    }
}

export class InstanceRef<T = any, O = any> {
    properties: ProtoRef<T, any>[] = [];
    methods: MethodRef<T, any>[] = [];
    injector: Injector;
    metadata: IClassDecorator<T, O>;
    constructor(nger: INgerDecorator<T, any>, metadata: IClassDecorator<T, O>, injector: Injector) {
        this.injector = injector;
        this.metadata = metadata;
        this.properties = nger.properties.map(it => new ProtoRef(it, this.injector, this))
        this.methods = nger.methods.map(it => new MethodRef(it, this.injector, this))
    }
    get(property: any) {
        return this.properties.find(it => it.metadata.property === property)
            || this.methods.find(it => it.metadata.property === property)
    }
}
