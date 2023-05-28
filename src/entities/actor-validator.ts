import { JoiEntityValidator } from "@textactor/domain";
import Joi from "joi";
import { Actor, ACTOR_TYPE } from "./actor";

const schema = {
  id: Joi.string().min(6).max(16),
  lang: Joi.string().regex(/^[a-z]{2}$/),
  country: Joi.string().regex(/^[a-z]{2}$/),
  name: Joi.string().min(2).max(200),
  commonName: Joi.string().min(2).max(200),
  englishName: Joi.string().min(2).max(200),
  countryCodes: Joi.array()
    .items(Joi.string().regex(/^[a-z]{2}$/))
    .unique()
    .max(6),
  abbr: Joi.string().min(1).max(50),
  wikiDataId: Joi.string().regex(/^Q\d+$/),
  wikiPageTitle: Joi.string().min(2).max(200),
  type: Joi.valid("EVENT", "ORG", "PERSON", "PLACE", "PRODUCT", "WORK"),
  description: Joi.string().max(200).truncate(),
  wikiCountLinks: Joi.number().integer().min(1).max(500),
  createdAt: Joi.number().integer(),
  updatedAt: Joi.number().integer()
};

const createSchema = Joi.object()
  .keys({
    id: schema.id.required(),
    lang: schema.lang.required(),
    country: schema.country.required(),
    name: schema.name.required(),
    commonName: schema.commonName,
    englishName: schema.englishName,
    countryCodes: schema.countryCodes,
    abbr: schema.abbr,
    wikiDataId: schema.wikiDataId.required(),
    wikiPageTitle: schema.wikiPageTitle,
    type: schema.type,
    description: schema.description,
    wikiCountLinks: schema.wikiCountLinks.required(),
    createdAt: schema.createdAt.required(),
    updatedAt: schema.updatedAt.required()
  })
  .required();

const updateSet = ACTOR_TYPE.updateFields().reduce<Joi.SchemaMap>(
  (map, field) => {
    map[field] = (<any>schema)[field];
    return map;
  },
  {}
);

const updateDelete = Joi.string().valid(...ACTOR_TYPE.deleteFields());

const updateSchema = Joi.object()
  .keys({
    id: schema.id.required(),
    set: Joi.object().keys(updateSet),
    delete: Joi.array().items(updateDelete)
  })
  .or("set", "delete")
  .required();

export class ActorValidator extends JoiEntityValidator<Actor> {
  constructor() {
    super({ createSchema, updateSchema });
  }
}
