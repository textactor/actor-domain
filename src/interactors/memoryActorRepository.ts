
import { RepUpdateData } from '@textactor/domain';
import { IActorRepository } from './actorRepository';
import { Actor } from '../entities';


export class MemoryActorRepository implements IActorRepository {
    private db: Map<string, Actor> = new Map()

    getById(id: string): Promise<Actor> {
        return Promise.resolve(this.db.get(id));
    }

    getByIds(ids: string[]): Promise<Actor[]> {
        const list: Actor[] = [];
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

    create(data: Actor): Promise<Actor> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, { ...{ createdAt: Date.now() }, ...data });

        return this.getById(data.id);
    }

    update(data: RepUpdateData<Actor>): Promise<Actor> {
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
