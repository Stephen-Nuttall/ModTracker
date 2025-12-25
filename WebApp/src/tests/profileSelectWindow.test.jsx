import React from "react"

import profile from "../data/profile.js"
import loadFromJson from "../data/loadFromJson.js"
import profileManager from "../data/stateProvider.jsx"
import ProfileSelectWindow from "../display/profileSelectWindow.jsx"

import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import API_Key from "./API_Keys.js"
vi.stubEnv('VITE_CURSEFORGE_API_KEY', API_Key)

vi.mock('../widgets/newProfilePopup', () => ({
    default: () => <div data-testid="new-profile-popup" />
}))

const mockSetCurProfileIndex = vi.fn()

const mockProfile_1 = loadFromJson.createProfile({
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
const mockProfile_2 = new profile.Profile(undefined, "1.21.11", "Empty profile")

profileManager.addProfile(mockProfile_1)
profileManager.addProfile(mockProfile_2)

test('renders profile tiles with correct data', () => {
    render(<ProfileSelectWindow setCurProfileIndex={mockSetCurProfileIndex} isLoading={false} />)

    expect(screen.getByText('Mock Profile')).toBeInTheDocument()
    expect(screen.getByText('3 mods')).toBeInTheDocument()
    expect(screen.getByText('66.67% ready for 1.21.5')).toBeInTheDocument()
})

test('calls setCurProfileIndex when tile is clicked', () => {
    render(<ProfileSelectWindow setCurProfileIndex={mockSetCurProfileIndex} isLoading={false} />)

    fireEvent.click(screen.getByText('Mock Profile').closest('.tile'))
    expect(mockSetCurProfileIndex).toHaveBeenCalledWith(0)
})

test('removes profile when close button is clicked', () => {
    render(<ProfileSelectWindow setCurProfileIndex={mockSetCurProfileIndex} isLoading={false} />)

    const removeProfileSpy = vi.spyOn(profileManager, 'removeProfile')
    const removeButtons = screen.getAllByText('X')
    fireEvent.click(removeButtons[0])

    expect(removeProfileSpy).toHaveBeenCalledWith(0)
})

test('renders add profile tile', () => {
    render(<ProfileSelectWindow setCurProfileIndex={mockSetCurProfileIndex} isLoading={false} />)

    expect(screen.getByText('+')).toBeInTheDocument()
})

test('opens new profile popup when add tile is clicked', async () => {
    render(<ProfileSelectWindow setCurProfileIndex={mockSetCurProfileIndex} isLoading={false} />)

    fireEvent.click(screen.getByText('+').closest('.tile'))

    await waitFor(() => {
        expect(screen.getByTestId('new-profile-popup')).toBeInTheDocument()
    })
})
