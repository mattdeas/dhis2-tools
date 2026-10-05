# DHIS2 Tools

A small Chrome extension for people who work in DHIS2 every day. It works with whichever DHIS2 server is open in your current tab.

- **Show COCs**: on a data element page in the maintenance app, opens that data element's category option combos (`id`, `name`) in a new window.
- **Download org units** as CSV (`api/organisationUnits.csv?paging=false`).
- **Download data elements** as CSV (`api/dataElements.csv?paging=false`).

## Install

1. Download this repo: **Code → Download ZIP** and unzip it, or `git clone` it. You can also grab `dhis2-tools.zip` from the latest [release](../../releases).
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and choose the folder that contains `manifest.json`.
4. Optional: pin the extension from the puzzle-piece menu.

To update later, pull or download the new version, then click the reload icon on the extension's card in `chrome://extensions`.

## Use

Log in to your DHIS2 instance in Chrome, then click the extension icon.

| Action | How |
|---|---|
| Show COCs | Open a data element in the maintenance app, then click **Show COCs** or press <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd> |
| Download CSV | Click **Download** next to Org units or Data elements |
| Choose columns | Expand **Fields** under a download and enter a field list, e.g. `id,name,code,level,path`. Leave it empty for the server default. Your choice is remembered. |

Example COC URL the extension builds:

```
https://<server>/api/dataElements/<UID>.json?fields=categoryCombo[categoryOptionCombos[id,name]]
```

Files are saved to your Downloads folder as `<server>_<resource>_<date>.csv`. Instances on a sub-path (e.g. `https://host/dhis/...`) are handled automatically.

You can change the keyboard shortcut at `chrome://extensions/shortcuts`.

## Permissions

| Permission | Why |
|---|---|
| `activeTab` | Reads the current tab's URL only when you click the icon or use the shortcut |
| `downloads` | Saves the CSV exports |
| `storage` | Remembers your custom field lists |

The extension has no access to other sites and sends no data anywhere. Requests go only to the DHIS2 server you're on, using your existing login.

## Files

```
manifest.json   Extension config
background.js   Keyboard shortcut handler
dhis2.js        Shared URL helpers
popup.html/css/js  The panel UI
```

## Releases

Push a version tag and GitHub Actions attaches an installable zip to a release:

```
git tag v2.0
git push origin v2.0
```

Keep the `version` in `manifest.json` in step with the tag.

## License

MIT
