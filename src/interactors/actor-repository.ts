
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { Actor } from '../entities';

export interface IActorWriteRepository extends IWriteRepository<string, Actor> {

}

export interface IActorReadRepository extends IReadRepository<string, Actor> {
    
}

export interface IActorRepository extends IActorReadRepository, IActorWriteRepository {

}
