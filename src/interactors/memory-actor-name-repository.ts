
import { RepositoryUpdateData } from '@textactor/domain';
import { ActorNameRepository } from './actor-name-repository';
import { ActorName } from '../entities/actor-name';


export class MemoryActorNameRepository implements ActorNameRepository {
    private db: Map<string, ActorName> = new Map()

    async deleteStorage() {
        this.db.clear();
    }
    async createStorage() {

    }

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

    getById(id: string): Promise<ActorName | null> {
        return Promise.resolve(this.db.get(id) || null);
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
        data = { ...{ createdAt: Date.now() }, ...data };
        this.db.set(data.id, data);

        return Promise.resolve(data);
    }

    update(data: RepositoryUpdateData<ActorName>): Promise<ActorName> {
        const item = this.db.get(data.id);
        if (!item) {
            return Promise.reject(new Error(`Item not found! id=${data.id}`));
        }

        if (data.set) {
            for (let prop in data.set) {
                (<any>item)[prop] = (<any>data.set)[prop]
            }
        }

        if (data.delete) {
            for (let prop of data.delete) {
                delete (<any>item)[prop];
            }
        }

        return Promise.resolve(item);
    }

    all(): Promise<ActorName[]> {
        const array: ActorName[] = []
        for (let item of this.db.values()) {
            array.push(item);
        }

        return Promise.resolve(array);
    }
}
