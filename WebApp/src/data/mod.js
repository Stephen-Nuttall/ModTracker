import callModrinth from '../data/callModrinth.js'
import callCurseForge from '../data/callCurseForge.js'
import { error } from 'console'

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
    #ID = -1
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
        this.#ID = modID
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
            this.#ID === other.#ID &&
            this.#url === other.#url &&
            JSON.stringify(this.#versions) === JSON.stringify(other.#versions)
        )
    }

    // Getters
    getName() { return this.#name }

    getID() { return this.#ID }

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

        const mod_slug = this.#url.replace(/\/$/, "").split("/").pop()
        let downloadLink

        if (this.#modrinthData) {
            downloadLink = await callModrinth.getDownloadLink(mod_slug, loader, version)
        } else if (this.#curseforgeData) {
            downloadLink = await callCurseForge.getDownloadLink(this.#curseforgeData, this.#ID, loader, version)
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
            id: this.#ID,
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
        this.#ID = this.#modrinthData.id
        this.#versions = this.#modrinthData.game_versions
    }

    #extractCurseforge() {
        if (!this.#curseforgeData) {
            return null
        }
        this.#name = this.#curseforgeData.name
        this.#ID = this.#curseforgeData.id
        this.#versions = callCurseForge.sortVersionList(this.#curseforgeData)
        if (!this.#url) {
            this.#url = this.#curseforgeData.links.websiteUrl
        }
    }
}

class Profile {
    #modList = []
    #priorityList
    selectedVersion = "1.21.5"
    name = "New Profile"

    constructor(
        modList = [],
        priorityList = [],
        selectedVersion = "1.21.5",
        name = "New Profile"
    ) {
        this.#modList = modList
        this.#priorityList = priorityList
        this.selectedVersion = selectedVersion
        this.name = name
    }

    toString() {
        let output = `${this.name}:\n`

        if (this.#modList.length > 0) {
            this.#modList.forEach(mod => {
                output += mod.toString() + "\n"
            })
        } else {
            output += "No mods in profile"
        }

        return output.trim()
    }

    getModList() { return this.#modList }

    getMod(index) { return this.#modList[index] }

    getPriorityList() { return this.#priorityList }

    getSelectedVersion() { return this.selectedVersion }

    async addMod(url) {
        if (url === undefined || !(callModrinth.verifyURL(url) || callCurseForge.verifyURL(url))) {
            throw new Error("URL provided is invalid.")
        }

        const priority = this.#priorityList[0] || new Priority("High Priority", 255, 128, 0)
        let newMod = new Mod(url, priority, this.#modList.length)

        await newMod.refresh()
        if (newMod.validData()) {
            this.#modList.push(newMod)
        } else {
            throw new Error("Mod does not have valid modrinth data or curseforge data.")
        }
    }

    removeMod(index) {
        if (index < 0 || index >= this.#modList.length) {
            throw new RangeError(`Tried to remove mod at index ${index}, but that index is out of range!`)
        }

        const mod = this.#modList[index]
        if (mod) {
            this.#modList.splice(index, 1)
        } else {
            throw new Error(`Tried to remove mod at index ${index}, but it was falsey!`)
        }
    }

    async refresh(/*selectedVersion = null*/) {
        // if (selectedVersion != null) {
        //     this.selectedVersion = selectedVersion
        // }

        this.#modList.forEach(async curMod => {
            await curMod.refresh()
        })
    }

    async downloadReadyMods(selectedModLoader, preventDownload = false) {
        let downloadLinks = []

        for (const mod of this.#modList) {
            try {
                const link = await mod.getDownloadLink(selectedModLoader, this.selectedVersion)
                downloadLinks.push(link)
            } catch (error) {
                if (error.name = "Mod unavailable for this version") {
                    downloadLinks.push(false)
                } else if (error.name = "Invalid data") {
                    downloadLinks.push(false)
                } else if (error.name = "Download Unavailable") {
                    downloadLinks.push(false)
                } else {
                    throw error
                }
            }
        }

        downloadLinks.forEach(link => {
            if (link && !preventDownload) {
                window.open(link, "_blank")
            }
        })

        return downloadLinks
    }

    exportProfile(path, profileName, printDebugMessage = true) {
        if (path) {
            const profile = new Profile(this.#modList, this.#priorityList, this.selectedVersion, profileName)
            if (printDebugMessage) {
                console.log(`Exporting profile data to ${path}`)
            }

            try {
                const fs = require("fs")
                fs.writeFileSync(path, JSON.stringify(profile.createDict(), null, 4))
            } catch (error) {
                throw new Error("EXCEPTION OCCURRED DURING EXPORT: " + error)
            }
        } else {
            throw new Error("EXPORT PATH INVALID.")
        }
    }

    getPercentReady() {
        let readyMods = 0

        this.#modList.forEach(mod => {
            if (mod.getVersionList().includes(this.selectedVersion)) {
                readyMods++
            }
        })

        if (this.#modList.length === 0) {
            return 0
        } else {
            return (readyMods / this.#modList.length) * 100
        }
    }

    createDict() {
        const modlist = this.#modList.map(mod => mod.createDict())
        return {
            name: this.name,
            version: this.selectedVersion,
            modlist
        }
    }
}

class ProfileManager {
    #profileList
    #priorityList
    #allowWriteToFile
    #defaultPriorityList = [
        new Priority("High Priority", 255, 128, 0),
        new Priority("Medium Priority", 255, 196, 0),
        new Priority("Low Priority", 255, 255, 0)
    ]

    constructor(profileList = [], priorityList = this.#defaultPriorityList, allowWriteToFile = true) {
        this.#profileList = profileList
        this.#priorityList = priorityList
        this.#allowWriteToFile = allowWriteToFile
    }

    getNumProfiles() { return this.#profileList.length }

    getProfileList() { return this.#profileList }

    getPriorityList() { return this.#priorityList }

    getProfile(index) {
        if (this.#profileList.length > 0) {
            try {
                return this.#profileList[index]
            } catch (e) {
                return null
            }
        } else {
            return null
        }
    }

    addProfile(newProfile, profileName = null, saveToFile = true) {
        if (!newProfile) {
            throw new Error("Attempted to add a blank profile object to this profile manager.")
        }
        else if (profileName) {
            newProfile.name = profileName
        }

        this.#profileList.push(newProfile)
        this.updatePriorityLists()
        this.sortModLists()

        if (saveToFile && this.#allowWriteToFile) {
            this.saveToJson()
        }
    }

    addPriority(newPriority) {
        this.#priorityList.push(newPriority)
    }

    saveToJson(filename = "mods.json", updatedProfile = null, editedProfileIndex = -1) {
        if (updatedProfile && editedProfileIndex >= 0) {
            const currentProfile = this.#profileList[editedProfileIndex]
            const oldName = currentProfile.name

            this.#profileList[editedProfileIndex] = updatedProfile
            this.#profileList[editedProfileIndex].name = oldName
        }

        if (this.#allowWriteToFile) {
            const appdata = process.env.APPDATA
            const directory = path.join(appdata, "ModTracker")

            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true })
            }

            const jsonPath = path.join(directory, filename)
            console.log(`Saving data to ${jsonPath}`)
            fs.writeFileSync(jsonPath, JSON.stringify(this.#profileList.map(profile => profile.createDict()), null, 4))
        }
    }

    deleteProfile(numProfile) {
        this.#profileList.splice(numProfile, 1)
        this.sortModLists()
        this.updatePriorityLists()
        this.saveToJson()
    }

    sortModLists() {
        this.#profileList.forEach(profile => {
            profile.modList.sort((a, b) => a.lessThan(b) ? -1 : 1)
        })
    }

    updatePriorityLists() {
        this.#profileList.forEach(profile => {
            profile.modList.forEach(mod => {
                if (!this.#priorityList.some(priority => priority.equals(mod.priority))) {
                    this.#priorityList.push(mod.priority)
                }
            })
        })

        this.#profileList.forEach(profile => {
            profile.priorityList = this.#priorityList
        })
    }

    importFromJSON(path, requireValidModURL = true) {
        if (path) {
            return loadFromJson.createProfile(path, requireValidModURL)
        }
    }

    importFromFolder(directory) {
        return loadFromJar.createProfileFromFolder(directory)
    }

    createDict() {
        const profileList = this.#profileList.map(profile => profile.createDict())
        const priorityList = this.#priorityList.map(priority => priority.createDict())

        return {
            profileList,
            priorityList
        }
    }
}

export default { Priority, Mod, Profile, ProfileManager }