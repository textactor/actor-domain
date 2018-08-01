
export enum ActorType {
    EVENT = 'EVENT',
    ORG = 'ORG',
    PERSON = 'PERSON',
    PLACE = 'PLACE',
    PRODUCT = 'PRODUCT',
    WORK = 'WORK',
}

export type Actor = {
    id: string
    name: string
    lang: string
    country: string

    commonName?: string

    abbr?: string

    type?: ActorType
    wikiDataId: string
    wikiPageTitle?: string

    createdAt?: number
    updatedAt?: number

    description?: string
    wikiCountLinks: number
}
