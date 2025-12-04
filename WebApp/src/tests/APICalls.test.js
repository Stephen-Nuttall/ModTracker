import { expect, test, describe } from 'vitest';
import callModrinth from '../data/callModrinth.js'
import callCurseForge from '../data/callCurseForge.js'

describe('Modrinth API Functions', () => {
    test('verifyURL function', () => {
        expect(callModrinth.verifyURL("https://modrinth.com/mod/sodium/")).toBe(true)
        expect(callModrinth.verifyURL("https://modrinth.com/this-is-invalid")).toBe(false)
    })

    test('ping function', async () => {
        const result = await callModrinth.ping()
        expect(result.about).toBe("Welcome traveler!")
    })

    test('modData function', async () => {
        const result = await callModrinth.modData("fabric-api")
        expect(result.title).toBe('Fabric API')
    })

    test('modVersionList function', async () => {
        const result = await callModrinth.modVersionList("fabric-api")
        expect(result[0] != null).toBe(true)
    })

    test('getDownloadLink function', async () => {
        const result = await callModrinth.getDownloadLink("sodium", "Fabric", "1.21.5")
        expect(result != false).toBe(true)
    })
})

describe('CurseForge API Functions', () => {
    test('verifyURL function', () => {
        expect(callCurseForge.verifyURL("https://www.curseforge.com/minecraft/mc-mods/sodium")).toBe(true)
        expect(callCurseForge.verifyURL("https://www.curseforge.com/this-is-invalid")).toBe(false)
    })

    test('ping function', async () => {
        const result = await callCurseForge.ping()
        expect(result != null).toBe(true)
    })

    test('modData function', async () => {
        const result = await callCurseForge.modData("sodium")
        expect(result.name).toBe('Sodium')
    })

    test('getDownloadLink function', async () => {
        const modData = await callCurseForge.modData("sodium")

        const result = await callCurseForge.getDownloadLink(modData, "Fabric", "1.21.5")
        expect(result != false).toBe(true)
    })
})