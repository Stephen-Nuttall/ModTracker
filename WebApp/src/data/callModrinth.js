const _modrinthRegex = /^https:\/\/(www\.)?modrinth\.com\/mod\/[a-zA-Z0-9-_]+\/?$/
const _requestTimeout = 10000 // How many milliseconds to wait for an API call before timeout.

// Verify if the URL this mod was initialized with is specifically a Modrinth URL
const verifyURL = (url) => {
    if (!url) {
        return false
    } else {
        return (url.match(_modrinthRegex) != null)
    }
}

const _genericModrinthCall = async (url, requestParameters = {}) => {
    let response
    try {
        const urlWithParams = new URL(url)
        Object.entries(requestParameters).forEach(([key, value]) => {
            urlWithParams.searchParams.append(key, value)
        })

        response = await fetch(urlWithParams, {
            method: "GET",
            signal: AbortSignal.timeout(_requestTimeout),
        })
    } catch (error) {
        if (error.name === "TimeoutError") {
            throw new Error(
                `Modrinth API request timed out after ${_requestTimeout} seconds`
            )
        } else {
            throw new Error(`Failed to reach Modrinth API. ${error.message}`)
        }
    }

    const statusCode = response.status
    const text = await response.text()

    if (response.status !== 200) {
        throw new Error(
            `Modrinth API (url = ${url}) didn't return successfully: ${statusCode}, ${text}`
        )
    }

    const data = JSON.parse(text)
    return data
}

const ping = async () => {
    const data = await _genericModrinthCall("https://api.modrinth.com/")
    return data
}

const modData = async (mod_slug) => {
    const url = `https://api.modrinth.com/v2/project/${mod_slug}`
    return await _genericModrinthCall(url)
}

const modVersionList = async (mod_slug) => {
    const url = `https://api.modrinth.com/v2/project/${mod_slug}/version`
    return await _genericModrinthCall(url)
}

const getDownloadLink = async (mod_slug, loader, version) => {
    loader = loader.toLowerCase()
    const versionList = await modVersionList(mod_slug)

    for (const ver of versionList) {
        if (ver.loaders.includes(loader) && ver.game_versions.includes(version)) {
            for (const file of ver.files) {
                return file.url
            }
        }
    }

    let error = new Error(`No download link could be found for ${mod_slug} for ${version} and ${loader}`)
    error.name = "Download Unavailable"
    throw error
}

/*
// Searches modrinth API for mods with a similar name to query.
// Returns a list of json data for each result, or false if no results were found. numResults must be > 0.
// If numResults is 1, only a single json dictionary will be returned, instead of a list of json dictionaries.
const searchModrinth = async (modName, numResults) => {
    if (numResults <= 0) {
        return false
    }

    const search_url = "https://api.modrinth.com/v2/search"
    const params = { "query": modName, "limit": numResults, "facets": '[["project_type:mod"]]' }
    const response = await _genericModrinthCall(search_url, params)

    if (!response) {
        return false
    }
    else {
        const results = response["hits"]
        if (numResults == 1) {
            return results[0]
        }
        else {
            return results
        }
    }
}
*/

export default { verifyURL, ping, modData, modVersionList, getDownloadLink }