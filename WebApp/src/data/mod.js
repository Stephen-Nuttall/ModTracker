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
        return JSON.stringify(this.createDict())
    }
}

class Mod {
    priority = new Priority()
    tablePosition = -1

    _name = "Untitled Mod"
    _id = -1
    _url = null
    _versions = ["No versions found"]

    _modrinthData = null
    _curseforgeData = null

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

        this._name = modName
        this._id = modID
        this._url = url
        this._versions = modVersions
        this._modrinthData = modrinthData
        this._curseforgeData = curseforgeData

        if (modrinthData) {
            this._extractModrinth()
        } else if (curseforgeData) {
            this._extractCurseforge()
        }
    }

    toString() {
        return `${this._name}, latest version: ${this.getCurrentVersion()}, priority: ${this.priority}`
    }

    lessThan(other) {
        if (this.tablePosition > 0 || other.tablePosition > 0) {
            return this.tablePosition < other.tablePosition
        } else {
            return this._name < other._name
        }
    }

    equals(other, enableDebug = false) {
        if (!(other instanceof Mod)) {
            if (enableDebug) {
                console.debug("other is not a mod object")
            }
            return false
        }
        const result = (
            this._name === other._name &&
            this._id === other._id &&
            this._url === other._url &&
            JSON.stringify(this._versions) === JSON.stringify(other._versions)
        )

        if (enableDebug) {
            console.debug(`${this._name} === ${other._name} (${this._name === other._name}) &&\n` +
                `${this._id} === ${other._id} (${this._id === other._id}) &&\n` +
                `${this._url} === ${other._url} (${this._url === other._url}) &&\n` +
                `${JSON.stringify(this._versions)} === ${JSON.stringify(other._versions)} ` +
                `(${JSON.stringify(this._versions) === JSON.stringify(other._versions)})\n= ${result}`)
        }
        return result
    }

    // Getters
    getName() { return this._name }

    getID() { return this._id }

    getCurrentVersion() { return this._versions[this._versions.length - 1] }

    getVersionList() { return this._versions }
    getVersions() { return this._versions }

    getURL() { return this._url }

    getModrinthData() { return this._modrinthData }

    getCurseforgeData() { return this._curseforgeData }

    getTablePosition() { return this.tablePosition }

    validData() { return this._modrinthData != null || this._curseforgeData != null }

    verifyURL() {
        const curseforge = callModrinth.verifyURL(this._url)
        const modrinth = callCurseForge.verifyURL(this._url)
        return modrinth || curseforge
    }

    async refresh() {
        await this._callAPIs()

        if (callModrinth.verifyURL(this._url)) {
            if (this._modrinthData) {
                this._extractModrinth()
            } else if (this._curseforgeData) {
                this._extractCurseforge()
            }
        } else if (callCurseForge.verifyURL(this._url)) {
            if (this._curseforgeData) {
                this._extractCurseforge()
            } else if (this._modrinthData) {
                this._extractModrinth()
            }
        }
    }

    async getDownloadLink(loader, version) {
        if (!this._versions.includes(version)) {
            let error = new Error(`Attempted to download ${this._name} for ${version}, but it's not available for that version.`)
            error.name = "Mod unavailable for this version"
            throw error
        }

        let downloadLink
        if (callModrinth.verifyURL(this._url)) {
            const mod_slug = this._url.replace(/\/$/, "").split("/").pop()
            downloadLink = await callModrinth.getDownloadLink(mod_slug, loader, version)
        } else if (this._curseforgeData) {
            downloadLink = await callCurseForge.getDownloadLink(this._curseforgeData, loader, version)
        } else {
            let error = new Error(`Attempted to download ${this._name}, but it does not have a valid data for Modrinth or CurseForge.`)
            error.name = "Invalid data"
            throw error
        }

        return downloadLink
    }

    createDict() {
        return {
            priority: this.priority.createDict(),
            name: this._name,
            id: this._id,
            url: this._url,
            versions: this._versions,
            tablePosition: this.tablePosition
        }
    }

    async _callAPIs() {
        const mod_slug = this._url.replace(/\/$/, "").split("/").pop()

        if (!(callModrinth.verifyURL(this._url) || callCurseForge.verifyURL(this._url))) {
            let error = new Error("This mod object's URL is neither a valid Modrinth URL or a valid CurseForge URL")
            error.name = "Invalid URL"
            throw error
        }

        if (callModrinth.verifyURL(this._url)) {
            this._modrinthData = await callModrinth.modData(mod_slug)
        }

        if (callCurseForge.verifyURL(this._url)) {
            this._curseforgeData = await callCurseForge.modData(mod_slug)
        }
    }

    _extractModrinth() {
        if (!this._modrinthData) {
            return null
        }

        this._name = this._modrinthData.title
        this._id = this._modrinthData.id
        this._versions = this._modrinthData.game_versions
    }

    _extractCurseforge() {
        if (!this._curseforgeData) {
            return null
        }

        this._name = this._curseforgeData.name
        this._id = this._curseforgeData.id
        this._versions = callCurseForge.sortVersionList(this._curseforgeData)
        if (!this._url) {
            this._url = this._curseforgeData.links.websiteUrl
        }
    }
}

export default { Priority, Mod }