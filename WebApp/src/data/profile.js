import callModrinth from '../data/callModrinth.js'
import callCurseForge from '../data/callCurseForge.js'
import mod from './mod.js'

class Profile {
    #modList = []
    selectedVersion = "1.21.5"
    name = "New Profile"

    constructor(
        modList = [],
        selectedVersion = "1.21.5",
        name = "New Profile"
    ) {
        this.#modList = modList
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

    getNumMods() { return this.#modList.length }

    getMod(index) { return this.#modList[index] }

    getSelectedVersion() { return this.selectedVersion }

    async addMod(url) {
        if (url === undefined || !(callModrinth.verifyURL(url) || callCurseForge.verifyURL(url))) {
            throw new Error("URL provided is invalid.")
        }

        const priority = new mod.Priority("High Priority", 255, 128, 0)
        let newMod = new mod.Mod(url, priority, this.#modList.length)

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
    #storageLocation = "profiles"
    #defaultPriorityList = [
        new mod.Priority("High Priority", 255, 128, 0),
        new mod.Priority("Medium Priority", 255, 196, 0),
        new mod.Priority("Low Priority", 255, 255, 0)
    ]

    constructor(profileList = [], priorityList = this.#defaultPriorityList, allowWriteToFile = true) {
        this.#profileList = profileList
        this.#priorityList = priorityList
        this.#allowWriteToFile = allowWriteToFile
    }

    getNumProfiles() { return this.#profileList.length }

    getProfileList() { return this.#profileList }

    getProfile(index) { this.#profileList[index] }

    getNumPriorities() { return this.#priorityList.length }

    getPriorityList() { return this.#priorityList }

    getPriority(index) { this.#priorityList[index] }

    addProfile(newProfile, profileName = null, saveToFile = true) {
        if (!newProfile) {
            throw new Error("Attempted to add a blank profile object to this profile manager.")
        }
        else if (profileName) {
            newProfile.name = profileName
        }

        this.#profileList.push(newProfile)
        this.#sortModLists()

        if (saveToFile && this.#allowWriteToFile) {
            this.saveToStorage()
        }
    }

    removeProfile(numProfile) {
        this.#profileList.splice(numProfile, 1)
        this.#sortModLists()
        this.saveToStorage()
    }

    addPriority(newPriority) { this.#priorityList.push(newPriority) }

    removePriority(index) { this.#priorityList.splice(index, 1) }

    saveToStorage() {
        localStorage.setItem(this.#storageLocation, JSON.stringify(this.#createDict(), null, 4))
    }

    loadFromStorage() {
        const storedData = localStorage.getItem('profiles')
        const parsedData = JSON.parse(storedData)

        this.#importData(parsedData)
    }

    #importData(data, requireValidModURL = true) {
        // TODO: loadFromJson.js
    }

    #createDict() {
        const profileList = this.#profileList.map(profile => profile.createDict())
        const priorityList = this.#priorityList.map(priority => priority.createDict())

        return {
            profileList,
            priorityList
        }
    }

    #sortModLists() {
        for (let profile of this.#profileList) {
            let modlist = profile.getModList()
            modlist.sort((a, b) => a.lessThan(b) ? -1 : 1)
        }
    }
}

export default { Profile, ProfileManager }