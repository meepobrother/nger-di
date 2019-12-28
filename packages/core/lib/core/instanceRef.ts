import { Injector } from '../injector_ng';
import { MethodRef } from './methodRef';
import { ProtoRef } from './protoRef';
import { INgerDecorator } from '@nger/decorator'
export class InstanceRef<T> {
    properties: ProtoRef<T, any>[] = [];
    methods: MethodRef<T, any>[] = [];
    injector: Injector;
    constructor(nger: INgerDecorator<T, any>, injector: Injector) {
        this.injector = this.injector;
        this.properties = nger.properties.map(it => new ProtoRef(it, this.injector))
        this.methods = nger.methods.map(it => new MethodRef(it, this.injector))
    }
    get(property: any) {
        return this.properties.find(it => it.metadata.property === property)
            || this.methods.find(it => it.metadata.property === property)
    }
}
