
export type ActorName = {
    id: string
    name: string
    lang: string
    country: string
    actorId: string
    type: ActorNameType
    countWords: number
    createdAt?: number
}

export enum ActorNameType {
    WIKI = 'WIKI',
    SAME = 'SAME',
}
