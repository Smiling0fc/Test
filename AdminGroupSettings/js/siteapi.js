
class SiteApi {

    static get apiUrl() {

        const url = String(
            CMS_CONFIG.apiUrl || ""
        ).trim();

        if (!url) {
            throw new Error(
                "Не указан адрес API."
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

        const response =
            await fetch(
                url.toString(),
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                `Ошибка API: ${response.status}`
            );

        }

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.error ||
                "Ошибка получения данных."
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
