import { UseCase } from "@textactor/domain";
import { ActorRepository } from "./actor-repository";
import { ActorNameRepository } from "./actor-name-repository";

export class DeleteActor extends UseCase<string, boolean, void> {
  constructor(
    private actorRepository: ActorRepository,
    private nameRepository: ActorNameRepository
  ) {
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
