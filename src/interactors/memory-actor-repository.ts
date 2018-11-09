
import { RepositoryUpdateData } from '@textactor/domain';
import { ActorRepository } from './actor-repository';
import { Actor } from '../entities/actor';


export class MemoryActorRepository implements ActorRepository {
    private db: Map<string, Actor> = new Map()

    async deleteStorage() {
        this.db.clear();
    }
    async createStorage() {

    }

    getById(id: string): Promise<Actor | null> {
        return Promise.resolve(this.db.get(id) || null);
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
        data = { ...{ createdAt: Date.now() }, ...data };
        this.db.set(data.id, data);

        return Promise.resolve(data);
    }

    update(data: RepositoryUpdateData<Actor>): Promise<Actor> {
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

    all(): Promise<Actor[]> {
        const array: Actor[] = []
        for (let item of this.db.values()) {
            array.push(item);
        }

        return Promise.resolve(array);
    }
}
