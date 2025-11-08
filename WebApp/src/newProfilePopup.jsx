import { useState } from 'react';
import TextInputBox from './textInputBox';
import './styles/popup.css'

function NewProfilePopup({ isOpen = false, setIsOpen, requestRef }) {
    const [nameInput, setNameInput] = useState("")

    const createBlankProfile = async () => {
        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "add-profile", { profileName: nameInput },
                "Failed to add profile: ", "Profile " + nameInput + " successfully added."
            )
        } else {
            console.error("requestRef is not set!")
        }
    }

    const importProfile = async () => {
        console.log("placeholder")
    }

    return (
        <div className='popupContainer'>
            {isOpen && (
                <div className='popupOverlay'>
                    <div className='popupContent'>
                        <div className='popupTitle'>Create a New Profile</div>
                        <div className='popupTextInputArea'>
                            <div className='popupLabel'>Profile Name:</div>
                            <TextInputBox
                                onTextChange={(newInput) => { setNameInput(newInput) }}
                                placeholderText='Enter Profile Name'
                                className={"popupTextInput"}
                            />
                        </div>
                        <div className='popupButtonArea'>
                            <button
                                className='popupOptionButton'
                                onClick={() => {
                                    createBlankProfile()
                                    setIsOpen(false)
                                }}
                            >
                                Create blank profile
                            </button>
                            <button
                                className='popupOptionButton'
                                onClick={() => {
                                    importProfile()
                                    setIsOpen(false)
                                }}
                            >
                                Import from JSON file
                            </button>
                            <button
                                className='popupOptionButton'
                                onClick={() => {
                                    setIsOpen(false)
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NewProfilePopup;
