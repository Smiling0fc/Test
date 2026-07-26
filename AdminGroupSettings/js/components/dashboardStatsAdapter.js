(() => {

    Dashboard.renderAttention = function (
        stats
    ) {
        const list = document.getElementById(
            "dashboardAttentionList"
        );

        if (!list) {
            return;
        }

        const issues = [];
        const addIssue = (count, title, note) => {
            if (Number(count || 0) > 0) {
                issues.push({
                    title: `${count} ${title}`,
                    note
                });
            }
        };

        addIssue(
            stats.withoutCover,
            "без обложки",
            "Карточки будут показаны без изображения"
        );
        addIssue(
            stats.withoutDescription,
            "без описания",
            "Добавьте короткий текст для коллекций"
        );
        addIssue(
            stats.hidden,
            "скрыто",
            "Эти коллекции не видны посетителям"
        );
        addIssue(
            stats.emptyPublished,
            "опубликовано без фотографий",
            "Проверьте пустые коллекции"
        );

        if (!issues.length) {
            list.innerHTML = `
                <div
                    class="dashboard-attention-row"
                    data-level="ok">
                    <div class="dashboard-attention-content">
                        <span class="dashboard-attention-icon">✓</span>
                        <div class="dashboard-attention-copy">
                            <strong>Всё выглядит аккуратно</strong>
                            <small>Критичных замечаний не найдено</small>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        list.innerHTML = issues.map(issue => `
            <div class="dashboard-attention-row">
                <div class="dashboard-attention-content">
                    <span class="dashboard-attention-icon">!</span>
                    <div class="dashboard-attention-copy">
                        <strong>${Dashboard.escapeHtml(
                            issue.title
                        )}</strong>
                        <small>${Dashboard.escapeHtml(
                            issue.note
                        )}</small>
                    </div>
                </div>
            </div>
        `).join("");
    };

})();
