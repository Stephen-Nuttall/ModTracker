// allows for tests to use API key from API_Keys.env
import { config } from 'dotenv';
config({ path: '.env' });

const _curseforgeRegex = /^https:\/\/(www\.)?curseforge\.com\/minecraft\/mc-mods\/[a-zA-Z0-9-_]+\/?$/
const _requestTimeout = 10000 // How many seconds to wait for an API call before timeout.
const _allowedCategoryIDs = [6, 4906, 6814, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441]

// Verify if the URL this mod was initialized with is specifically a Curseforge URL
function verifyURL(url) {
    return (url.match(_curseforgeRegex) != null)
}

const _genericCurseforgeCall = async (url, requestParameters = {}) => {
    const apiKey = process.env.VITE_CURSEFORGE_API_KEY || import.meta.env.CURSEFORGE_API_KEY || import.meta.env.VITE_CURSEFORGE_API_KEY
    let response

    try {
        const urlWithParams = new URL(url)
        Object.entries(requestParameters).forEach(([key, value]) => {
            urlWithParams.searchParams.append(key, value)
        })

        response = await fetch(urlWithParams, {
            method: "GET",
            headers: { "Accept": "application/json", "x-api-key": apiKey },
            signal: AbortSignal.timeout(_requestTimeout),
        })
    } catch (error) {
        if (error.name === "TimeoutError") {
            throw new Error(
                `CurseForge API request timed out after ${_requestTimeout} seconds`
            )
        } else {
            throw new Error(`Failed to reach CurseForge API. ${error.message}`)
        }
    }

    const statusCode = response.status
    const text = await response.text()

    if (response.status !== 200) {
        throw new Error(
            `CurseForge API (url = ${url}) didn't return successfully: ${statusCode}, ${text}`
        )
    }

    const data = JSON.parse(text)
    return data
}

const ping = async () => {
    const placeholder_mod_slug = "sodium"
    return await _genericCurseforgeCall(`https://api.curseforge.com/v1/mods/search?gameId=432&slug=${placeholder_mod_slug}`)
}

const modData = async (mod_slug) => {
    const url = `https://api.curseforge.com/v1/mods/search?gameId=432&slug=${mod_slug}`
    const json = await _genericCurseforgeCall(url)

    try {
        // take the first search result that is not a custom map, texture pack, or anything that isn't a mod
        for (const entry of json.data) {
            if (_allowedCategoryIDs.includes(entry.primaryCategoryId)) {
                return entry
            }
        }
        console.log(`No mod found with slug ${mod_slug}`)
    }
    catch (error) {
        if (error instanceof RangeError) {
            throw new Error(`No search results were found for slug '${mod_slug}'`)
        } else {
            throw error
        }
    }
}

function sortVersionList(curseforgeJson) {
    const fileIndexes = curseforgeJson.latestFilesIndexes
    let parsedVersions = []

    for (file of fileIndexes) {
        parsedVersions.append(list(map(int, file.gameVersion.split('.'))))
    }

    const sortedVersions = sorted(parsedVersions)

    let unparsedVersions = []
    for (versionComponents of sortedVersions) {
        if (versionComponents.length == 3) {
            versionStr = `${versionComponents[0]}.${versionComponents[1]}.${versionComponents[2]}`
        }
        else {
            versionStr = `${versionComponents[0]}.${versionComponents[1]}`
        }
        unparsedVersions.append(versionStr)

        return unparsedVersions
    }
}

function modLoader_IDtoText(loaderID) {
    switch (loaderID) {
        case 0:
            return "Any"
        case 1:
            return "Forge"
        case 2:
            return "Cauldron"
        case 3:
            return "LiteLoader"
        case 4:
            return "Fabric"
        case 5:
            return "Quilt"
        case 6:
            return "NeoForge"
        default:
            return -1
    }
}

// Returns false is no download link can be found for the given mod, mod loader, and Minecraft version.
const getDownloadLink = async (curseforgeJson, mod_id, loader, version) => {
    const fileIndexes = curseforgeJson.latestFilesIndexes

    // Get the FileId of the first file (from a sorted list) that has the right mod loader, and use it to get that file's download link
    for (const file of fileIndexes) {
        // if file's gameVersion matches version, the file has a modLoader entry,
        // and that modLoader entry matches loader, then make an API call for the download link
        if (file.gameVersion == version && "modLoader" in file && (file.modLoader == 0 || modLoader_IDtoText(file.modLoader) == loader)) {
            const url = `https://api.curseforge.com/v1/mods/${mod_id}/files/${file.fileId}`
            const data = await _genericCurseforgeCall(url)
            const downloadLink = data.data.downloadUrl

            if (downloadLink) {
                return downloadLink
            }
        }
    }

    return false
}

// const searchCurseforge = async (modName) => {
//     validResults = []
//     result = await _genericCurseforgeCall("https://api.curseforge.com/v1/mods/search", { "gameId": 432, "searchFilter": modName, "pageSize": 1 })

//     for (entry of result["data"]) {
//         if (entry["primaryCategoryId"] in _allowedCategoryIDs) {
//             validResults.append(entry)
//         }
//     }

//     if (validResults) {
//         return validResults
//     } else {
//         return false
//     }
// }

export default { verifyURL, ping, modData, sortVersionList, getDownloadLink }