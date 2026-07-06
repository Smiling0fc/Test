async function loadSiteConfig(){

    const response = await fetch("config/site.json");

    return await response.json();

}
