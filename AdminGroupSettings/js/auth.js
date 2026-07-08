
class Auth {

    static login(){

        localStorage.setItem(
            "logged",
            "true"
        );

        App.start();

    }

    static logout(){

        localStorage.removeItem(
            "logged"
        );

        App.start();

    }

    static isLogged(){

        return localStorage.getItem(
            "logged"
        ) === "true";

    }

}
