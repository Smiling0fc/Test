class PublicApi {

    static get apiUrl() {

        const url = String(
            PUBLIC_CONFIG.apiUrl || ""
        ).trim();

        if (!url.endsWith("/exec")) {

            throw new Error(
                "Не указан корректный адрес API."
            );

        }

        return url;

    }

    static async get(
        action,
        parameters = {}
    ) {

        const url = new URL(
            this.apiUrl
        );

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

                cache: "no-store",

                redirect: "follow"
            }
        );

        if (!response.ok) {

            throw new Error(
                `Ошибка API: HTTP ${response.status}`
            );

        }

        const text =
            await response.text();

        let data;

        try {

            data = JSON.parse(text);

        } catch {

            console.error(
                "Ответ API:",
                text
            );

            throw new Error(
                "API вернул некорректный ответ."
            );

        }

        if (!data.success) {

            throw new Error(
                data.error ||
                "Не удалось получить данные."
            );

        }

        return data;

    }

    static getCollections() {

        return this.get(
            "getCollections"
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
