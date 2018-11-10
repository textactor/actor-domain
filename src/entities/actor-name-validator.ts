import { JoiEntityValidator } from "@textactor/domain";
import Joi = require('joi');
import { ActorName, ACTOR_NAME_TYPE } from "./actor-name";


export class ActorNameValidator extends JoiEntityValidator<ActorName> {
    constructor() {
        super({ createSchema, updateSchema });
    }
}

const schema = {
    id: Joi.string().alphanum().min(16).max(40),

    lang: Joi.string().regex(/^[a-z]{2}$/),
    country: Joi.string().regex(/^[a-z]{2}$/),

    name: Joi.string().min(2).max(200),
    actorId: Joi.string().min(1).max(40),
    type: Joi.string().valid('WIKI', 'SAME'),
    countWords: Joi.number().integer().min(1).max(50),

    createdAt: Joi.number().integer(),
}

const createSchema = Joi.object().keys({
    id: schema.id.required(),
    lang: schema.lang.required(),
    country: schema.country.required(),
    name: schema.name.required(),
    actorId: schema.actorId.required(),
    type: schema.type.required(),
    countWords: schema.countWords.required(),
    createdAt: schema.createdAt.required(),
}).required();

const updateSet = ACTOR_NAME_TYPE.updateFields().reduce<Joi.SchemaMap>((map, field) => {
    map[field] = (<any>schema)[field];
    return map;
}, {});

const updateDelete = Joi.string().valid(ACTOR_NAME_TYPE.deleteFields());

const updateSchema = Joi.object().keys({
    id: schema.id.required(),
    set: Joi.object().keys(updateSet),
    delete: Joi.array().items(updateDelete),
}).or('set', 'delete').required();
