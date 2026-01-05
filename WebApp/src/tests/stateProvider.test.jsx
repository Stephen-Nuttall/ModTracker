import React from 'react'
import { describe, test, expect, beforeEach, vi } from 'vitest'

describe('stateProvider', () => {
    let consoleLogSpy
    let consoleErrorSpy
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
    })()

    beforeEach(() => {
        vi.clearAllMocks()

        global.localStorage = localStorageMock;
        vi.resetModules()

        consoleLogSpy = vi.spyOn(console, 'log')
        consoleErrorSpy = vi.spyOn(console, 'error')
        localStorage.clear()
    })

    afterEach(() => {
        // Restore the original localStorage
        vi.restoreAllMocks();
    })

    test('should not throw when storedData is empty (undefined)', async () => {
        await expect(import('../data/stateProvider.jsx')).resolves.not.toThrow()
        expect(consoleLogSpy).toHaveBeenCalledWith("No saved data found. Creating blank save.")
    })

    test('should not throw when storedData is not valid JSON (whitespace only)', async () => {
        localStorage.setItem('profiles', '   ')
        expect(localStorage.getItem('profiles')).toBe('   ')

        await expect(import('../data/stateProvider.jsx')).resolves.not.toThrow()
        expect(consoleErrorSpy).toHaveBeenCalled()
    })

    test('should not throw when storedData is not valid JSON (empty array)', async () => {
        localStorage.setItem('profiles', '[]')
        expect(localStorage.getItem('profiles')).toBe('[]')

        await expect(import('../data/stateProvider.jsx')).resolves.not.toThrow()
        expect(consoleLogSpy).toHaveBeenCalledWith("Stored data was empty or invalid. Creating blank save.")
    })

    test('should not throw when storedData is valid JSON', async () => {
        localStorage.setItem('profiles', '{"profileList": [], "priorityList": []}')
        expect(localStorage.getItem('profiles')).toBe('{"profileList": [], "priorityList": []}')

        await expect(import('../data/stateProvider.jsx')).resolves.not.toThrow()
        expect(consoleLogSpy).toHaveBeenCalledWith("Saved data restored.")
    })

    test('should throw when storedData is invalid JSON (invalid format)', async () => {
        localStorage.setItem('profiles', '{"unexpected format": "this should fail"}')
        expect(localStorage.getItem('profiles')).toBe('{"unexpected format": "this should fail"}')

        await expect(import('../data/stateProvider.jsx')).resolves.not.toThrow()
        expect(consoleErrorSpy).toHaveBeenCalled()
    })
})