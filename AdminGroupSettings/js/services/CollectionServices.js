class CollectionService {

    static storageKey = "photographer_collections";
    static collections = [];

    static getAll() {

        return this.collections;

    }
    static load() {

    const data = localStorage.getItem(this.storageKey);

    if (!data) {

        this.collections = [];

        return;

    }

    try {

        this.collections = JSON.parse(data);

    } catch {

        this.collections = [];

    }

    }
    
    static save() {

    localStorage.setItem(

        this.storageKey,

        JSON.stringify(this.collections)

    );

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
    this.save();
    return true;

}

    static remove(id) {

        this.collections = this.collections.filter(
            collection => collection.id !== id
        );
        this.save();

    }

    static rename(id, newName) {

        const collection = this.collections.find(
            collection => collection.id === id
        );

        if(collection){

            collection.name = newName;
            this.save();

        }

    }

}
