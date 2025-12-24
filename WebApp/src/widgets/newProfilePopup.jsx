import React from "react"
import profileManager from '../data/stateProvider.jsx'

import TextInputBox from './textInputBox';
import FilePickerButton from './filePickerButton';

import profile from '../data/profile.js'
import loadFromJson from '../data/loadFromJson.js'
import '../styles/popup.css'

function NewProfilePopup({ isOpen = false, setIsOpen, setFuncOutput }) {
    const [nameInput, setNameInput] = React.useState("")

    function createBlankProfile() {
        profileManager.addProfile(new profile.Profile(), nameInput)
    }

    function importProfile(parsedData, errorMessage = null) {
        if (parsedData == null || parsedData === undefined) {
            console.error("parsed JSON data is null or undefined")
        }
        else if (errorMessage != null) {
            console.error("Error parsing JSON into dictionary: " + errorMessage)
        }
        else {
            let newProfile = loadFromJson.createProfile(parsedData)
            profileManager.addProfile(newProfile, nameInput)
            setIsOpen(false)
        }
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

                            <FilePickerButton
                                onFileLoaded={importProfile}
                                className='popupOptionButton'
                                buttonClassName='subComponentButton'
                            />

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
