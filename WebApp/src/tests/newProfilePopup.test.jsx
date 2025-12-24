import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NewProfilePopup from '../widgets/newProfilePopup.jsx';
import profileManager from '../data/stateProvider.jsx';

vi.mock('../data/stateProvider.jsx');
vi.mock('../data/profile.js');
vi.mock('../data/loadFromJson.js');
vi.mock('./textInputBox', () => ({
    default: ({ onTextChange, placeholderText, className }) => (
        <input
            placeholder={placeholderText}
            className={className}
            onChange={(e) => onTextChange(e.target.value)}
        />
    ),
}));
vi.mock('./filePickerButton', () => ({
    default: ({ onFileLoaded, className, buttonClassName }) => (
        <button className={className} data-testid="file-picker">
            Import Profile
        </button>
    ),
}));

describe('NewProfilePopup', () => {
    const mockSetIsOpen = vi.fn();
    const mockSetFuncOutput = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render popup when isOpen is false', () => {
        render(<NewProfilePopup isOpen={false} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />);
        expect(screen.queryByText('Create a New Profile')).not.toBeInTheDocument();
    });

    it('renders popup when isOpen is true', () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />);
        expect(screen.getByText('Create a New Profile')).toBeInTheDocument();
    });

    it('creates blank profile when button clicked', () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />);
        const createButton = screen.getByText('Create blank profile');
        fireEvent.click(createButton);
        expect(profileManager.addProfile).toHaveBeenCalled();
        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it('closes popup when cancel button clicked', () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />);
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it('updates name input when TextInputBox changes', () => {
        render(<NewProfilePopup isOpen={true} setIsOpen={mockSetIsOpen} setFuncOutput={mockSetFuncOutput} />);
        const input = screen.getByPlaceholderText('Enter Profile Name');
        fireEvent.change(input, { target: { value: 'Test Profile' } });
        expect(input.value).toBe('Test Profile');
    });
});