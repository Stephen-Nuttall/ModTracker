import { expect, test, describe } from 'vitest'
import loadFromJson from '../data/loadFromJson.js'
import mod from '../data/mod.js'
import profile from '../data/profile.js'

const priorityData_1 = {
    name: "Priority 1",
    r: 5,
    g: 10,
    b: 15
}

const comparisonPriority_1 = new mod.Priority("Priority 1", 5, 10, 15)

const priorityData_2 = {
    name: "Priority 2",
    r: 255,
    g: 250,
    b: 245
}

const comparisonPriority_2 = new mod.Priority("Priority 2", 255, 250, 245)

const modData_fullyDefined = {
    priority: priorityData_1,
    name: "Fully defined mod",
    id: 158932801,
    url: "https://modrinth.com/mod/sodium/",
    versions: ["1.21.11", "1.21.10", "1.21.9"],
    tablePosition: 2
}

const comparisonMod_fullyDefined = new mod.Mod(
    "https://modrinth.com/mod/sodium/",
    comparisonPriority_1,
    2,
    "Fully defined mod",
    158932801,
    ["1.21.11", "1.21.10", "1.21.9"]
)

const modData_partiallyDefined = {
    name: "Partially definined mod",
    id: 158932801,
    url: "https://modrinth.com/mod/sodium/",
    versions: ["1.21.11", "1.21.10", "1.21.9"],
    tablePosition: 2
}

const comparisonMod_partiallyDefined = new mod.Mod(
    "https://modrinth.com/mod/sodium/",
    undefined,
    2,
    "Partially definined mod",
    158932801,
    ["1.21.11", "1.21.10", "1.21.9"]
)

const modData_onlyOptionalParams = {
    name: "Mod with only optional params defined",
    id: 158932801,
    versions: ["1.21.11", "1.21.10", "1.21.9"],
}

const comparisonMod_onlyOptionalParams = new mod.Mod(
    undefined,
    undefined,
    undefined,
    "Mod with only optional params defined",
    158932801,
    ["1.21.11", "1.21.10", "1.21.9"]
)

const modData_onlyURL = {
    url: "https://modrinth.com/mod/sodium/",
    name: "Mod with only URL defined"
}

const comparisonMod_onlyURL = new mod.Mod(
    "https://modrinth.com/mod/sodium/",
    undefined,
    undefined,
    "Mod with only URL defined"
)

const profileData_fullyDefined = {
    name: "Fully defined profile",
    version: "1.21.10",
    modlist: [modData_fullyDefined, modData_onlyURL, modData_partiallyDefined, modData_onlyOptionalParams]
}

const comparisonProfile_fullyDefined = new profile.Profile(
    [comparisonMod_fullyDefined, comparisonMod_onlyURL, comparisonMod_partiallyDefined, comparisonMod_onlyOptionalParams],
    "1.21.10",
    "Fully defined profile"
)

const comparisonProfile_blank = new profile.Profile()

const profileData_extra = {
    name: "Extra profile",
    version: "26.1",
    modlist: [modData_fullyDefined, modData_onlyURL]
}

const comparisonProfile_extra = new profile.Profile(
    [comparisonMod_fullyDefined, comparisonMod_onlyURL],
    "26.1",
    "Extra profile"
)

const managerData_fullyDefined = {
    profileList: [profileData_fullyDefined, profileData_extra],
    priorityList: [priorityData_1, priorityData_2]
}

const comparisonManager_fullyDefined = new profile.ProfileManager(
    [comparisonProfile_fullyDefined, comparisonProfile_extra],
    [comparisonPriority_1, comparisonPriority_2]
)

const comparisonManager_blank = new profile.ProfileManager()



describe("Dict to Mod", () => {
    test("Everything defined", () => {
        const resultMod = loadFromJson.createMod(modData_fullyDefined)
        expect(comparisonMod_fullyDefined.equals(resultMod)).toBe(true)
    })

    test("JSON partially defined", () => {
        const resultMod_1 = loadFromJson.createMod(modData_partiallyDefined)
        const resultMod_2 = loadFromJson.createMod(modData_onlyOptionalParams)
        const resultMod_3 = loadFromJson.createMod(modData_onlyURL)

        expect(comparisonMod_partiallyDefined.equals(resultMod_1)).toBe(true)
        expect(comparisonMod_onlyOptionalParams.equals(resultMod_2)).toBe(true)
        expect(comparisonMod_onlyURL.equals(resultMod_3)).toBe(true)
    })

    test("Refreshed mod object", () => {
        let comparisonMod = new mod.Mod("https://modrinth.com/mod/sodium/")

        const data = comparisonMod.createDict()
        const resultMod = loadFromJson.createMod(data)
        expect(comparisonMod.equals(resultMod)).toBe(true)

        comparisonMod.refresh()

        const data_refreshed = comparisonMod.createDict()
        expect(data == data_refreshed).toBe(false)

        const resultMod_refreshed = loadFromJson.createMod(data_refreshed)
        expect(comparisonMod.equals(resultMod_refreshed)).toBe(true)
    })
})

describe("Dict to Profile", () => {
    test("Everything defined, do not require valid URL", () => {
        const resultProfile = loadFromJson.createProfile(profileData_fullyDefined, false)

        expect(resultProfile.name).toBe(comparisonProfile_fullyDefined.name)
        expect(resultProfile.version).toBe(comparisonProfile_fullyDefined.version)

        const resultModList = resultProfile.getModList()
        const comparisonModList = comparisonProfile_fullyDefined.getModList()

        expect(resultModList.length,
            `Resulting profile object's mod list:\n${resultModList}\n\n` +
            `Comparison profile object's mod list:\n${comparisonModList}`
        ).toBe(comparisonModList.length)

        for (let i = 0; i < resultModList.length; i++) {
            expect(resultModList[i].equals(comparisonModList[i])).toBe(true)
        }
    })

    test("Everything defined, require valid URL", () => {
        const resultProfile = loadFromJson.createProfile(profileData_fullyDefined)

        expect(resultProfile.name).toBe(comparisonProfile_fullyDefined.name)
        expect(resultProfile.version).toBe(comparisonProfile_fullyDefined.version)

        const resultModList = resultProfile.getModList()
        const comparisonModList = comparisonProfile_fullyDefined.getModList()

        expect(resultModList.length,
            `Resulting profile object's mod list:\n${resultModList}\n\n` +
            `Comparison profile object's mod list:\n${comparisonModList}`
        ).toBe(comparisonModList.length - 1)

        for (let i = 0; i < resultModList.length; i++) {
            expect(resultModList[i].equals(comparisonModList[i])).toBe(true)
        }
    })

    test("Blank data", () => {
        expect(() => { loadFromJson.createProfile({}, false) }).toThrowError("Cannot load profile from this data. Data.modlist is undefined.")
        const resultProfile = loadFromJson.createProfile({ modlist: [] }, false)

        expect(resultProfile.name).toBe(comparisonProfile_blank.name)
        expect(resultProfile.version).toBe(comparisonProfile_blank.version)
        expect(resultProfile.getModList()).toStrictEqual([])
    })
})

describe("Dict to Profile Manager", () => {
    const resultManager = loadFromJson.createProfileManager(managerData_fullyDefined)

    test("Fully defined - Verify Profile List", () => {
        const resultProfileList = resultManager.getProfileList()
        const comparisonProfileList = comparisonManager_fullyDefined.getProfileList()
        expect(resultProfileList.length).toBe(comparisonProfileList.length)

        for (let i = 0; i < resultProfileList.length; i++) {
            const resultProfile = resultProfileList[i]
            const comparisonProfile = comparisonProfileList[i]

            expect(resultProfile.name, `Result profile ${i} does not match comparison profile ${i}`).toBe(comparisonProfile.name)
            expect(resultProfile.version, `Result profile ${i} does not match comparison profile ${i}`).toBe(comparisonProfile.version)

            const resultModList = resultProfile.getModList()
            const comparisonModList = comparisonProfile_fullyDefined.getModList()
            for (let i = 0; i < resultModList.length; i++) {
                expect(resultModList[i].equals(comparisonModList[i])).toBe(true)
            }
        }
    })

    test("Fully defined - Verify Priority List", () => {
        const resultPriorityList = resultManager.getPriorityList()
        const comparisonPriorityList = comparisonManager_fullyDefined.getPriorityList()
        expect(resultPriorityList.length).toBe(comparisonPriorityList.length)

        for (let i = 0; i < resultPriorityList.length; i++) {
            const resultPriority = resultPriorityList[i]
            const comparisonPriority = comparisonPriorityList[i]

            expect(resultPriority.name).toBe(comparisonPriority.name)
            expect(resultPriority.r).toBe(comparisonPriority.r)
            expect(resultPriority.g).toBe(comparisonPriority.g)
            expect(resultPriority.b).toBe(comparisonPriority.b)
        }
    })

    test("Blank data", () => {
        expect(() => { loadFromJson.createProfileManager({}) }).toThrowError("Cannot load profile manager from this data. Dictionary is blank")

        const resultManager_blankData = loadFromJson.createProfileManager({ profileList: [], priorityList: [] })
        expect(resultManager_blankData.getProfileList()).toStrictEqual(comparisonManager_blank.getProfileList())
        expect(resultManager_blankData.getPriorityList() == comparisonManager_blank.getPriorityList()).toBe(false) // default priority list
    })
})
