class CollectionService {

    static collections = [];

    static getAll() {

        return this.collections;

    }

static create(name){

    if(this.collections.some(
        collection =>
        collection.name.toLowerCase() === name.toLowerCase()
    )){
        alert("Такая коллекция уже существует.");
        return false;
    }

    const collection = {

        id: Date.now(),

        name,

        photos: [],

        created: new Date(),

        cover: null

    };

    this.collections.push(collection);

    return true;

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
