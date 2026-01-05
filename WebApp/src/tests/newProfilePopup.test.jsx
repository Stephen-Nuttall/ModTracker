import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewProfilePopup from '../widgets/newProfilePopup.jsx'
import profileManager from '../data/stateProvider.jsx'

describe('Popup Functionality', () => {
    const mockSetIsOpen = vi.fn()
    const mockSetFuncOutput = vi.fn()
    const addProfileSpy = vi.spyOn(profileManager, 'addProfile')

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('does not render popup when isOpen is false', () => {
        render(<NewProfilePopup isOpen={false} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />)
        expect(screen.queryByText('Create a New Profile')).not.toBeInTheDocument()
    })

    test('renders popup when isOpen is true', () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />)
        expect(screen.getByText('Create a New Profile')).toBeInTheDocument()
    })

    test('creates blank profile when button clicked', () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />)
        const createButton = screen.getByText('Create blank profile')
        fireEvent.click(createButton)

        expect(addProfileSpy).toHaveBeenCalled()
        expect(mockSetIsOpen).toHaveBeenCalledWith(false)
    })

    test('closes popup when cancel button clicked', () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />)
        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)
        expect(mockSetIsOpen).toHaveBeenCalledWith(false)
    })

    test('updates name input when TextInputBox changes', () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />)
        const input = screen.getByPlaceholderText('Enter Profile Name')
        fireEvent.change(input, { target: { value: 'Test Profile' } })
        expect(input.value).toBe('Test Profile')
    })
})

describe('Import Profile Functionality', () => {
    const mockSetIsOpen = vi.fn()
    const mockSetFuncOutput = vi.fn()
    const consoleLogSpy = vi.spyOn(console, 'log')
    const consoleErrorSpy = vi.spyOn(console, 'error')
    const addProfileSpy = vi.spyOn(profileManager, 'addProfile')

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('imports fails with invalid JSON', async () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />)

        const filePicker = screen.getByTestId("file-input")
        const jsonData = { key: 'value' }
        const file = { name: 'test.json', text: async () => JSON.stringify(jsonData) }
        fireEvent.change(filePicker, { target: { files: [file] } })

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("parsed JSON data is null or undefined")
        })
    })

    test('does not import if no file is provided', async () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />)

        const filePicker = screen.getByTestId("file-input")
        fireEvent.change(filePicker, { target: { files: [] } })

        await waitFor(() => {
            expect(consoleLogSpy).toHaveBeenCalledWith("No file selected.")
            expect(consoleErrorSpy).not.toHaveBeenCalled()
            expect(addProfileSpy).not.toHaveBeenCalled()
            expect(mockSetIsOpen).not.toHaveBeenCalledWith(false)
        })
    })

    test('imports succeeds with valid JSON', async () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />)

        const filePicker = screen.getByTestId("file-input")
        const jsonData = {
            "name": "Test Profile",
            "version": "1.21.5",
            "modlist": []
        }
        const file = { name: 'test.json', text: async () => JSON.stringify(jsonData) }
        fireEvent.change(filePicker, { target: { files: [file] } })

        await waitFor(() => {
            expect(consoleErrorSpy).not.toHaveBeenCalled()
            expect(addProfileSpy).toHaveBeenCalled()
            expect(mockSetIsOpen).toHaveBeenCalledWith(false)
        })
    })
})