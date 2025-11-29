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
        if (!(other instanceof Priority)) {
            return false
        }
        return this.name === other.name && this.r === other.r && this.g === other.g && this.b === other.b
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
        modName = "Untitled Mod",
        modID = -1,
        modVersions = ["No versions found"],
        modPriority = new Priority(),
        tablePosition = -1,
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

        if (url !== null) {
            // console.log("This mod was initialized with a URL. Note that an API" +
            //     " call will not be made automatically, so refresh() must be manually" +
            //     " called. This is because Javascript does not support async functions" +
            //     " in a class's constructor.")
        }
        if (modrinthData) {
            this.#extractModrinth()
        } else if (curseforgeData) {
            this.#extractCurseforge()
        }
    }

    toString() {
        return `${this.#name}, version: ${this.getCurrentVersion()}, priority: ${this.priority}`
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

    getURL() { return this.#url }

    getVersions() { return this.#versions }

    getModrinthData() { return this.#modrinthData }

    getCurseforgeData() { return this.#curseforgeData }

    getTablePosition() { return this.tablePosition }

    isValid() { return this.#modrinthData || this.#curseforgeData }

    verifyURL() {
        const curseforge = callModrinth.verifyURL(this.#url)
        const modrinth = callCurseForge.verifyURL(this.#url)
        return modrinth || curseforge
    }

    async refresh() {
        await this.callAPIs()

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

    async callAPIs() {
        const mod_slug = this.#url.replace(/\/$/, "").split("/").pop()
        if (callModrinth.verifyURL(this.#url)) {
            this.#modrinthData = await callModrinth.modData(mod_slug)
        }
        if (callCurseForge.verifyURL(this.#url)) {
            this.#curseforgeData = await callCurseForge.modData(mod_slug)
        }
    }

    downloadMod(loader, version, preventDownload = false) {
        const mod_slug = this.#url.replace(/\/$/, "").split("/").pop()
        let downloadLink = false
        if (this.#modrinthData) {
            downloadLink = callModrinth.downloadMod(mod_slug, loader, version)
        } else if (this.#curseforgeData) {
            downloadLink = callCurseForge.downloadMod(this.#curseforgeData, this.#ID, loader, version)
        }
        if (downloadLink) {
            if (!preventDownload) {
                window.open(downloadLink, "#blank")
            }
            return downloadLink
        } else {
            return false
        }
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
    modList = []
    priorityList = [
        Priority("High Priority", red = 255, green = 128, blue = 0),
        Priority("Medium Priority", red = 255, green = 196, blue = 0),
        Priority("Low Priority", red = 255, green = 255, blue = 0)
    ]
    selectedVersion = "1.21.5"
    name = "New Profile"

    constructor(
        modList = [],
        priorityList = [
            Priority("High Priority", red = 255, green = 128, blue = 0),
            Priority("Medium Priority", red = 255, green = 196, blue = 0),
            Priority("Low Priority", red = 255, green = 255, blue = 0)
        ],
        selectedVersion = "1.21.5",
        name = "New Profile"
    ) {
        this.modList = modList
        this.priorityList = priorityList
        this.selectedVersion = selectedVersion
        this.name = name
    }

    toString() {
        let output = `${this.name}:\n`

        if (this.modList.length > 0) {
            this.modList.forEach(mod => {
                output += mod.toString() + "\n"
            })
        } else {
            output += "No mods in profile"
        }

        return output.trim()
    }

    getModList() { return this.modList }

    getMod(index) { return this.modList[index] }

    getPriorityList() { return this.priorityList }

    getSelectedVersion() { return this.selectedVersion }

    addMod(inputString) {
        let newMod
        try {
            newMod = new Mod(
                inputString,
                undefined,
                undefined,
                undefined,
                this.priorityList[0],
                this.modList.length
            )
        } catch (error) {
            if (error instanceof RangeError) {
                this.priorityList = [
                    Priority("High Priority", red = 255, green = 128, blue = 0),
                    Priority("Medium Priority", red = 255, green = 196, blue = 0),
                    Priority("Low Priority", red = 255, green = 255, blue = 0)
                ]
                newMod = new Mod(
                    inputString,
                    undefined,
                    undefined,
                    undefined,
                    this.priorityList[0],
                    this.modList.length
                )
            } else {
                throw error
            }
        }
        if (newMod.isValid()) {
            this.modList.push(newMod)
            return true
        } else {
            return false
        }
    }

    removeMod(index) {
        try {
            const mod = this.modList[index]
            if (mod) {
                this.modList.splice(index, 1)
                return true
            } else {
                return false
            }
        } catch (e) {
            return false
        }
    }

    refresh(selectedVersion) {
        this.selectedVersion = selectedVersion
        this.modList.forEach(curMod => {
            curMod.refreshMod()
        })
    }

    downloadReadyMods(selectedModLoader, preventDownload = false) {
        const successfulDownloads = []

        this.modList.forEach(mod => {
            if (mod.getVersionList().includes(this.selectedVersion)) {
                successfulDownloads.push(mod.downloadMod(selectedModLoader, this.selectedVersion, preventDownload))
            } else {
                successfulDownloads.push(false)
            }
        })

        return successfulDownloads
    }

    exportProfile(path, profileName, printDebugMessage = true) {
        if (path) {
            const profile = new Profile(this.modList, this.priorityList, this.selectedVersion, profileName)
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

        this.modList.forEach(mod => {
            if (mod.getVersionList().includes(this.selectedVersion)) {
                readyMods++
            }
        })

        if (this.modList.length === 0) {
            return 0
        } else {
            return (readyMods / this.modList.length) * 100
        }
    }

    createDict() {
        const modlist = this.modList.map(mod => mod.createDict())
        const prioritylist = this.priorityList.map(priority => priority.createDict())

        return {
            name: this.name,
            version: this.selectedVersion,
            modlist,
            priorityList: prioritylist
        }
    }
}

class ProfileManager {
    #profileList
    #priorityList
    #allowWriteToFile

    constructor(profileList = [], priorityList = [], allowWriteToFile = true) {
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