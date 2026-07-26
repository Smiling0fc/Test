(() => {

    const STORAGE_KEY =
        "vijoy_homepage_preview_device";

    const DEVICES = {
        desktop: {
            label: "Desktop",
            icon: "▰"
        },
        tablet: {
            label: "Tablet",
            icon: "▯"
        },
        mobile: {
            label: "Mobile",
            icon: "▯"
        }
    };

    const normalizeDevice = value =>
        Object.prototype.hasOwnProperty.call(
            DEVICES,
            value
        )
            ? value
            : "desktop";

    const getSavedDevice = () => {
        try {
            return normalizeDevice(
                localStorage.getItem(STORAGE_KEY)
            );
        } catch {
            return "desktop";
        }
    };

    const saveDevice = device => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                device
            );
        } catch {
            // Local storage may be unavailable in private mode.
        }
    };

    const updateToolbarLabel = device => {
        const label = document.getElementById(
            "homepageViewportLabel"
        );

        if (label) {
            label.textContent =
                DEVICES[device].label;
        }
    };

    const applyDevice = deviceValue => {
        const device = normalizeDevice(
            deviceValue
        );
        const stage = document.querySelector(
            ".homepage-stage"
        );

        if (!stage) {
            return;
        }

        stage.classList.remove(
            "is-desktop",
            "is-tablet",
            "is-mobile"
        );
        stage.classList.add(`is-${device}`);
        stage.dataset.device = device;

        document
            .querySelectorAll(
                ".homepage-device-button"
            )
            .forEach(button => {
                const active =
                    button.dataset.device === device;

                button.classList.toggle(
                    "is-active",
                    active
                );
                button.setAttribute(
                    "aria-pressed",
                    String(active)
                );
            });

        updateToolbarLabel(device);
        saveDevice(device);
    };

    const mountControls = () => {
        const toolbar = document.querySelector(
            ".homepage-stage-toolbar"
        );

        if (!toolbar) {
            return;
        }

        const existing = toolbar.querySelector(
            ".homepage-device-switcher"
        );

        if (existing) {
            applyDevice(getSavedDevice());
            return;
        }

        const left = toolbar.querySelector(
            "span:first-child"
        );

        if (left) {
            left.innerHTML = `
                Предпросмотр ·
                <strong id="homepageViewportLabel">
                    Desktop
                </strong>
            `;
        }

        const switcher = document.createElement(
            "div"
        );
        switcher.className =
            "homepage-device-switcher";
        switcher.setAttribute(
            "role",
            "group"
        );
        switcher.setAttribute(
            "aria-label",
            "Размер предпросмотра"
        );

        switcher.innerHTML = Object.entries(
            DEVICES
        ).map(([device, data]) => `
            <button
                class="homepage-device-button"
                type="button"
                data-device="${device}"
                aria-label="${data.label}"
                aria-pressed="false"
                title="${data.label}">
                <span aria-hidden="true">${data.icon}</span>
                <small>${data.label}</small>
            </button>
        `).join("");

        toolbar.insertBefore(
            switcher,
            toolbar.lastElementChild
        );

        switcher
            .querySelectorAll(
                ".homepage-device-button"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => applyDevice(
                        button.dataset.device
                    )
                );
            });

        applyDevice(getSavedDevice());
    };

    const originalRender =
        Homepage.render.bind(Homepage);

    Homepage.render = async function () {
        await originalRender();
        mountControls();
    };

})();
