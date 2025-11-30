import {
    Collection,
    Document,
    Filter,
    InsertOneResult,
    ObjectId,
    OptionalUnlessRequiredId,
    WithId
} from 'mongodb'
import { getDb } from './mongoClient'

export interface BaseDocument extends Document {
    createdAt?: Date
    updatedAt?: Date
}

export abstract class MongoRepository<T extends BaseDocument> {
    constructor(protected collectionName: string) { }

    protected get collection(): Collection<T> {
        return getDb().collection<T>(this.collectionName)
    }

    async create(item: OptionalUnlessRequiredId<T>): Promise<WithId<T>> {
        const now = new Date()
        const itemWithTimestamps = {
            ...item,
            createdAt: now,
            updatedAt: now
        } as OptionalUnlessRequiredId<T>

        const result: InsertOneResult<T> = await this.collection.insertOne(itemWithTimestamps)
        return { ...itemWithTimestamps, _id: result.insertedId } as WithId<T>
    }

    async update(id: string | ObjectId, item: Partial<T>): Promise<WithId<T> | null> {
        const now = new Date()
        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) } as Filter<T>,
            { $set: { ...item, updatedAt: now } } as any,
            { returnDocument: 'after' }
        )
        return result
    }

    async findAll(filter: Filter<T> = {}): Promise<WithId<T>[]> {
        return this.collection.find(filter).toArray()
    }

    async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
        return this.collection.findOne(filter)
    }

    async findById(id: string | ObjectId): Promise<WithId<T> | null> {
        return this.collection.findOne({ _id: new ObjectId(id) } as Filter<T>)
    }

    async createIndexes(): Promise<void> {
        // Override in subclasses
    }
}
