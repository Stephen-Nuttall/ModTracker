import { expect, test, describe, vi } from 'vitest';
import mod from '../data/mod.js'
import profile from '../data/profile.js'

const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
});

const mod_sodium_modrinth = new mod.Mod(
    "https://modrinth.com/mod/sodium",
    new mod.Priority(), -1, "Sodium", "AANobbMI", ["1.21.8", "1.21.9", "1.21.10"]
)
const mod_fabricAPI_modrinth = new mod.Mod(
    "https://modrinth.com/mod/fabric-api",
    new mod.Priority("Test Priority", 33, 55, 77), -1, "Fabric API", "P7dR8mSH",
    ["1.21.8", "1.21.9", "1.21.10", "25w46a", "1.21.11-pre4"]
)
const mod_clothConfig_modrinth = new mod.Mod(
    "https://modrinth.com/mod/cloth-config",
    undefined, 2, "Cloth Config API", "9s6osm5g", ["1.21.8", "1.21.9", "1.21.10"]
)
const mod_sodium_curseforge = new mod.Mod(
    "https://www.curseforge.com/minecraft/mc-mods/sodium",
    new mod.Priority(), -1, "Sodium", 394468, ["1.21.8", "1.21.9", "1.21.10"]
)
const mod_boingBoing_curseforge = new mod.Mod(
    "https://www.curseforge.com/minecraft/mc-mods/boing-boing-items",
    new mod.Priority(), -1, "Boing Boing Items", 1395190, ["1.20", "1.20.1", "1.20.2", "1.21", "1.21.1", "1.21.2"], undefined,
    {
        name: "Boing Boing Items",
        id: 1395190,
        latestFilesIndexes: [
            { "gameVersion": "1.21.1", "fileId": 7284969, "modLoader": 6 },
            { "gameVersion": "1.21.1", "fileId": 7284964, "modLoader": 4 },
            { "gameVersion": "1.20.1", "fileId": 7284967, "modLoader": 1 }
        ]
    }
)
const mod_worldedit_curseforge = new mod.Mod(
    "https://www.curseforge.com/minecraft/mc-mods/worldedit",
    new mod.Priority(), -1,
)
const mod_invalid = new mod.Mod(
    "https://www.curseforge.com/minecrafods/sodium",
    new mod.Priority(), -1, "WorldEdit", 225608, ["1.21.8", "1.21.9", "1.21.10"]
)
const mod_netherHeight_modrinth = new mod.Mod(
    "https://modrinth.com/mod/nether-height-expansion-mod",
    new mod.Priority(), -1, "More Nether Mod", "bcoxXH0y", ["1.20.6", "1.21"]
)
const mod_entityculling_modrinth = new mod.Mod(
    "https://modrinth.com/mod/entityculling",
    new mod.Priority(), -1, "Entity Culling", "NNAgCjsB", ["1.21", "1.21.6", "1.21.8", "1.21.9", "1.21.10"]
)
const mod_JEI_curseforge = new mod.Mod(
    "https://www.curseforge.com/minecraft/mc-mods/jei",
    new mod.Priority(), -1, "Just Enough Items (JEI)", 238222, ["1.20.1", "1.21.1", "1.21.8", "1.21.9", "1.21.10"], undefined,
    {
        name: "Just Enough Items (JEI)",
        id: 238222,
        latestFilesIndexes: [
            { "gameVersion": "1.21.1", "fileId": 7270454, "modLoader": 1 },
            { "gameVersion": "1.21.1", "fileId": 7270453, "modLoader": 4 },
            { "gameVersion": "1.21.1", "fileId": 7270455, "modLoader": 6 },
            { "gameVersion": "1.20.1", "fileId": 7270446, "modLoader": 1 },
            { "gameVersion": "1.20.1", "fileId": 7270445, "modLoader": 4 }
        ]
    }
)

const modlist = [
    mod_sodium_modrinth, mod_fabricAPI_modrinth, mod_clothConfig_modrinth,
    mod_sodium_curseforge, mod_boingBoing_curseforge, mod_worldedit_curseforge, mod_invalid,
    mod_netherHeight_modrinth, mod_entityculling_modrinth, mod_JEI_curseforge
]

describe("Testing Profile Objects", async () => {
    test("Create Profile Objects", () => {
        let profile1 = new profile.Profile()
        let profile2 = new profile.Profile([mod_sodium_modrinth, mod_clothConfig_modrinth, mod_boingBoing_curseforge])
        let profile3 = new profile.Profile([mod_fabricAPI_modrinth, mod_sodium_curseforge, mod_worldedit_curseforge], "1.21")
        let profile4 = new profile.Profile([mod_boingBoing_curseforge, mod_invalid, mod_fabricAPI_modrinth], "1.21.11", "Cool Profile")
    })

    test("Add Mods", async () => {
        let profile1 = new profile.Profile()
        let profile2 = new profile.Profile([mod_sodium_modrinth, mod_clothConfig_modrinth, mod_boingBoing_curseforge])

        try {
            await profile1.addMod("https://modrinth.com/mod/sodium")
        } catch (error) {
            expect(false, "An error occurred while trying to add the first mod to profile object 1: " + error).toBe(true)
        }

        try {
            await profile1.addMod("https://modrinth.com/mod/fabric-api")
        } catch (error) {
            expect(false, "An error occurred while trying to add the second mod to profile object 1: " + error).toBe(true)
        }

        try {
            await profile2.addMod("https://modrinth.com/mod/sodium")
        } catch (error) {
            expect(false, "An error occurred while trying to add a mod to profile object 2: " + error).toBe(true)
        }

        await expect(profile2.addMod()).rejects.toThrowError("URL provided is invalid.")
    })

    test("Remove Mods", () => {
        let profile1 = new profile.Profile([mod_sodium_modrinth, mod_clothConfig_modrinth, mod_boingBoing_curseforge])
        let profile2 = new profile.Profile()

        expect(() => profile1.removeMod(-1)).toThrowError("Tried to remove mod at index -1, but that index is out of range!")
        expect(profile1.getModList().length).toBe(3)

        profile1.removeMod(1)
        expect(profile1.getModList().length).toBe(2)

        expect(() => profile1.removeMod(2)).toThrowError("Tried to remove mod at index 2, but that index is out of range!")
        expect(profile1.getModList().length).toBe(2)

        profile1.removeMod(0)
        profile1.removeMod(0)
        expect(profile1.getModList().length).toBe(0)

        expect(() => profile1.removeMod(0)).toThrowError("Tried to remove mod at index 0, but that index is out of range!")
        expect(profile1.getModList().length).toBe(0)

        expect(() => profile2.removeMod(0)).toThrowError("Tried to remove mod at index 0, but that index is out of range!")
        expect(profile2.getModList().length).toBe(0)
    })

    test("Refresh Profile", async () => {
        let mod_curseforge = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/sodium")
        let mod_modrinth = new mod.Mod("https://modrinth.com/mod/cloth-config")

        let profile1 = new profile.Profile([mod_curseforge, mod_modrinth, mod_fabricAPI_modrinth])
        let profile2 = new profile.Profile()

        await profile1.refresh()
        await profile2.refresh()
    })

    test("Download Ready Mods - Modrinth", async () => {
        let profile1 = new profile.Profile([mod_entityculling_modrinth, mod_netherHeight_modrinth])
        profile1.selectedVersion = "1.21.6"

        const forgeLinks_1 = await profile1.downloadReadyMods("Forge", true)
        expect(forgeLinks_1[0]).toBeTruthy()
        expect(forgeLinks_1[1]).toBeFalsy()

        const fabricLinks_1 = await profile1.downloadReadyMods("Fabric", true)
        expect(fabricLinks_1[0]).toBeTruthy()
        expect(fabricLinks_1[1]).toBeFalsy()

        const neoforgeLinks_1 = await profile1.downloadReadyMods("NeoForge", true)
        expect(neoforgeLinks_1[0]).toBeTruthy()
        expect(neoforgeLinks_1[1]).toBeFalsy()

        const quiltLinks_1 = await profile1.downloadReadyMods("Quilt", true)
        expect(quiltLinks_1[0]).toBeFalsy()
        expect(quiltLinks_1[1]).toBeFalsy()

        profile1.selectedVersion = "1.21"

        const forgeLinks_2 = await profile1.downloadReadyMods("Forge", true)
        expect(forgeLinks_2[0]).toBeTruthy()
        expect(forgeLinks_2[1]).toBeFalsy()

        const fabricLinks_2 = await profile1.downloadReadyMods("Fabric", true)
        expect(fabricLinks_2[0]).toBeTruthy()
        expect(fabricLinks_2[1]).toBeTruthy()

        const neoforgeLinks_2 = await profile1.downloadReadyMods("NeoForge", true)
        expect(neoforgeLinks_2[0]).toBeTruthy()
        expect(neoforgeLinks_2[1]).toBeFalsy()

        const quiltLinks_2 = await profile1.downloadReadyMods("Quilt", true)
        expect(quiltLinks_2[0]).toBeFalsy()
        expect(quiltLinks_2[1]).toBeFalsy()
    }, 10000)

    test("Download Ready Mods - CurseForge", async () => {
        let profile1 = new profile.Profile([mod_JEI_curseforge, mod_boingBoing_curseforge])
        profile1.selectedVersion = "1.21.1"

        const forgeLinks_1 = await profile1.downloadReadyMods("Forge", true)
        expect(forgeLinks_1[0]).toBeTruthy()
        expect(forgeLinks_1[1]).toBeFalsy()

        const fabricLinks_1 = await profile1.downloadReadyMods("Fabric", true)
        expect(fabricLinks_1[0]).toBeTruthy()
        expect(fabricLinks_1[1]).toBeTruthy()

        const neoforgeLinks_1 = await profile1.downloadReadyMods("NeoForge", true)
        expect(neoforgeLinks_1[0]).toBeTruthy()
        expect(neoforgeLinks_1[1]).toBeTruthy()

        const quiltLinks_1 = await profile1.downloadReadyMods("Quilt", true)
        expect(quiltLinks_1[0]).toBeFalsy()
        expect(quiltLinks_1[1]).toBeFalsy()

        profile1.selectedVersion = "1.20.1"

        const forgeLinks_2 = await profile1.downloadReadyMods("Forge", true)
        expect(forgeLinks_2[0]).toBeTruthy()
        expect(forgeLinks_2[1]).toBeTruthy()

        const fabricLinks_2 = await profile1.downloadReadyMods("Fabric", true)
        expect(fabricLinks_2[0]).toBeTruthy()
        expect(fabricLinks_2[1]).toBeFalsy()

        const neoforgeLinks_2 = await profile1.downloadReadyMods("NeoForge", true)
        expect(neoforgeLinks_2[0]).toBeFalsy()
        expect(neoforgeLinks_2[1]).toBeFalsy()

        const quiltLinks_2 = await profile1.downloadReadyMods("Quilt", true)
        expect(quiltLinks_2[0]).toBeFalsy()
        expect(quiltLinks_2[1]).toBeFalsy()
    }, 10000)
})


describe("Testing Profile Manager Objects", () => {
    test("Create Manager Objects", () => {
        let manager1 = new profile.ProfileManager()
        let manager2 = new profile.ProfileManager([], [])
        let manager3 = new profile.ProfileManager([new profile.Profile()])
        let manager4 = new profile.ProfileManager([
            new profile.Profile([mod_sodium_modrinth, mod_clothConfig_modrinth, mod_boingBoing_curseforge]),
            new profile.Profile([mod_entityculling_modrinth, mod_netherHeight_modrinth])
        ])
    })

    test("Add Profiles", () => {
        let managerList = [
            new profile.ProfileManager(),
            new profile.ProfileManager([], []),
            new profile.ProfileManager([new profile.Profile()]),
            new profile.ProfileManager([new profile.Profile(), new profile.Profile()]),
        ]

        for (let manager of managerList) {
            const oldNumProfiles = manager.getNumProfiles()
            manager.addProfile(new profile.Profile())
            expect(manager.getNumProfiles()).toBe(oldNumProfiles + 1)
        }
    })

    test("Remove Profiles", () => {
        let manager1 = new profile.ProfileManager()
        let manager2 = new profile.ProfileManager([new profile.Profile()])
        let manager3 = new profile.ProfileManager([new profile.Profile(), new profile.Profile(), new profile.Profile()])

        expect(manager1.getNumProfiles()).toBe(0)
        manager1.removeProfile(0)
        expect(manager1.getNumProfiles()).toBe(0)
        manager1.removeProfile(2)
        expect(manager1.getNumProfiles()).toBe(0)
        manager1.removeProfile(-1)
        expect(manager1.getNumProfiles()).toBe(0)

        expect(manager2.getNumProfiles()).toBe(1)
        manager2.removeProfile(0)
        expect(manager2.getNumProfiles()).toBe(0)
        manager2.removeProfile(0)
        expect(manager2.getNumProfiles()).toBe(0)

        expect(manager3.getNumProfiles()).toBe(3)
        manager3.removeProfile(1)
        expect(manager3.getNumProfiles()).toBe(2)
        manager3.removeProfile(0)
        expect(manager3.getNumProfiles()).toBe(1)
        manager3.removeProfile(-1)
        expect(manager3.getNumProfiles()).toBe(0)
    })

    test("Add/Remove Priorities", () => {
        let manager1 = new profile.ProfileManager()
        let manager2 = new profile.ProfileManager([], [new mod.Priority("Priority 1")])

        // Adding Priorities
        expect(manager1.getNumPriorities()).toBe(3)
        manager1.addPriority(new mod.Priority("Priority 1"))
        expect(manager1.getNumPriorities()).toBe(4)

        expect(manager2.getNumPriorities()).toBe(1)
        manager2.addPriority(new mod.Priority("Priority 2"))
        expect(manager2.getNumPriorities()).toBe(2)

        // Removing Priorities
        manager1.removePriority(1)
        expect(manager1.getNumPriorities()).toBe(3)
        manager1.removePriority(0)
        expect(manager1.getNumPriorities()).toBe(2)
        manager1.removePriority(-1)
        expect(manager1.getNumPriorities()).toBe(1)

        manager2.removePriority(1)
        expect(manager2.getNumPriorities()).toBe(1)
        manager2.removePriority(0)
        expect(manager2.getNumPriorities()).toBe(0)
    })

    test("Save to Storage", () => {
        let manager = new profile.ProfileManager(
            [new profile.Profile([mod_sodium_modrinth, mod_clothConfig_modrinth, mod_boingBoing_curseforge]), new profile.Profile()])

        manager.saveToStorage()
        console.log(localStorageMock.getItem("profiles"))
        expect(localStorageMock.getItem("profiles")).toBe(`{
    "profileList": [
        {
            "name": "New Profile",
            "version": "1.21.5",
            "modlist": [
                {
                    "priority": {
                        "name": "New Priority Level",
                        "r": 255,
                        "g": 255,
                        "b": 255
                    },
                    "name": "Sodium",
                    "id": "AANobbMI",
                    "url": "https://modrinth.com/mod/sodium",
                    "versions": [
                        "1.21.8",
                        "1.21.9",
                        "1.21.10"
                    ],
                    "tablePosition": -1
                },
                {
                    "priority": {
                        "name": "New Priority Level",
                        "r": 255,
                        "g": 255,
                        "b": 255
                    },
                    "name": "Cloth Config API",
                    "id": "9s6osm5g",
                    "url": "https://modrinth.com/mod/cloth-config",
                    "versions": [
                        "1.21.8",
                        "1.21.9",
                        "1.21.10"
                    ],
                    "tablePosition": 2
                },
                {
                    "priority": {
                        "name": "New Priority Level",
                        "r": 255,
                        "g": 255,
                        "b": 255
                    },
                    "name": "Boing Boing Items",
                    "id": 1395190,
                    "url": "https://www.curseforge.com/minecraft/mc-mods/boing-boing-items",
                    "versions": [
                        "1.20.1",
                        "1.21.1"
                    ],
                    "tablePosition": -1
                }
            ]
        },
        {
            "name": "New Profile",
            "version": "1.21.5",
            "modlist": []
        }
    ],
    "priorityList": [
        {
            "name": "High Priority",
            "r": 255,
            "g": 128,
            "b": 0
        },
        {
            "name": "Medium Priority",
            "r": 255,
            "g": 196,
            "b": 0
        },
        {
            "name": "Low Priority",
            "r": 255,
            "g": 255,
            "b": 0
        }
    ]
}`
        )
    })
})