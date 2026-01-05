const _curseforgeRegex = /^https:\/\/(www\.)?curseforge\.com\/minecraft\/mc-mods\/[a-zA-Z0-9-_]+\/?$/
const _requestTimeout = 10000 // How many seconds to wait for an API call before timeout.
const _allowedCategoryIDs = [6, 4906, 6814, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441]

// Verify if the URL this mod was initialized with is specifically a Curseforge URL
function verifyURL(url) {
    if (!url) {
        return false
    } else {
        return (url.match(_curseforgeRegex) != null)
    }
}

const _genericCurseforgeCall = async (url, requestParameters = {}) => {
    // Load API key. There are two potential places where the API key may be found:
    // A) in the environment variables (import.meta.env.CURSEFORGE_API_KEY or import.meta.env.VITE_CURSEFORGE_API_KEY). If it's not there, try
    // B) in 'public/API_Keys.json', which if it exists, contains export const CurseForge = "API KEY GOES HERE."
    // If neither work, abort immediately.

    let apiKey = import.meta.env.CURSEFORGE_API_KEY

    if (apiKey === undefined || apiKey == "undefined") {
        apiKey = import.meta.env.VITE_CURSEFORGE_API_KEY
    }

    try {
        if (apiKey === undefined || apiKey == "undefined") {
            const res = await fetch('/ModTracker/API_Keys.json')

            if (res === undefined) {
                const undefinedError = new Error("API_Keys.json was found but response came back undefined.")
                undefinedError.name = "API Key could not be fetched"
                throw undefinedError
            }

            if (res.ok) {
                const json = await res.json()
                apiKey = json.CurseForge
            } else {
                const badStatusError = new Error("API_Keys.json was found but could not be read. Response status: " + res.status)
                badStatusError.name = "API Key could not be fetched"
                throw badStatusError
            }
        }
    } catch (error) {
        const genericAPIFetchError = new Error("CURSEFORGE API KEY COULD NOT BE FETCHED. Attempt was made to fetch" +
            " the key from import.meta.env.CURSEFORGE_API_KEY. When that failed, an attempt was" +
            " made to fetch the key from 'public/API_Keys.json', but that file could not be found.")
        genericAPIFetchError.name = "API Key could not be fetched"
        throw genericAPIFetchError
    }

    let response
    try {
        const urlWithParams = new URL(url)
        Object.entries(requestParameters).forEach(([key, value]) => {
            urlWithParams.searchParams.push(key, value)
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
            throw new Error(`Failed to reach CurseForge API. ${error.name}: ${error.message}`)
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
    if (mod_slug === undefined) {
        let error = new Error("Mod slug provided is undefined.")
        error.name = "Mod Slug Undefined"
        throw error
    }
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
            let searchError = new Error(`No search results were found for slug '${mod_slug}'`)
            searchError.name = "No Results Found"
            throw searchError
        } else {
            throw error
        }
    }
}

function sortVersionList(curseforgeJson) {
    const fileIndexes = curseforgeJson.latestFilesIndexes

    const parsedVersions = fileIndexes.map((file) => {
        const split = file.gameVersion.split('.')
        return split.map(str => +str)
    })

    const sortedVersions = parsedVersions.sort((a, b) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) {
                return a[i] - b[i];
            }
        }

        return a.length - b.length;
    })

    const restoredVersions = sortedVersions.map((versionComponents) => {
        let versionStr

        if (versionComponents.length == 3) {
            versionStr = `${versionComponents[0]}.${versionComponents[1]}.${versionComponents[2]}`
        }
        else {
            versionStr = `${versionComponents[0]}.${versionComponents[1]}`
        }

        return versionStr
    })

    const noDuplicateVersions = [...new Set(restoredVersions)]
    return noDuplicateVersions
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

const getDownloadLink = async (curseforgeJson, loader, version) => {
    const fileIndexes = curseforgeJson.latestFilesIndexes

    // Get the FileId of the first file (from a sorted list) that has the right mod loader, and use it to get that file's download link
    for (const file of fileIndexes) {
        // if file's gameVersion matches version, the file has a modLoader entry,
        // and that modLoader entry matches loader, then make an API call for the download link
        if (file.gameVersion == version && "modLoader" in file && (file.modLoader == 0 || modLoader_IDtoText(file.modLoader) == loader)) {
            const url = `https://api.curseforge.com/v1/mods/${curseforgeJson.id}/files/${file.fileId}`
            const data = await _genericCurseforgeCall(url)
            const downloadLink = data.data.downloadUrl

            if (downloadLink) {
                return downloadLink
            } else {
                console.log(`Attempted to download ${data.data.fileName}, but its download link is ${downloadLink}`)
            }
        }
    }

    let error = new Error(`No download link could be found for ${curseforgeJson.name} for ${version} and ${loader}`)
    error.name = "Download Unavailable"
    throw error
}

// const searchCurseforge = async (modName) => {
//     validResults = []
//     result = await _genericCurseforgeCall("https://api.curseforge.com/v1/mods/search", { "gameId": 432, "searchFilter": modName, "pageSize": 1 })

//     for (entry of result["data"]) {
//         if (entry["primaryCategoryId"] in _allowedCategoryIDs) {
//             validResults.push(entry)
//         }
//     }

//     if (validResults) {
//         return validResults
//     } else {
//         return false
//     }
// }

export default { verifyURL, ping, modData, sortVersionList, getDownloadLink }