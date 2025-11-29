import { expect, test, describe } from 'vitest';
import mod from '../data/mod.js'

let modObj1
let modObj2
let modObj3
let modObj4
let modObj5
let modObj6
let invalidModObj

describe("Testing Mod Objects", () => {
    test("Create Mod Objects", () => {
        modObj1 = new mod.Mod("https://modrinth.com/mod/sodium")
        modObj2 = new mod.Mod("https://modrinth.com/mod/fabric-api")
        modObj3 = new mod.Mod("https://modrinth.com/mod/cloth-config")
        modObj4 = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/sodium") // on both sites
        modObj5 = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades") // only on curseforge
        modObj6 = new mod.Mod("https://www.curseforge.com/minecraft/mc-mods/worldedit") // if the API call is done wrong, it will fetch a modpack called Worldedit+ with the same slug
        invalidModObj = new mod.Mod("https://www.curseforge.com/minecrafods/sodium") // broken URL
    })

    test("Call APIs", async () => {
        await modObj1.refresh()
        await modObj2.refresh()
        await modObj3.refresh()
        await modObj4.refresh()
        await modObj5.refresh()
        await modObj6.refresh()
        await invalidModObj.refresh()
    })

    test("Mod Names", () => {
        expect(modObj1.getName()).toBe("Sodium")
        expect(modObj2.getName()).toBe("Fabric API")
        expect(modObj3.getName()).toBe("Cloth Config API")
        expect(modObj4.getName()).toBe("Sodium")
        expect(modObj5.getName()).toBe("Ice Cream, Mini Sword And New Trades!")
        expect(modObj6.getName()).toBe("WorldEdit")
        expect(invalidModObj.getName()).toBe("Untitled Mod")
    })

    test("Mod Current Versions", () => {
        const modObj2VersionList = modObj2.getVersionList()
        expect(modObj2.getCurrentVersion()).toBe(modObj2VersionList[modObj2VersionList.length - 1])

        expect(modObj5.getCurrentVersion()).toBe("1.20.1")
        expect(modObj1.getCurrentVersion()).toBe(modObj4.getCurrentVersion())
        expect(invalidModObj.getCurrentVersion()).toBe("No versions found")
    })

    test("Mod URLs", () => {
        expect(modObj1.getURL()).toBe("https://modrinth.com/mod/sodium")
        expect(modObj2.getURL()).toBe("https://modrinth.com/mod/fabric-api")
        expect(modObj3.getURL()).toBe("https://modrinth.com/mod/cloth-config")
        expect(modObj4.getURL()).toBe("https://www.curseforge.com/minecraft/mc-mods/sodium")
        expect(modObj5.getURL()).toBe("https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades")
        expect(modObj6.getURL()).toBe("https://www.curseforge.com/minecraft/mc-mods/worldedit")
        expect(invalidModObj.getURL()).toBe("https://www.curseforge.com/minecrafods/sodium")
    })
})

// tests for profile and profile manager coming next