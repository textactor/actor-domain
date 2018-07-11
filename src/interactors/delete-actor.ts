
import { UseCase } from "@textactor/domain";
import { IActorRepository } from "./actor-repository";
import { IActorNameRepository } from "./actor-name-repository";

export class DeleteActor extends UseCase<string, boolean, void> {

    constructor(private actorRepository: IActorRepository, private nameRepository: IActorNameRepository) {
        super();
    }

    protected async innerExecute(actorId: string): Promise<boolean> {
        const names = await this.nameRepository.getNamesByActorId(actorId);
        for (let name of names) {
            await this.nameRepository.delete(name.id);
        }
        return this.actorRepository.delete(actorId);
    }
}