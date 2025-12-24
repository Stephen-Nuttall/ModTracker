import callModrinth from '../data/callModrinth.js'
import callCurseForge from '../data/callCurseForge.js'
import mod from './mod.js'

class Profile {
    _modList = []
    selectedVersion = "1.21.5"
    name = "New Profile"

    constructor(
        modList = [],
        selectedVersion = "1.21.5",
        name = "New Profile"
    ) {
        this._modList = modList
        this.selectedVersion = selectedVersion
        this.name = name
    }

    toString() {
        let output = `${this.name}:\n`

        if (this._modList.length > 0) {
            this._modList.forEach(mod => {
                output += mod.toString() + "\n"
            })
        } else {
            output += "No mods in profile"
        }

        return output.trim()
    }

    getModList() { return this._modList }

    getNumMods() { return this._modList.length }

    getMod(index) { return this._modList[index] }

    getSelectedVersion() { return this.selectedVersion }

    async addMod(url) {
        if (url === undefined || !(callModrinth.verifyURL(url) || callCurseForge.verifyURL(url))) {
            const error = new Error("URL provided is invalid.")
            error.name = "Invalid URL"
            throw error
        }

        const priority = new mod.Priority("High Priority", 255, 128, 0)
        let newMod = new mod.Mod(url, priority, this._modList.length)

        await newMod.refresh()

        if (newMod.validData()) {
            this._modList.push(newMod)
        } else {
            throw new Error("Mod does not have valid modrinth data or curseforge data.")
        }
    }

    removeMod(index) {
        if (index < 0 || index >= this._modList.length) {
            throw new RangeError(`Tried to remove mod at index ${index}, but that index is out of range!`)
        }

        const mod = this._modList[index]
        if (mod) {
            this._modList.splice(index, 1)
        } else {
            throw new Error(`Tried to remove mod at index ${index}, but it was falsey!`)
        }
    }

    async refresh() {
        await Promise.all(
            this._modList.map(async curMod => {
                try {
                    await curMod.refresh()
                } catch (error) {
                    console.error(`Failed to refresh mod '${curMod.name}': ${error}`)
                }
            })
        )
    }

    async downloadReadyMods(selectedModLoader, preventDownload = false) {
        let downloadLinks = await Promise.all(
            this._modList.map(async (curMod) => {
                try {
                    const link = await curMod.getDownloadLink(selectedModLoader, this.selectedVersion);
                    return link;
                } catch (error) {
                    if (error.name === "Mod unavailable for this version" ||
                        error.name === "Invalid data" ||
                        error.name === "Download Unavailable") {
                        return false;
                    } else {
                        throw error; // Re-throw unexpected errors
                    }
                }
            })
        );

        downloadLinks.forEach(link => {
            if (link && !preventDownload) {
                window.open(link, "_blank")
            }
        })

        return downloadLinks
    }

    getPercentReady() {
        let readyMods = 0

        this._modList.forEach(mod => {
            if (mod.getVersionList().includes(this.selectedVersion)) {
                readyMods++
            }
        })

        if (this._modList.length === 0) {
            return 0
        } else {
            return ((readyMods / this._modList.length) * 100).toFixed(2)
        }
    }

    toJSON() {
        return this.createDict()
    }

    createDict() {
        const modlist = this._modList.map(mod => mod.createDict())
        return {
            name: this.name,
            version: this.selectedVersion,
            modlist: modlist
        }
    }
}

class ProfileManager {
    _profileList
    _priorityList
    _storageLocation = "profiles"
    _defaultPriorityList = [
        new mod.Priority("High Priority", 255, 128, 0),
        new mod.Priority("Medium Priority", 255, 196, 0),
        new mod.Priority("Low Priority", 255, 255, 0)
    ]

    constructor(profileList = [], priorityList = this._defaultPriorityList) {
        this._profileList = profileList
        this._priorityList = priorityList
    }

    getNumProfiles() { return this._profileList.length }

    getProfileList() { return this._profileList }

    getProfile(index) { return this._profileList[index] }

    getNumPriorities() { return this._priorityList.length }

    getPriorityList() { return this._priorityList }

    getPriority(index) { return this._priorityList[index] }

    addProfile(newProfile, profileName = null) {
        if (!newProfile) {
            throw new Error("Attempted to add a blank profile object to this profile manager.")
        }
        else if (profileName) {
            newProfile.name = profileName
        }

        this._profileList.push(newProfile)
        this._sortModLists()
        this.saveToStorage()
    }

    removeProfile(numProfile) {
        this._profileList.splice(numProfile, 1)
        this._sortModLists()
        this.saveToStorage()
    }

    addPriority(newPriority) {
        this._priorityList.push(newPriority)
        this.saveToStorage()
    }

    removePriority(index) {
        this._priorityList.splice(index, 1)
        this.saveToStorage()
    }

    refreshProfiles() {
        for (const profile of this._profileList) {
            profile.refresh()
        }
        this.saveToStorage()
    }

    saveToStorage() {
        localStorage.setItem(this._storageLocation, JSON.stringify(this._createDict(), null, 4))
    }

    hash() {
        return JSON.stringify(this._createDict())
    }

    _createDict() {
        const profileList = this._profileList.map(profile => profile.toJSON())
        const priorityList = this._priorityList.map(priority => priority.createDict())

        return {
            profileList,
            priorityList
        }
    }

    _sortModLists() {
        for (let profile of this._profileList) {
            let modlist = profile.getModList()
            modlist.sort((a, b) => a.lessThan(b) ? -1 : 1)
        }
    }
}

export default { Profile, ProfileManager }