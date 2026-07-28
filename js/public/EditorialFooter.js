class EditorialFooter {
    static render() {
        const footer = document.querySelector(".site-footer");

        if (!footer) {
            return;
        }

        footer.classList.add("editorial-footer");
        footer.innerHTML = `
            <div class="editorial-footer-inner">
                <div class="editorial-footer-main">
                    <div>
                        <small class="editorial-footer-kicker">
                            Новая история
                        </small>
                        <h2 class="editorial-footer-title">
                            Давайте сохраним вашу историю
                        </h2>
                        <p class="editorial-footer-description">
                            Расскажите о съёмке, событии или идее. Вместе соберём
                            серию, к которой захочется возвращаться.
                        </p>
                    </div>

                    <a
                        class="contact-link editorial-footer-contact"
                        href="#contactDrawer"
                        aria-controls="contactDrawer"
                        aria-expanded="false">
                        Обсудить съёмку
                        <span aria-hidden="true">→</span>
                    </a>
                </div>

                <div class="editorial-footer-links">
                    <div class="editorial-footer-group">
                        <small>Навигация</small>
                        <nav class="editorial-footer-nav" aria-label="Навигация в подвале">
                            <a href="./">Главная</a>
                            <a href="collections.html">Коллекции</a>
                            <a href="./#about">О фотографе</a>
                            <a href="./#latestStories">Последние истории</a>
                        </nav>
                    </div>

                    <div class="editorial-footer-group">
                        <small>Социальные сети</small>
                        <div class="site-footer-socials editorial-footer-socials" aria-label="Социальные сети">
                            <a aria-label="Instagram" hidden>
                                <span class="editorial-social-monogram" aria-hidden="true">IG</span>
                            </a>
                            <a aria-label="VK" hidden>
                                <span class="editorial-social-monogram" aria-hidden="true">VK</span>
                            </a>
                            <a aria-label="Telegram" hidden>
                                <span class="editorial-social-monogram" aria-hidden="true">TG</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="editorial-footer-bottom">
                    <span class="editorial-footer-location" hidden aria-hidden="true">
                        ViJoy’s Journal
                    </span>

                    <div class="site-footer-copy">
                        <p>© 2026 ViJoy’s Photo Gallery</p>
                        <span>Все права защищены</span>
                    </div>

                    <div class="site-footer-legal">
                        <a href="#">Политика конфиденциальности</a>
                        <span aria-hidden="true">·</span>
                        <a href="#">Условия использования</a>
                    </div>
                </div>
            </div>
        `;
    }
}

EditorialFooter.render();
