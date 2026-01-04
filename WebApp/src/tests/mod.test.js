import { expect, test, describe } from 'vitest';
import mod from '../data/mod.js'

import API_Key from "./API_Keys.js"
vi.stubEnv('VITE_CURSEFORGE_API_KEY', API_Key)

describe("Testing Priority Objects", () => {
    let priority1
    let priority2
    let priority3
    let priority4

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

describe("Testing Mod Objects", () => {
    let mod_sodium_modrinth = new mod.Mod("https://modrinth.com/mod/sodium")
    let mod_fabricAPI_modrinth = new mod.Mod("https://modrinth.com/mod/fabric-api", new mod.Priority("Test Priority", 33, 55, 77))
    let mod_clothConfig_modrinth = new mod.Mod("https://modrinth.com/mod/cloth-config", undefined, 2)
    let mod_sodium_curseforge = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/sodium") // on both sites
    let mod_boingBoing_curseforge = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/boing-boing-items") // only on curseforge
    let mod_worldedit_curseforge = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/worldedit") // if the API call is done wrong, it will fetch a modpack called Worldedit+ with the same slug
    let mod_invalid = new mod.Mod("https://www.curseforge.com/minecrafods/sodium") // broken URL
    let mod_JEI_curseforge = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/jei")

    const modlist = [
        mod_sodium_modrinth, mod_fabricAPI_modrinth, mod_clothConfig_modrinth, mod_sodium_curseforge,
        mod_boingBoing_curseforge, mod_worldedit_curseforge, mod_invalid, mod_JEI_curseforge
    ]

    const expectedNames = [
        "Sodium",
        "Fabric API",
        "Cloth Config API",
        "Sodium",
        "Boing Boing Items",
        "WorldEdit",
        "Untitled Mod",
        "Just Enough Items (JEI)"
    ]

    const expectedUrls = [
        "https://modrinth.com/mod/sodium",
        "https://modrinth.com/mod/fabric-api",
        "https://modrinth.com/mod/cloth-config",
        "https://www.curseforge.com/minecraft/mc-mods/sodium",
        "https://www.curseforge.com/minecraft/mc-mods/boing-boing-items",
        "https://www.curseforge.com/minecraft/mc-mods/worldedit",
        "https://www.curseforge.com/minecrafods/sodium",
        "https://www.curseforge.com/minecraft/mc-mods/jei"
    ]

    test("Call APIs", async () => {
        for (const modObj of modlist) {
            try {
                await modObj.refresh()
            } catch (error) {
                if (error.name = "Invalid URL" && modObj.getURL() == "https://www.curseforge.com/minecrafods/sodium") {
                    // all is good! This URL is supposed to be invalid
                } else if (error.name = "API Key could not be fetched") {
                    throw new Error(
                        "CurseForge API key could not be fetched. "
                        + "Please create an API_Keys.js file with the following contents:\n."
                        + "const CurseForge = 'YOUR API KEY HERE'\nexport default CurseForge"
                    )
                } else {
                    throw error
                }
            }
        }
    })

    test("Mod Names", () => {
        for (const [i, modObj] of modlist.entries()) {
            expect(modObj.getName(expectedNames[i]))
        }
    })

    test("Mod Current Versions", () => {
        const modObj2VersionList = mod_fabricAPI_modrinth.getVersionList()
        expect(mod_fabricAPI_modrinth.getCurrentVersion()).toBe(modObj2VersionList[modObj2VersionList.length - 1])

        expect(mod_boingBoing_curseforge.getCurrentVersion()).toBe("1.21.2")
        expect(mod_sodium_modrinth.getCurrentVersion()).toBe(mod_sodium_curseforge.getCurrentVersion())
        expect(mod_invalid.getCurrentVersion()).toBe("No versions found")
    })

    test("Mod URLs", () => {
        for (const [i, modObj] of modlist.entries()) {
            expect(modObj.getURL(expectedUrls[i]))
        }
    })

    test("Mod Dictionaries", () => {
        for (const modObj of modlist) {
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

        const downloadLink_3 = await mod_JEI_curseforge.getDownloadLink("Forge", "1.21.1")
        expect(downloadLink_3).toBe("https://edge.forgecdn.net/files/7391/681/jei-1.21.1-forge-19.27.0.336.jar")

        const downloadLink_4 = await mod_boingBoing_curseforge.getDownloadLink("Fabric", "1.21.1")
        expect(downloadLink_4).toBe("https://edge.forgecdn.net/files/7284/964/boingboingitem-fabric-1.21.1-0.2.jar")

        await expect(mod_invalid.getDownloadLink("Fabric", "1.21.5")).rejects.toThrowError(
            "Attempted to download Untitled Mod for 1.21.5, but it's not available for that version.")
    })

    test("Download Skeleton Mods - Modrinth", async () => {
        const skeletonMod_entityculling = new mod.Mod(
            "https://modrinth.com/mod/entityculling",
            new mod.Priority(), -1, "Entity Culling", "NNAgCjsB", ["1.21", "1.21.6", "1.21.8", "1.21.9", "1.21.10"]
        )

        // Entity Culling 1.21.6
        const download_entityculling_forge1 = await skeletonMod_entityculling.getDownloadLink("Forge", "1.21.6")
        expect(download_entityculling_forge1).toBe("https://cdn.modrinth.com/data/NNAgCjsB/versions/ev6PFt64/entityculling-forge-1.8.2-mc1.21.6.jar")

        const download_entityculling_fabric1 = await skeletonMod_entityculling.getDownloadLink("Fabric", "1.21.6")
        expect(download_entityculling_fabric1).toBe("https://cdn.modrinth.com/data/NNAgCjsB/versions/5wVZFo2d/entityculling-fabric-1.8.2-mc1.21.6.jar")

        const download_entityculling_neoforge1 = await skeletonMod_entityculling.getDownloadLink("NeoForge", "1.21.6")
        expect(download_entityculling_neoforge1).toBe("https://cdn.modrinth.com/data/NNAgCjsB/versions/rFvPqrY3/entityculling-neoforge-1.8.2-mc1.21.6.jar")

        await expect(skeletonMod_entityculling.getDownloadLink("Quilt", "1.21.6")).rejects.toThrowError(
            "No download link could be found for entityculling for 1.21.6 and quilt"
        )

        // Entity Culling 1.21
        const download_entityculling_forge2 = await skeletonMod_entityculling.getDownloadLink("Forge", "1.21")
        expect(download_entityculling_forge2).toBe("https://cdn.modrinth.com/data/NNAgCjsB/versions/DutsY8u5/entityculling-forge-1.8.2-mc1.21.jar")

        const download_entityculling_fabric2 = await skeletonMod_entityculling.getDownloadLink("Fabric", "1.21")
        expect(download_entityculling_fabric2).toBe("https://cdn.modrinth.com/data/NNAgCjsB/versions/ivkfruZP/entityculling-fabric-1.8.2-mc1.21.jar")

        const download_entityculling_neoforge2 = await skeletonMod_entityculling.getDownloadLink("NeoForge", "1.21")
        expect(download_entityculling_neoforge2).toBe("https://cdn.modrinth.com/data/NNAgCjsB/versions/11PvLmko/entityculling-neoforge-1.8.2-mc1.21.jar")

        await expect(skeletonMod_entityculling.getDownloadLink("Quilt", "1.21")).rejects.toThrowError(
            "No download link could be found for entityculling for 1.21 and quilt"
        )

        const skeletonMod_netherHeight = new mod.Mod(
            "https://modrinth.com/mod/nether-height-expansion-mod",
            new mod.Priority(), -1, "More Nether Mod", "bcoxXH0y", ["1.20.6", "1.21"]
        )

        // Nether Height 1.21.6
        await expect(skeletonMod_netherHeight.getDownloadLink("Forge", "1.21.6")).rejects.toThrowError(
            "Attempted to download More Nether Mod for 1.21.6, but it's not available for that version."
        )

        await expect(skeletonMod_netherHeight.getDownloadLink("Fabric", "1.21.6")).rejects.toThrowError(
            "Attempted to download More Nether Mod for 1.21.6, but it's not available for that version."
        )

        await expect(skeletonMod_netherHeight.getDownloadLink("NeoForge", "1.21.6")).rejects.toThrowError(
            "Attempted to download More Nether Mod for 1.21.6, but it's not available for that version."
        )

        await expect(skeletonMod_netherHeight.getDownloadLink("Quilt", "1.21.6")).rejects.toThrowError(
            "Attempted to download More Nether Mod for 1.21.6, but it's not available for that version."
        )

        // Nether Height 1.21
        await expect(skeletonMod_netherHeight.getDownloadLink("Forge", "1.21")).rejects.toThrowError(
            "No download link could be found for nether-height-expansion-mod for 1.21 and forge"
        )

        const download_netherHeight_forge2 = await skeletonMod_netherHeight.getDownloadLink("Fabric", "1.21")
        expect(download_netherHeight_forge2).toBe("https://cdn.modrinth.com/data/bcoxXH0y/versions/wQCvsEgU/more-nether-1.1.jar")

        await expect(skeletonMod_netherHeight.getDownloadLink("NeoForge", "1.21")).rejects.toThrowError(
            "No download link could be found for nether-height-expansion-mod for 1.21 and neoforge"
        )

        await expect(skeletonMod_netherHeight.getDownloadLink("Quilt", "1.21")).rejects.toThrowError(
            "No download link could be found for nether-height-expansion-mod for 1.21 and quilt"
        )
    })

    test("Download Skeleton Mods - CurseForge", async () => {
        const skeletonMod_JEI = new mod.Mod(
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

        try {
            // JEI  1.21.1
            const download_JEI_forge1 = await skeletonMod_JEI.getDownloadLink("Forge", "1.21.1")
            expect(download_JEI_forge1).toBe("https://edge.forgecdn.net/files/7270/454/jei-1.21.1-forge-19.25.1.332.jar")

            const download_JEI_fabric1 = await skeletonMod_JEI.getDownloadLink("Fabric", "1.21.1")
            expect(download_JEI_fabric1).toBe("https://edge.forgecdn.net/files/7270/453/jei-1.21.1-fabric-19.25.1.332.jar")

            const download_JEI_neoforge1 = await skeletonMod_JEI.getDownloadLink("NeoForge", "1.21.1")
            expect(download_JEI_neoforge1).toBe("https://edge.forgecdn.net/files/7270/455/jei-1.21.1-neoforge-19.25.1.332.jar")

            await expect(skeletonMod_JEI.getDownloadLink("Quilt", "1.21.1")).rejects.toThrowError(
                "No download link could be found for Just Enough Items (JEI) for 1.21.1 and Quilt"
            )

            // JEI 1.20.1
            const download_JEI_forge2 = await skeletonMod_JEI.getDownloadLink("Forge", "1.20.1")
            expect(download_JEI_forge2).toBe("https://edge.forgecdn.net/files/7270/446/jei-1.20.1-forge-15.20.0.127.jar")

            const download_JEI_fabric2 = await skeletonMod_JEI.getDownloadLink("Fabric", "1.20.1")
            expect(download_JEI_fabric2).toBe("https://edge.forgecdn.net/files/7270/445/jei-1.20.1-fabric-15.20.0.127.jar")

            await expect(skeletonMod_JEI.getDownloadLink("NeoForge", "1.20.1")).rejects.toThrowError(
                "No download link could be found for Just Enough Items (JEI) for 1.20.1 and NeoForge"
            )

            await expect(skeletonMod_JEI.getDownloadLink("Quilt", "1.20.1")).rejects.toThrowError(
                "No download link could be found for Just Enough Items (JEI) for 1.20.1 and Quilt"
            )

            const skeletonMod_BoingBoing = new mod.Mod(
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

            // Boing Boing Items 1.21.1
            await expect(skeletonMod_BoingBoing.getDownloadLink("Forge", "1.21.1")).rejects.toThrowError(
                "No download link could be found for Boing Boing Items for 1.21.1 and Forge"
            )

            const download_BoingBoing_fabric1 = await skeletonMod_BoingBoing.getDownloadLink("Fabric", "1.21.1")
            expect(download_BoingBoing_fabric1).toBe("https://edge.forgecdn.net/files/7284/964/boingboingitem-fabric-1.21.1-0.2.jar")

            const download_BoingBoing_neoforge1 = await skeletonMod_BoingBoing.getDownloadLink("NeoForge", "1.21.1")
            expect(download_BoingBoing_neoforge1).toBe("https://edge.forgecdn.net/files/7284/969/boingboingitem-neoforge-0.2.jar")

            await expect(skeletonMod_BoingBoing.getDownloadLink("Quilt", "1.21.1")).rejects.toThrowError(
                "No download link could be found for Boing Boing Items for 1.21.1 and Quilt"
            )

            // Boing Boing Items 1.20.1
            const download_BoingBoing_forge2 = await skeletonMod_BoingBoing.getDownloadLink("Forge", "1.20.1")
            expect(download_BoingBoing_forge2).toBe("https://edge.forgecdn.net/files/7284/967/boingboingitem-forge-0.2.jar")

            await expect(skeletonMod_BoingBoing.getDownloadLink("Fabric", "1.20.1")).rejects.toThrowError(
                "No download link could be found for Boing Boing Items for 1.20.1 and Fabric"
            )

            await expect(skeletonMod_BoingBoing.getDownloadLink("NeoForge", "1.20.1")).rejects.toThrowError(
                "No download link could be found for Boing Boing Items for 1.20.1 and NeoForge"
            )

            await expect(skeletonMod_BoingBoing.getDownloadLink("Quilt", "1.20.1")).rejects.toThrowError(
                "No download link could be found for Boing Boing Items for 1.20.1 and Quilt"
            )
        } catch (error) {
            if (error.name = "API Key could not be fetched") {
                throw new Error(
                    "CurseForge API key could not be fetched. "
                    + "Please create an API_Keys.js file with the following contents:\n."
                    + "const CurseForge = 'YOUR API KEY HERE'\nexport default CurseForge"
                )
            } else {
                throw error
            }
        }
    })
})