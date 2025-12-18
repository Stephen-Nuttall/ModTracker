import mod from './mod.js'
import profile from './profile.js'

// convert JSON data into a priority object
function createPriority(data) {
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
    const profileList = createProfileList(data.profileList)
    const priorityList = createPriorityList(data.priorityList)

    return new profile.ProfileManager(profileList, priorityList)
}

export default {
    createMod,
    createProfile,
    createProfileManager
}
