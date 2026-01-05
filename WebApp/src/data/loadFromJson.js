import mod from './mod.js'
import profile from './profile.js'

// convert JSON data into a priority object
function createPriority(data) {
    if (data !== undefined && Object.keys(data).length === 0) {
        let error = new TypeError("Cannot load priority from this data. Dictionary is blank.")
        error.name = "Blank priority data"
        throw error
    }

    return new mod.Priority(
        data?.name,
        data?.r,
        data?.g,
        data?.b
    )
}

// create a list of priority objects from JSON data
function createPriorityList(dataList) {
    const newPriorityList = []

    for (const entry of dataList) {
        const priorityObj = createPriority(entry)
        newPriorityList.push(priorityObj)
    }

    return newPriorityList
}

// convert JSON data into a mod object
function createMod(data) {
    if (data === undefined) {
        let error = new TypeError("Cannot load mod from this data. Data is undefined.")
        error.name = "Undefined mod data"
        throw error
    } else if (Object.keys(data).length === 0) {
        let error = new TypeError("Cannot load mod from this data. Dictionary is blank.")
        error.name = "Blank mod data"
        throw error
    }

    const priorityLevel = createPriority(data.priority)

    return new mod.Mod(
        data.url,
        priorityLevel,
        data.tablePosition,
        data.name,
        data.id,
        data.versions
    )
}

// convert JSON data into a profile object
function createProfile(data, requireValidModURL = true) {
    if (data === undefined) {
        let error = new TypeError("Cannot load profile from this data. Data is undefined.")
        error.name = "Undefined profile data"
        throw error
    } else if (data.modlist === undefined) {
        let error = new TypeError("Cannot load profile from this data. Data.modlist is undefined.")
        error.name = "Undefined profile modlist"
        throw error
    }

    const newModList = []

    for (const entry of data.modlist) {
        const modObj = createMod(entry)

        if (!requireValidModURL || modObj.verifyURL()) {
            newModList.push(modObj)
        }
    }

    return new profile.Profile(newModList, data.version, data.name)
}

// create a list of profile objects fron JSON data
function createProfileList(dataList, requireValidModURL = true) {
    const newProfileList = []

    for (const entry of dataList) {
        const profile = createProfile(entry, requireValidModURL)
        newProfileList.push(profile)
    }

    return newProfileList
}

// convert JSON data into a profile manager object
function createProfileManager(data) {
    if (data === undefined) {
        let error = new TypeError("Cannot load profile manager from this data. Data is undefined.")
        error.name = "Undefined manager data"
        throw error
    } else if (Object.keys(data).length === 0) {
        let error = new TypeError("Cannot load profile manager from this data. Dictionary is blank.")
        error.name = "Blank manager data"
        throw error
    }

    const profileList = createProfileList(data.profileList)
    const priorityList = createPriorityList(data.priorityList)

    return new profile.ProfileManager(profileList, priorityList)
}

export default {
    createMod,
    createProfile,
    createProfileManager
}
