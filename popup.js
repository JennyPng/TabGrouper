async function groupTabs() {
    let queryOptions = {currentWindow: true, active: true};
    const currTab = await chrome.tabs.query(queryOptions);
    const tabs = await chrome.tabs.query({});

    const tempurl = currTab[0].url;
    if (!tabs || !tempurl) return; // if either is undefined just don't proceed
    
    const currURL = new URL(tempurl);
    const currHost = currURL.hostname;

    // get tabs with matching host to current tab
    const matches = tabs.filter(tab => {
        let url = new URL(tab.url);
        if (url.hostname === currHost) {
            return url.hostname;
        }
    });

    // group tabs
    const tabIds = matches.map(({ id }) => id);
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: `${currHost}`});
  }

const gButton = document.getElementById("group-button");
gButton.addEventListener('click', groupTabs);
