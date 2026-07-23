class ApiService {

    static get apiUrl() {

        const url = String(
            CMS_CONFIG.apiUrl || ""
        ).trim();

        if (!url || !url.endsWith("/exec")) {

            throw new Error(
                "В CMS_CONFIG не указан корректный apiUrl."
            );

        }

        return url;

    }

    static async get(action, parameters = {}) {

        const url = new URL(this.apiUrl);

        url.searchParams.set(
            "action",
            action
        );

        Object.entries(parameters)
            .forEach(([key, value]) => {

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {

                    url.searchParams.set(
                        key,
                        String(value)
                    );

                }

            });

        const response = await fetch(
            url.toString(),
            {
                method: "GET",
                redirect: "follow",
                cache: "no-store"
            }
        );

        return this.parseResponse(response);

    }

    static async post(action, payload = {}) {

        const response = await fetch(
            this.apiUrl,
            {
                method: "POST",
                redirect: "follow",

                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },

                body: JSON.stringify({
                    action,
                    ...payload
                })
            }
        );

        return this.parseResponse(response);

    }

    static async parseResponse(response) {

        if (!response.ok) {

            throw new Error(
                `Ошибка API: HTTP ${response.status}`
            );

        }

        const text = await response.text();

        let data;

        try {

            data = JSON.parse(text);

        } catch {

            console.error(
                "Некорректный ответ API:",
                text
            );

            throw new Error(
                "API вернул ответ не в формате JSON."
            );

        }

        if (!data.success) {

            throw new Error(
                data.error ||
                "Неизвестная ошибка API."
            );

        }

        return data;

    }

    static health() {

        return this.get("health");

    }

    static getCollections() {

        return this.get(
            "getCollections"
        );

    }

    static createCollection(data) {

        return this.post(
            "createCollection",
            data
        );

    }

    static deleteCollection(collectionId) {

        return this.post(
            "deleteCollection",
            {
                collectionId
            }
        );

    }

    static getPhotos(collectionId) {

        return this.get(
            "getPhotos",
            {
                collectionId
            }
        );

    }

}
