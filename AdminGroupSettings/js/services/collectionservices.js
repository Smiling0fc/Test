class CollectionService {

    static collections = [];

    static getAll() {

        return this.collections;

    }

    static create(name) {

        const collection = {

            id: Date.now(),

            name: name,

            photos: [],

            created: new Date(),

            cover: null

        };

        this.collections.push(collection);

    }

    static remove(id) {

        this.collections = this.collections.filter(
            collection => collection.id !== id
        );

    }

    static rename(id, newName) {

        const collection = this.collections.find(
            collection => collection.id === id
        );

        if(collection){

            collection.name = newName;

        }

    }

}
