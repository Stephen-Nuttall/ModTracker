import callModrinth from '../data/callModrinth.js'
import callCurseForge from '../data/callCurseForge.js'

class Priority {
    name = "New Priority Level"
    r = 255
    g = 255
    b = 255

    constructor(newName = "New Priority Level", red = 255, green = 255, blue = 255) {
        this.name = newName
        this.r = red
        this.g = green
        this.b = blue
    }

    createDict() {
        return {
            name: this.name,
            r: this.r,
            g: this.g,
            b: this.b
        }
    }

    toString() {
        return `${this.name}`
    }

    equals(other) {
        return other instanceof Priority && this.name === other.name && this.r === other.r && this.g === other.g && this.b === other.b
    }

    hash() {
        return JSON.stringify({ name: this.name, r: this.r, g: this.g, b: this.b })
    }
}

class Mod {
    priority = new Priority()
    tablePosition = -1

    #name = "Untitled Mod"
    #id = -1
    #url = null
    #versions = ["No versions found"]

    #modrinthData = null
    #curseforgeData = null

    constructor(
        url = null,
        modPriority = new Priority(),
        tablePosition = -1,
        modName = "Untitled Mod",
        modID = -1,
        modVersions = ["No versions found"],
        modrinthData = null,
        curseforgeData = null
    ) {
        this.priority = modPriority
        this.tablePosition = tablePosition

        this.#name = modName
        this.#id = modID
        this.#url = url
        this.#versions = modVersions
        this.#modrinthData = modrinthData
        this.#curseforgeData = curseforgeData

        if (modrinthData) {
            this.#extractModrinth()
        } else if (curseforgeData) {
            this.#extractCurseforge()
        }
    }

    toString() {
        return `${this.#name}, latest version: ${this.getCurrentVersion()}, priority: ${this.priority}`
    }

    lessThan(other) {
        if (this.tablePosition > 0 || other.tablePosition > 0) {
            return this.tablePosition < other.tablePosition
        } else {
            return this.#name < other.#name
        }
    }

    equals(other) {
        if (!(other instanceof Mod)) {
            return false
        }
        return (
            this.#name === other.#name &&
            this.#id === other.#id &&
            this.#url === other.#url &&
            JSON.stringify(this.#versions) === JSON.stringify(other.#versions)
        )
    }

    // Getters
    getName() { return this.#name }

    getID() { return this.#id }

    getCurrentVersion() { return this.#versions[this.#versions.length - 1] }

    getVersionList() { return this.#versions }
    getVersions() { return this.#versions }

    getURL() { return this.#url }

    getModrinthData() { return this.#modrinthData }

    getCurseforgeData() { return this.#curseforgeData }

    getTablePosition() { return this.tablePosition }

    validData() { return this.#modrinthData != null || this.#curseforgeData != null }

    verifyURL() {
        const curseforge = callModrinth.verifyURL(this.#url)
        const modrinth = callCurseForge.verifyURL(this.#url)
        return modrinth || curseforge
    }

    async refresh() {
        await this.#callAPIs()

        if (callModrinth.verifyURL(this.#url)) {
            if (this.#modrinthData) {
                this.#extractModrinth()
            } else if (this.#curseforgeData) {
                this.#extractCurseforge()
            }
        } else if (callCurseForge.verifyURL(this.#url)) {
            if (this.#curseforgeData) {
                this.#extractCurseforge()
            } else if (this.#modrinthData) {
                this.#extractModrinth()
            }
        }
    }

    async getDownloadLink(loader, version) {
        if (!this.#versions.includes(version)) {
            let error = new Error(`Attempted to download ${this.#name} for ${version}, but it's not available for that version.`)
            error.name = "Mod unavailable for this version"
            throw error
        }

        let downloadLink
        if (callModrinth.verifyURL(this.#url)) {
            const mod_slug = this.#url.replace(/\/$/, "").split("/").pop()
            downloadLink = await callModrinth.getDownloadLink(mod_slug, loader, version)
        } else if (this.#curseforgeData) {
            downloadLink = await callCurseForge.getDownloadLink(this.#curseforgeData, loader, version)
        } else {
            let error = new Error(`Attempted to download ${this.#name}, but it does not have a valid data for Modrinth or CurseForge.`)
            error.name = "Invalid data"
            throw error
        }

        if (downloadLink == false) {
            console.log(`Download link for ${this.#name} is ${downloadLink}`)
        }
        return downloadLink
    }

    createDict() {
        return {
            priority: this.priority.createDict(),
            name: this.#name,
            id: this.#id,
            url: this.#url,
            versions: this.#versions,
            tablePosition: this.tablePosition
        }
    }

    async #callAPIs() {
        const mod_slug = this.#url.replace(/\/$/, "").split("/").pop()
        if (callModrinth.verifyURL(this.#url)) {
            this.#modrinthData = await callModrinth.modData(mod_slug)
        }
        if (callCurseForge.verifyURL(this.#url)) {
            this.#curseforgeData = await callCurseForge.modData(mod_slug)
        }
    }

    #extractModrinth() {
        if (!this.#modrinthData) {
            return null
        }

        this.#name = this.#modrinthData.title
        this.#id = this.#modrinthData.id
        this.#versions = this.#modrinthData.game_versions
    }

    #extractCurseforge() {
        if (!this.#curseforgeData) {
            return null
        }

        this.#name = this.#curseforgeData.name
        this.#id = this.#curseforgeData.id
        this.#versions = callCurseForge.sortVersionList(this.#curseforgeData)
        if (!this.#url) {
            this.#url = this.#curseforgeData.links.websiteUrl
        }
    }
}

export default { Priority, Mod }