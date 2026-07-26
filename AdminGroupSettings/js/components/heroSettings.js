class HeroSettings {

    static initialized = false;

    static init() {

        if (this.initialized) {
            return;
        }

        this.initialized = true;

        Collections.create =
            HeroSettings.createCollection;

    }

    static async createCollection() {

        const name = prompt(
            "Введите название коллекции"
        );

        if (name === null) {
            return;
        }

        const trimmed = name.trim();

        if (!trimmed) {
            return;
        }

        try {

            const collection =
                await CollectionService.create(
                    trimmed
                );

            const useAsHero = confirm(
                "Хотите ли Вы использовать новую коллекцию как обложку сайта?"
            );

            if (useAsHero) {
                await SiteSettingsService
                    .setHeroCollection(
                        collection.id
                    );
            }

            Collections.render();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Не удалось создать коллекцию."
            );

        }

    }

}

HeroSettings.init();
