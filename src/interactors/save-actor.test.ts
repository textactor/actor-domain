import test from "ava";
import { MemoryActorRepository } from "./memory-actor-repository";
import { MemoryActorNameRepository } from "./memory-actor-name-repository";
import { SaveActor } from "./save-actor";
import { ActorNameType } from "../entities/actor-name";
import { BuildActorParams, ActorHelper } from "../entities/actor-helper";
import { ActorType } from "../entities/actor";

test("should save a new actor", async (t) => {
  const actorRepository = new MemoryActorRepository();
  const nameRepository = new MemoryActorNameRepository();

  const saveActor = new SaveActor(actorRepository, nameRepository);

  const actorData: BuildActorParams = {
    lang: "ro",
    country: "md",
    name: "Chișinău",
    names: ["Chișinău", "Chisinau", "chisinau", "Chișinăului"].map((name) => ({
      name,
      type: ActorNameType.WIKI,
      popularity: 1
    })),
    type: ActorType.PLACE,
    wikiEntity: {
      wikiDataId: "",
      name: "",
      wikiPageTitle: "",
      countLinks: 1,
      countryCodes: []
    }
  };

  const actor = ActorHelper.build(actorData);

  const savedActor = await saveActor.execute(actorData);

  t.not(actor.id, savedActor.id);
  t.is(actor.name, savedActor.name);

  const savedNames = await nameRepository.getNamesByActorId(savedActor.id);
  // t.log(JSON.stringify(savedNames));
  t.is(savedNames.length, 2);
});

test("should save an existing actor", async (t) => {
  const actorRepository = new MemoryActorRepository();
  const nameRepository = new MemoryActorNameRepository();

  const saveActor = new SaveActor(actorRepository, nameRepository);

  const actorData: BuildActorParams = {
    lang: "ro",
    country: "md",
    name: "Chișinău",
    names: ["Chișinău", "Chisinau", "chisinau", "Chișinăului"].map((name) => ({
      name,
      type: ActorNameType.WIKI,
      popularity: 1
    })),
    type: ActorType.PLACE,
    wikiEntity: {
      wikiDataId: "",
      name: "",
      wikiPageTitle: "",
      countLinks: 1,
      countryCodes: []
    }
  };

  const actor = ActorHelper.build(actorData);

  const savedActor1 = await saveActor.execute(actorData);

  t.not(actor.id, savedActor1.id);
  t.is(actor.name, savedActor1.name);

  const actorNames = await nameRepository.getNamesByActorId(savedActor1.id);

  // t.log(JSON.stringify(actorNames));

  t.is(actorNames.length, 2);
  t.is(actorNames[0].name, actorData.names[0].name);
  t.is(actorNames[1].name, actorData.names[3].name);

  const actorData2 = { ...actorData };
  actorData2.names = actorData2.names.slice(0, 2);

  const savedActor2 = await saveActor.execute(actorData2);

  const actorNames2 = await nameRepository.getNamesByActorId(savedActor2.id);

  // t.log(JSON.stringify(actorNames2));

  t.is(actorNames2.length, 1);
  t.is(actorNames2[0].name, actorData2.names[0].name);
});
