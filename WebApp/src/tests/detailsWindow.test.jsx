import React from "react"
import { describe, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor, within, getByText } from "@testing-library/react"

import DetailsWindow from "../display/detailsWindow"
import profileManager from "../data/stateProvider.jsx"
import loadFromJson from "../data/loadFromJson.js"
import profile from "../data/profile.js"


const mockSetCurProfileIndex = vi.fn()
const mockProfile = loadFromJson.createProfile({
    "name": "Mock Profile",
    "version": "1.21.5",
    "modlist": [
        {
            "priority": { "name": "High Priority", "r": 255, "g": 85, "b": 0 },
            "name": "Sodium",
            "id": "AANobbMI",
            "url": "https://modrinth.com/mod/sodium",
            "versions": ["1.21.5", "1.21.11"],
            "tablePosition": 0
        },
        {
            "priority": { "name": "Medium Priority", "r": 255, "g": 170, "b": 0 },
            "name": "Fabric API",
            "id": "P7dR8mSH",
            "url": "https://modrinth.com/mod/fabric-api",
            "versions": ["1.21.5", "1.21.11", "26.1-snapshot-1"],
            "tablePosition": 1
        },
        {
            "priority": { "name": "Cool Priority", "r": 74, "g": 144, "b": 226 },
            "name": "Boing Boing Items",
            "id": 1395190,
            "url": "https://www.curseforge.com/minecraft/mc-mods/boing-boing-items",
            "versions": ["1.21.2"],
            "tablePosition": 4
        }
    ]
})

profileManager.addProfile(mockProfile)

beforeEach(() => {
    render(<DetailsWindow profileIndex={0} setCurProfileIndex={mockSetCurProfileIndex} isLoading={false} />)
})

describe("General Widgets", () => {
    test("renders profile name and selected version", () => {
        expect(screen.getByText("Mock Profile")).toBeInTheDocument()
        expect(screen.getByText("Selected Version: 1.21.5")).toBeInTheDocument()
    })

    test("reloads profile with new version", () => {
        const versionInput = screen.getByPlaceholderText("Enter new version")
        const reloadButton = screen.getByText("⟳")

        fireEvent.change(versionInput, { target: { value: "1.21.11" } })
        fireEvent.click(reloadButton)

        expect(screen.getByText("Selected Version: 1.21.11")).toBeInTheDocument()
    })

    test("exports profile", () => {
        const exportButton = screen.getByText("Export")
        fireEvent.click(exportButton)

        expect(screen.getByText("Profile successfully exported.")).toBeInTheDocument()
    })

    test("navigates back to select view", () => {
        const backButton = screen.getByText("Back")
        fireEvent.click(backButton)

        expect(mockSetCurProfileIndex).toHaveBeenCalledWith(-1)
    })

    test("displays loading message when isLoading is true", () => {
        render(<DetailsWindow profileIndex={0} setCurProfileIndex={mockSetCurProfileIndex} isLoading={true} />)
        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })

    test("download ready mods", () => {
        const profile = profileManager.getProfile(0)
        const downloadModsSpy = vi.spyOn(profile, "downloadReadyMods")

        const downloadButton = screen.getByText("Download Available Mods")
        fireEvent.click(downloadButton)
        expect(downloadModsSpy).toBeCalledWith("forge")

        const dropdown = screen.getByText("Forge")
        fireEvent.click(dropdown)
        fireEvent.change(dropdown, { target: { value: "fabric" } })

        fireEvent.click(downloadButton)
        expect(downloadModsSpy).toBeCalledWith("fabric")
    })
})

describe("Mod Table", () => {
    test("Available mods marked as ready", () => {
        const versionElements = screen.queryAllByText(/^\d{1,2}\.\d{1,2}.*$/)

        for (const ver of versionElements) {
            if (ver.textContent.includes("✔")) {
                expect(ver.textContent == "26.1-snapshot-1 ✔" || ver.textContent == "1.21.11 ✔", ver.textContent).toBeTruthy()
            }
        }
    })

    test("Add mod (with valid link)", async () => {
        const profile = profileManager.getProfile(0)
        const addModSpy = vi.spyOn(profile, "addMod")

        const modInput = screen.getByPlaceholderText("Enter Mod URL")
        const addButton = screen.getByText("Add Mod")

        fireEvent.change(modInput, { target: { value: "https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades" } })
        fireEvent.click(addButton)

        await waitFor(() => expect(addModSpy).toHaveBeenCalled())
        await screen.findByText(/Ice Cream/i)
        expect(screen.getByText(/Ice Cream/i)).toBeInTheDocument()
    })

    test("Add mod (with invalid link)", async () => {
        const profile = profileManager.getProfile(0)
        const addModSpy = vi.spyOn(profile, "addMod")

        const modInput = screen.getByPlaceholderText("Enter Mod URL")
        const addButton = screen.getByText("Add Mod")

        fireEvent.change(modInput, { target: { value: "https://invalid.mod/url" } })
        fireEvent.click(addButton)

        await waitFor(() => expect(addModSpy).toHaveBeenCalled())
        await screen.findByText("Could not add that mod! Please check the URL and try again.")
        expect(screen.getByText("Could not add that mod! Please check the URL and try again.")).toBeInTheDocument()
    })

    test("Remove mod", async () => {
        expect(screen.queryByText("Cool Priority: 1")).toBeInTheDocument()

        const profile = profileManager.getProfile(0)
        const removeModSpy = vi.spyOn(profile, "removeMod")
        const rows = screen.getAllByRole("row")

        for (const row of rows) {
            const { queryByText, getByText } = within(row)

            if (queryByText("Boing Boing Items")) {
                const removeButton = getByText("X")
                fireEvent.click(removeButton)

                await waitFor(() => expect(removeModSpy).toHaveBeenCalled())
                await waitFor(() => expect(screen.queryByText("Boing Boing Items")).not.toBeInTheDocument())
                expect(screen.queryByText("Cool Priority: 1")).not.toBeInTheDocument()

                return
            }
        }

        throw new Error('Row with "Boing Boing Items" not found')
    })

    test("Change Priority", () => {
        const rows = screen.getAllByRole("row")

        for (const row of rows) {
            const { queryByText, getByRole } = within(row)

            if (queryByText("Ice Cream, Mini Sword And New Trades!")) {
                const dropdown = getByRole("combobox")
                fireEvent.click(dropdown)
                fireEvent.change(dropdown, { target: { value: 2 } })

                expect(dropdown.value).toBe("2")
                expect(screen.queryByText("Low Priority: 1")).toBeInTheDocument()
                return
            }
        }

        throw new Error('Row with "Ice Cream, Mini Sword And New Trades!" not found')
    })
})