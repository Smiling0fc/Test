window.onload=async()=>{

    const config=await loadSiteConfig();

    document.title=config.siteName;

    document.querySelector(".background").style.backgroundImage=
        `url(${config.background})`;

    document.querySelector(".logo img").src=config.logo;

    await buildMenu();

}
