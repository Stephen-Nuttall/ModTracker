import { useState } from 'react';
import { SketchPicker } from 'react-color';
import TextInputBox from './textInputBox';
import './styles/popup.css'

function CreatePriorityPopup({ isOpen = false, setIsOpen, onSubmit }) {
    const [textInput, setTextInput] = useState("")
    const [color, setColor] = useState({ r: 255, g: 255, b: 255, a: 1 });

    const handleColorChange = (color) => {
        setColor(color.rgb);
    };

    return (
        <div className='popupContainer'>
            {isOpen && (
                <div className='popupOverlay'>
                    <div className='popupContent'>
                        <h3>Create a New Priority Level</h3>
                        Priority Name:
                        <br />
                        <TextInputBox
                            onTextChange={(newInput) => { setTextInput(newInput) }}
                            placeholderText='Enter Priority Name'
                        />
                        <br />
                        <br />
                        Priority Color:
                        <br />
                        <SketchPicker
                            color={color}
                            onChange={handleColorChange}
                            className='colorPicker'
                        />
                        <button
                            className='closeButton'
                            onClick={() => {
                                onSubmit(textInput, color)
                                setIsOpen(false)
                            }}
                        >
                            Create New Priority
                        </button>
                        <button
                            className='closeButton'
                            onClick={() => {
                                setIsOpen(false)
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreatePriorityPopup;
