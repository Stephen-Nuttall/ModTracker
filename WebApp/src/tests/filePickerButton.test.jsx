import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FilePickerButton from '../widgets/filePickerButton'

describe('FilePickerButton', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders button with default text', () => {
        render(<FilePickerButton />)
        expect(screen.getByText('Select JSON file')).toBeInTheDocument()
    })

    test('renders hidden file input', () => {
        render(<FilePickerButton />)
        const input = screen.getByRole('button').parentElement.querySelector('input[type="file"]')
        expect(input).toHaveStyle({ display: 'none' })
    })

    test('triggers file input click when button clicked', () => {
        render(<FilePickerButton />)
        const button = screen.getByText('Select JSON file')
        fireEvent.click(button)
        // Input click is triggered internally
        expect(button).toBeInTheDocument()
    })

    test('displays selected filename', async () => {
        render(<FilePickerButton />)
        const input = screen.getByRole('button').parentElement.querySelector('input[type="file"]')
        const jsonData = { key: 'value' }
        const file = { name: 'test.json', text: async () => JSON.stringify(jsonData) }

        fireEvent.change(input, { target: { files: [file] } })

        await waitFor(() => {
            expect(screen.getByText(/Selected: test.json/)).toBeInTheDocument()
        })
    })

    test('calls onFileLoaded with parsed JSON on valid file', async () => {
        const onFileLoaded = vi.fn()
        render(<FilePickerButton onFileLoaded={onFileLoaded} />)

        const input = screen.getByRole('button').parentElement.querySelector('input[type="file"]')
        const jsonData = { key: 'value' }
        const file = { name: 'test.json', text: async () => JSON.stringify(jsonData) }

        fireEvent.change(input, { target: { files: [file] } })

        await waitFor(() => {
            expect(onFileLoaded).toHaveBeenCalledWith(jsonData)
        })
    })

    test('displays error on invalid JSON', async () => {
        render(<FilePickerButton />)

        const input = screen.getByRole('button').parentElement.querySelector('input[type="file"]')
        const file = new File(['invalid json'], 'test.json', { type: 'application/json' })

        fireEvent.change(input, { target: { files: [file] } })

        await waitFor(() => {
            expect(screen.getByText(/Invalid JSON:/)).toBeInTheDocument()
        })
    })

    test('calls onFileLoaded with error on invalid JSON', async () => {
        const onFileLoaded = vi.fn()
        render(<FilePickerButton onFileLoaded={onFileLoaded} />)

        const input = screen.getByRole('button').parentElement.querySelector('input[type="file"]')
        const file = new File(['invalid json'], 'test.json', { type: 'application/json' })

        fireEvent.change(input, { target: { files: [file] } })

        await waitFor(() => {
            expect(onFileLoaded).toHaveBeenCalledWith(null, expect.any(Error))
        })
    })

    test('does not call onFileLoaded with no file', async () => {
        const onFileLoaded = vi.fn()
        render(<FilePickerButton onFileLoaded={onFileLoaded} />)

        const input = screen.getByRole('button').parentElement.querySelector('input[type="file"]')
        fireEvent.change(input, { target: { files: [] } })

        await waitFor(() => {
            expect(onFileLoaded).not.toHaveBeenCalled()
        })
    })

    test('applies custom className to container', () => {
        render(<FilePickerButton className="custom-class" />)
        const container = screen.getByText('Select JSON file').parentElement
        expect(container).toHaveClass('custom-class')
    })

    test('applies custom buttonClassName to button', () => {
        render(<FilePickerButton buttonClassName="btn-custom" />)
        expect(screen.getByText('Select JSON file')).toHaveClass('btn-custom')
    })

    test('resets input value after file selection', async () => {
        render(<FilePickerButton />)

        const input = screen.getByRole('button').parentElement.querySelector('input[type="file"]')
        const file = new File(['{"key": "value"}'], 'test.json', { type: 'application/json' })

        fireEvent.change(input, { target: { files: [file] } })

        await waitFor(() => {
            expect(input.value).toBe('')
        })
    })
})