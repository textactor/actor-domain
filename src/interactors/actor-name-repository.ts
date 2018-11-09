import { Repository } from "@textactor/domain";
import { ActorName } from "../entities/actor-name";



export interface ActorNameRepository extends Repository<ActorName> {
    getNamesByActorId(actorId: string): Promise<ActorName[]>
    addNames(names: ActorName[]): Promise<ActorName[]>
}
