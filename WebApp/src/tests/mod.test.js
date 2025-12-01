import { expect, test, describe, fail } from 'vitest';
import mod from '../data/mod.js'

let priority1
let priority2
let priority3
let priority4

describe("Testing Priority Objects", () => {
    test("Create Priority Objects", () => {
        priority1 = new mod.Priority()
        priority2 = new mod.Priority("Awesome Priority")
        priority3 = new mod.Priority("Awesome Priority", 100, 100, 100)
        priority4 = new mod.Priority("Awesome Priority", 100, 100, 100)

        expect(priority1.name).toBe("New Priority Level")
        expect(priority2.name).toBe("Awesome Priority")
        expect(priority3.name).toBe("Awesome Priority")
        expect(priority4.name).toBe("Awesome Priority")

        expect(priority1.r).toBe(255)
        expect(priority2.r).toBe(255)
        expect(priority3.r).toBe(100)
        expect(priority4.r).toBe(100)

        expect(priority1.g).toBe(255)
        expect(priority2.g).toBe(255)
        expect(priority3.g).toBe(100)
        expect(priority4.g).toBe(100)

        expect(priority1.b).toBe(255)
        expect(priority2.b).toBe(255)
        expect(priority3.b).toBe(100)
        expect(priority4.b).toBe(100)
    })

    test("Priority Dictionaries", () => {
        const priorities = [priority1, priority2, priority3, priority4]

        for (const priority of priorities) {
            const dict = priority.createDict()
            expect(dict.name).toBe(priority.name)
            expect(dict.r).toBe(priority.r)
            expect(dict.b).toBe(priority.b)
            expect(dict.g).toBe(priority.g)
        }
    })

    test("Priority Equality", () => {
        expect(priority2.equals(priority3)).toBe(false)
        expect(priority3.equals(priority4)).toBe(true)
    })
})

let mod_sodium_modrinth
let mod_fabricAPI_modrinth
let mod_clothConfig_modrinth
let mod_sodium_curseforge
let mod_boingBoing_curseforge
let mod_worldedit_curseforge
let mod_invalid
let mod_netherHeight_modrinth
let mod_entityculling_modrinth
let mod_JEI_curseforge

describe("Testing Mod Objects", () => {
    test("Create Mod Objects", () => {
        mod_sodium_modrinth = new mod.Mod("https://modrinth.com/mod/sodium")
        mod_fabricAPI_modrinth = new mod.Mod("https://modrinth.com/mod/fabric-api")
        mod_clothConfig_modrinth = new mod.Mod("https://modrinth.com/mod/cloth-config")
        mod_sodium_curseforge = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/sodium") // on both sites
        mod_boingBoing_curseforge = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/boing-boing-items") // only on curseforge
        mod_worldedit_curseforge = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/worldedit") // if the API call is done wrong, it will fetch a modpack called Worldedit+ with the same slug
        mod_invalid = new mod.Mod("https://www.curseforge.com/minecrafods/sodium") // broken URL
        mod_netherHeight_modrinth = new mod.Mod("https://modrinth.com/mod/nether-height-expansion-mod") // only on modrinth
        mod_entityculling_modrinth = new mod.Mod("https://modrinth.com/mod/entityculling")
        mod_JEI_curseforge = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/jei")
    })

    test("Call APIs", async () => {
        await mod_sodium_modrinth.refresh()
        await mod_fabricAPI_modrinth.refresh()
        await mod_clothConfig_modrinth.refresh()
        await mod_sodium_curseforge.refresh()
        await mod_boingBoing_curseforge.refresh()
        await mod_worldedit_curseforge.refresh()
        await mod_invalid.refresh()
        await mod_netherHeight_modrinth.refresh()
        await mod_entityculling_modrinth.refresh()
        await mod_JEI_curseforge.refresh()
    })

    test("Mod Names", () => {
        expect(mod_sodium_modrinth.getName()).toBe("Sodium")
        expect(mod_fabricAPI_modrinth.getName()).toBe("Fabric API")
        expect(mod_clothConfig_modrinth.getName()).toBe("Cloth Config API")
        expect(mod_sodium_curseforge.getName()).toBe("Sodium")
        expect(mod_boingBoing_curseforge.getName()).toBe("Boing Boing Items")
        expect(mod_worldedit_curseforge.getName()).toBe("WorldEdit")
        expect(mod_invalid.getName()).toBe("Untitled Mod")
        expect(mod_netherHeight_modrinth.getName()).toBe("More Nether Mod")
        expect(mod_entityculling_modrinth.getName()).toBe("Entity Culling")
        expect(mod_JEI_curseforge.getName()).toBe("Just Enough Items (JEI)")
    })

    test("Mod Current Versions", () => {
        const modObj2VersionList = mod_fabricAPI_modrinth.getVersionList()
        expect(mod_fabricAPI_modrinth.getCurrentVersion()).toBe(modObj2VersionList[modObj2VersionList.length - 1])

        expect(mod_boingBoing_curseforge.getCurrentVersion()).toBe("1.21.1")
        expect(mod_sodium_modrinth.getCurrentVersion()).toBe(mod_sodium_curseforge.getCurrentVersion())
        expect(mod_invalid.getCurrentVersion()).toBe("No versions found")
    })

    test("Mod URLs", () => {
        expect(mod_sodium_modrinth.getURL()).toBe("https://modrinth.com/mod/sodium")
        expect(mod_fabricAPI_modrinth.getURL()).toBe("https://modrinth.com/mod/fabric-api")
        expect(mod_clothConfig_modrinth.getURL()).toBe("https://modrinth.com/mod/cloth-config")
        expect(mod_sodium_curseforge.getURL()).toBe("https://www.curseforge.com/minecraft/mc-mods/sodium")
        expect(mod_boingBoing_curseforge.getURL()).toBe("https://www.curseforge.com/minecraft/mc-mods/boing-boing-items")
        expect(mod_worldedit_curseforge.getURL()).toBe("https://www.curseforge.com/minecraft/mc-mods/worldedit")
        expect(mod_invalid.getURL()).toBe("https://www.curseforge.com/minecrafods/sodium")
        expect(mod_entityculling_modrinth.getURL()).toBe("https://modrinth.com/mod/entityculling")
        expect(mod_netherHeight_modrinth.getURL()).toBe("https://modrinth.com/mod/nether-height-expansion-mod")
        expect(mod_entityculling_modrinth.getURL()).toBe("https://modrinth.com/mod/entityculling")
        expect(mod_JEI_curseforge.getURL()).toBe("https://www.curseforge.com/minecraft/mc-mods/jei")
    })

    test("Mod Dictionaries", () => {
        const mods = [
            mod_sodium_modrinth, mod_fabricAPI_modrinth, mod_clothConfig_modrinth,
            mod_sodium_curseforge, mod_boingBoing_curseforge, mod_worldedit_curseforge, mod_invalid,
            mod_netherHeight_modrinth, mod_entityculling_modrinth, mod_JEI_curseforge
        ]

        for (const modObj of mods) {
            const dict = modObj.createDict()
            expect(dict.name).toBe(modObj.getName())
            expect(dict.id).toBe(modObj.getID())
            expect(dict.url).toBe(modObj.getURL())
            expect(dict.versions).toBe(modObj.getVersionList())
        }
    })

    test("Download Mods", async () => {
        const downloadLink_1 = await mod_sodium_modrinth.getDownloadLink("Fabric", "1.21.5")
        expect(downloadLink_1).toBe("https://cdn.modrinth.com/data/AANobbMI/versions/DA250htH/sodium-fabric-0.6.13%2Bmc1.21.5.jar")

        const downloadLink_2 = await mod_sodium_curseforge.getDownloadLink("Fabric", "1.21.5")
        expect(downloadLink_2).toBe("https://edge.forgecdn.net/files/6382/664/sodium-fabric-0.6.13%2bmc1.21.5.jar")

        const downloadLink_3 = await mod_JEI_curseforge.getDownloadLink("NeoForge", "1.21.8")
        expect(downloadLink_3).toBe("https://edge.forgecdn.net/files/7025/33/jei-1.21.8-neoforge-24.2.0.6.jar")

        await expect(mod_invalid.getDownloadLink("Fabric", "1.21.5")).rejects.toThrowError(
            "Attempted to download Untitled Mod for 1.21.5, but it's not available for that version.")
    })
})

describe("Testing Profile Objects", () => {
    test("Create Profile Objects", () => {
        let profile1 = new mod.Profile()
        let profile2 = new mod.Profile([mod_sodium_modrinth, mod_clothConfig_modrinth, mod_boingBoing_curseforge])
        let profile3 = new mod.Profile([mod_fabricAPI_modrinth, mod_sodium_curseforge, mod_worldedit_curseforge], [])
        let profile4 = new mod.Profile([mod_boingBoing_curseforge, mod_invalid, mod_fabricAPI_modrinth], [priority1, priority3])
    })

    test("Add Mods", async () => {
        let profile1 = new mod.Profile()
        let profile2 = new mod.Profile([mod_sodium_modrinth, mod_clothConfig_modrinth, mod_boingBoing_curseforge])

        try {
            await profile1.addMod("https://modrinth.com/mod/sodium")
        } catch (error) {
            fail("An error occurred while trying to add a mod to profile object 1: " + error)
        }

        try {
            await profile1.addMod("https://modrinth.com/mod/fabric-api")
        } catch (error) {
            fail("An error occurred while trying to add a mod to profile object 1: " + error)
        }

        try {
            await profile2.addMod("https://modrinth.com/mod/sodium")
        } catch (error) {
            fail("An error occurred while trying to add a mod to profile object 2: " + error)
        }

        await expect(profile2.addMod()).rejects.toThrowError("URL provided is invalid.")
    })

    test("Remove Mods", () => {
        let profile1 = new mod.Profile([mod_sodium_modrinth, mod_clothConfig_modrinth, mod_boingBoing_curseforge])
        let profile2 = new mod.Profile()

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

        let profile1 = new mod.Profile([mod_curseforge, mod_modrinth, mod_boingBoing_curseforge])
        let profile2 = new mod.Profile()

        await profile1.refresh()
        await profile2.refresh()
    })

    test("Download Ready Mods - Modrinth", async () => {
        let profile = new mod.Profile([mod_entityculling_modrinth, mod_netherHeight_modrinth])
        profile.selectedVersion = "1.21.6"

        const forgeLinks_1 = await profile.downloadReadyMods("Forge", true)
        expect(forgeLinks_1[0]).toBeTruthy()
        expect(forgeLinks_1[1]).toBeFalsy()

        const fabricLinks_1 = await profile.downloadReadyMods("Fabric", true)
        expect(fabricLinks_1[0]).toBeTruthy()
        expect(fabricLinks_1[1]).toBeFalsy()

        const neoforgeLinks_1 = await profile.downloadReadyMods("NeoForge", true)
        expect(neoforgeLinks_1[0]).toBeTruthy()
        expect(neoforgeLinks_1[1]).toBeFalsy()

        const quiltLinks_1 = await profile.downloadReadyMods("Quilt", true)
        expect(quiltLinks_1[0]).toBeFalsy()
        expect(quiltLinks_1[1]).toBeFalsy()

        profile.selectedVersion = "1.21"

        const forgeLinks_2 = await profile.downloadReadyMods("Forge", true)
        expect(forgeLinks_2[0]).toBeTruthy()
        expect(forgeLinks_2[1]).toBeFalsy()

        const fabricLinks_2 = await profile.downloadReadyMods("Fabric", true)
        expect(fabricLinks_2[0]).toBeTruthy()
        expect(fabricLinks_2[1]).toBeTruthy()

        const neoforgeLinks_2 = await profile.downloadReadyMods("NeoForge", true)
        expect(neoforgeLinks_2[0]).toBeTruthy()
        expect(neoforgeLinks_2[1]).toBeFalsy()

        const quiltLinks_2 = await profile.downloadReadyMods("Quilt", true)
        expect(quiltLinks_2[0]).toBeFalsy()
        expect(quiltLinks_2[1]).toBeFalsy()
    }, 10000)

    test("Download Ready Mods - CurseForge", async () => {
        let profile = new mod.Profile([mod_JEI_curseforge, mod_boingBoing_curseforge])
        profile.selectedVersion = "1.21.1"

        const forgeLinks_1 = await profile.downloadReadyMods("Forge", true)
        expect(forgeLinks_1[0]).toBeTruthy()
        expect(forgeLinks_1[1]).toBeFalsy()

        const fabricLinks_1 = await profile.downloadReadyMods("Fabric", true)
        expect(fabricLinks_1[0]).toBeTruthy()
        expect(fabricLinks_1[1]).toBeTruthy()

        const neoforgeLinks_1 = await profile.downloadReadyMods("NeoForge", true)
        expect(neoforgeLinks_1[0]).toBeTruthy()
        expect(neoforgeLinks_1[1]).toBeTruthy()

        const quiltLinks_1 = await profile.downloadReadyMods("Quilt", true)
        expect(quiltLinks_1[0]).toBeFalsy()
        expect(quiltLinks_1[1]).toBeFalsy()

        profile.selectedVersion = "1.20.1"

        const forgeLinks_2 = await profile.downloadReadyMods("Forge", true)
        expect(forgeLinks_2[0]).toBeTruthy()
        expect(forgeLinks_2[1]).toBeTruthy()

        const fabricLinks_2 = await profile.downloadReadyMods("Fabric", true)
        expect(fabricLinks_2[0]).toBeTruthy()
        expect(fabricLinks_2[1]).toBeFalsy()

        const neoforgeLinks_2 = await profile.downloadReadyMods("NeoForge", true)
        expect(neoforgeLinks_2[0]).toBeFalsy()
        expect(neoforgeLinks_2[1]).toBeFalsy()

        const quiltLinks_2 = await profile.downloadReadyMods("Quilt", true)
        expect(quiltLinks_2[0]).toBeFalsy()
        expect(quiltLinks_2[1]).toBeFalsy()
    }, 10000)

    test("Test Exporting Profiles", () => { console.log("export tests coming soon") })
})


describe("Testing Profile Manager", () => {
    test("Tests coming soon", () => { })
})