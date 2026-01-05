import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NewPriorityPopup from '../widgets/newPriorityPopup'
import profileManager from '../data/stateProvider'
import mod from '../data/mod'

vi.mock('../data/stateProvider')
vi.mock('../data/mod')
vi.mock('./textInputBox', () => ({
    default: ({ onTextChange, placeholderText }) => (
        <input
            placeholder={placeholderText}
            onChange={(e) => onTextChange(e.target.value)}
            data-testid="text-input"
        />
    )
}))
vi.mock('react-color', () => ({
    SketchPicker: ({ onChange }) => (
        <button
            data-testid="color-picker"
            onClick={() => onChange({ rgb: { r: 100, g: 100, b: 100, a: 1 } })}
        >
            Pick Color
        </button>
    )
}))

describe('NewPriorityPopup', () => {
    let setOutputMock
    beforeEach(() => {
        vi.clearAllMocks()
        profileManager.getPriorityList.mockReturnValue([{ name: "High Priority" }, { name: "Medium Priority" }, { name: "Low Priority" }])
        profileManager.addPriority.mockImplementation(() => { })
        setOutputMock = vi.fn()
    })

    test('should not render when isOpen is false', () => {
        render(<NewPriorityPopup isOpen={false} setIsOpen={vi.fn()} modToAddPriorityTo={{}} setOutput={setOutputMock} />)
        expect(screen.queryByText('Create a New Priority Level')).not.toBeInTheDocument()
    })

    test('should render when isOpen is true', () => {
        render(<NewPriorityPopup isOpen={true} setIsOpen={vi.fn()} modToAddPriorityTo={{}} setOutput={setOutputMock} />)
        expect(screen.getByText('Create a New Priority Level')).toBeInTheDocument()
    })

    test('should update text input', () => {
        render(<NewPriorityPopup isOpen={true} setIsOpen={vi.fn()} modToAddPriorityTo={{}} setOutput={setOutputMock} />)
        const input = screen.getByPlaceholderText('Enter Priority Name')
        fireEvent.change(input, { target: { value: 'High' } })
        expect(input.value).toBe('High')
    })

    test('should call setIsOpen(false) when Cancel button is clicked', () => {
        const setIsOpen = vi.fn()
        render(<NewPriorityPopup isOpen={true} setIsOpen={setIsOpen} modToAddPriorityTo={{}} setOutput={setOutputMock} />)
        fireEvent.click(screen.getByText('Cancel'))
        expect(setIsOpen).toHaveBeenCalledWith(false)
    })

    test('should close popup when Create New Priority is clicked with valid input', () => {
        const setIsOpen = vi.fn()
        const modToAddPriorityTo = {}
        mod.Priority = vi.fn()
        profileManager.getPriorityList.mockReturnValue([])

        render(<NewPriorityPopup isOpen={true} setIsOpen={setIsOpen} modToAddPriorityTo={modToAddPriorityTo} setOutput={setOutputMock} />)

        const priorityNameInput = screen.getByPlaceholderText('Enter Priority Name')
        const createButton = screen.getByText('Create New Priority')

        fireEvent.change(priorityNameInput, { target: { value: 'Test Priority' } })
        fireEvent.click(createButton)

        expect(setIsOpen).toHaveBeenCalledWith(false)
        expect(profileManager.addPriority).toHaveBeenCalledTimes(1)
    })

    test('should not create priority with empty text input', () => {
        const setIsOpen = vi.fn()
        render(<NewPriorityPopup isOpen={true} setIsOpen={setIsOpen} modToAddPriorityTo={{}} setOutput={setOutputMock} />)
        fireEvent.click(screen.getByText('Create New Priority'))
        expect(profileManager.addPriority).not.toHaveBeenCalled()
    })

    test('should not create priority with without mod to add priority to', () => {
        const setIsOpen = vi.fn()
        render(<NewPriorityPopup isOpen={true} setIsOpen={setIsOpen} modToAddPriorityTo={-1} setOutput={setOutputMock} />)

        const priorityNameInput = screen.getByPlaceholderText('Enter Priority Name')
        const createButton = screen.getByText('Create New Priority')

        fireEvent.change(priorityNameInput, { target: { value: 'Test Priority' } })
        fireEvent.click(createButton)

        expect(profileManager.addPriority).not.toHaveBeenCalled()
    })

    test('should not create priority if priority with that name already exists', () => {
        const setIsOpen = vi.fn()
        render(<NewPriorityPopup isOpen={true} setIsOpen={setIsOpen} modToAddPriorityTo={{}} setOutput={setOutputMock} />)

        const priorityNameInput = screen.getByPlaceholderText('Enter Priority Name')
        const createButton = screen.getByText('Create New Priority')

        fireEvent.change(priorityNameInput, { target: { value: 'High Priority' } })
        fireEvent.click(createButton)

        expect(setOutputMock).toHaveBeenCalledWith("Can't create priority level. There is already a priority level named 'High Priority'")
        expect(profileManager.addPriority).not.toHaveBeenCalled()
    })

    test('should change color when new color is selected', () => {
        render(<NewPriorityPopup isOpen={true} setIsOpen={vi.fn()} modToAddPriorityTo={{}} setOutput={setOutputMock} />)

        const colorPicker = screen.getByTestId('color-picker')
        const mockColor = { hex: '#ff0000' }

        fireEvent.change(colorPicker, { target: { value: mockColor.hex } })
        expect(colorPicker.value).toBe(mockColor.hex)
    })
})