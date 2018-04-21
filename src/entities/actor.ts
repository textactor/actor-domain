
export enum ActorType {
    EVENT = 'EVENT',
    ORG = 'ORG',
    PERSON = 'PERSON',
    PLACE = 'PLACE',
    PRODUCT = 'PRODUCT',
}

export type Actor = {
    id: string
    name?: string
    lang?: string
    country?: string

    abbr?: string

    type?: ActorType
    wikiDataId?: string

    createdAt?: number
    updatedAt?: number

    context?: string
}
