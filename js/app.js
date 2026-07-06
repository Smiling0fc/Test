const Site = {

    config:null,

    async load(){

        const response = await fetch("config/config.json");

        this.config = await response.json();

    }

};
