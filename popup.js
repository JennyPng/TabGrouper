const gButton = document.getElementById("group_button");
const template = document.getElementById("li_template");
const elements = new Set();

// TODO: define array to store current groups in storage / load from storage?

async function groupTabs() {
    let queryOptions = { currentWindow: true, active: true };
    const currTab = await chrome.tabs.query(queryOptions);
    const tabs = await chrome.tabs.query({});

    const tempurl = currTab[0].url;
    if (!tabs || !tempurl) return; // if either is undefined just don't proceed

    const currURL = new URL(tempurl);
    const currHost = currURL.hostname;

    // get tabs that have the same host as current tab
    const matches = tabs.filter(tab => {
        let url = new URL(tab.url);
        if (url.hostname === currHost) {
            return tab;
        }
    });

    // group tabs
    const tabIds = matches.map(({ id }) => id);
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: `${currHost}` });


    // UI update
    for (const tab of matches) {
        console.log(tab);
        const element = template.content.firstElementChild.cloneNode(true); // template allows it to be cloned instead of creating new element every time? - for building stuff up in javascript rather than hardcoding html

        const title = tab.title;
        const pathname = new URL(tab.url).pathname.slice("\docs".length);
        const favicon = tab.favIconUrl;

        if (favicon) {
            element.querySelector("img").src = favicon;
        }
        element.querySelector(".title").textContent = title;
        element.querySelector(".pathname").textContent = pathname;
        element.querySelector("a").addEventListener("click", async () => {
            // focus window and active tab
            await chrome.tabs.update(tab.id, { active: true });
            await chrome.windows.update(tab.windowId, { focused: true });
        });
        console.log(tab.title);
        elements.add(element);
    }
    document.querySelector("ul").append(...elements);

    // TODO: update storage to persist data
    chrome.storage.local.set({ key: value }).then(() => {
        console.log("Value is set to " + value);
    });

}

gButton.addEventListener('click', groupTabs);
