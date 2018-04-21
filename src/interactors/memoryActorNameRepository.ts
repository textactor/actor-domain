
import { RepUpdateData } from '@textactor/domain';
import { IActorNameRepository } from './actorNameRepository';
import { ActorName } from '../entities';


export class MemoryActorNameRepository implements IActorNameRepository {

    private db: Map<string, ActorName> = new Map()

    getNamesByActorId(actorId: string): Promise<ActorName[]> {
        const list: ActorName[] = [];
        for (let item of this.db.values()) {
            if (item.actorId === actorId) {
                list.push(item);
            }
        }
        return Promise.resolve(list);
    }

    addNames(names: ActorName[]): Promise<ActorName[]> {
        const list: ActorName[] = [];
        for (let name of names) {
            if (!this.db.has(name.id)) {
                name = { ...{ createdAt: Date.now() }, ...name };
                list.push(name);
                this.db.set(name.id, name);
            }
        }

        return Promise.resolve(list);
    }

    getById(id: string): Promise<ActorName> {
        return Promise.resolve(this.db.get(id));
    }

    getByIds(ids: string[]): Promise<ActorName[]> {
        const list: ActorName[] = [];
        for (let id of ids) {
            const item = this.db.get(id);
            if (item) {
                list.push(item);
            }
        }
        return Promise.resolve(list);
    }

    exists(id: string): Promise<boolean> {
        return Promise.resolve(this.db.has(id));
    }

    delete(id: string): Promise<boolean> {
        return Promise.resolve(this.db.delete(id));
    }

    create(data: ActorName): Promise<ActorName> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, { ...{ createdAt: Date.now() }, ...data });

        return this.getById(data.id);
    }

    update(data: RepUpdateData<ActorName>): Promise<ActorName> {
        const item = this.db.get(data.item.id);
        if (!item) {
            return Promise.reject(new Error(`Item not found! id=${data.item.id}`));
        }

        for (let prop in data.item) {
            (<any>item)[prop] = (<any>data.item)[prop]
        }

        if (data.delete) {
            for (let prop of data.delete) {
                delete (<any>item)[prop];
            }
        }

        return Promise.resolve(item);
    }
}
