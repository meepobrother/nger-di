import { ClassHandler } from './types';
import { INJECTOR_SCOPE } from './../scope';
import { Injector } from '../injector_ng';
import { MethodRef } from './methodRef';
import { ProtoRef } from './protoRef';
import { INgerDecorator } from '@nger/decorator'
export class InstanceRef<T> {
    properties: ProtoRef<T, any>[] = [];
    methods: MethodRef<T, any>[] = [];
    injector: Injector;
    constructor(nger: INgerDecorator<T, any>, injector: Injector) {
        this.injector = this.injector.create([{
            provide: INJECTOR_SCOPE,
            useValue: nger.type
        }], nger.type.name)
        nger.classes.map(it => {
            const handler = injector.get<ClassHandler>(it.metadataKey, null)
            if (handler) handler(injector, it)
        });
        this.properties = nger.properties.map(it => new ProtoRef(it, this.injector))
        this.methods = nger.methods.map(it => new MethodRef(it, this.injector))
    }
    get(property: any) {
        return this.properties.find(it => it.metadata.property === property)
            || this.methods.find(it => it.metadata.property === property)
    }
}
