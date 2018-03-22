
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { ActorName } from '../entities';

export interface IActorNameWriteRepository extends IWriteRepository<string, ActorName> {
    addNames(names: ActorName[]): Promise<ActorName[]>
}

export interface IActorNameReadRepository extends IReadRepository<string, ActorName> {

}

export interface IActorNameRepository extends IActorNameReadRepository, IActorNameWriteRepository {

}
