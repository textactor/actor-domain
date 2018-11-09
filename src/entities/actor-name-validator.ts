import { JoiEntityValidator } from "@textactor/domain";
import Joi = require('joi');
import { ActorName } from "./actor-name";


export class ActorNameValidator extends JoiEntityValidator<ActorName> {
    constructor() {
        super({ createSchema, updateSchema });
    }
}

const schema = {
    id: Joi.string().min(16).max(40).required(),

    lang: Joi.string().regex(/^[a-z]{2}$/).required(),
    country: Joi.string().regex(/^[a-z]{2}$/).required(),

    name: Joi.string().min(2).max(200).required(),
    actorId: Joi.string().max(40).required(),
    type: Joi.valid('WIKI', 'SAME').required(),
    countWords: Joi.number().integer().min(1).max(100).required(),

    createdAt: Joi.number().integer().required(),
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

const updateSchema = Joi.object().keys({
    id: schema.id.required(),
    set: Joi.object().keys({
        type: schema.type,
    }),
    delete: Joi.array().max(0),
}).or('set', 'delete').required();
