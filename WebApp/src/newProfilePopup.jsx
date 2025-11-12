import { useState } from 'react';
import TextInputBox from './textInputBox';
import FilePickerButton from './filePickerButton';
import './styles/popup.css'

function NewProfilePopup({ isOpen = false, setIsOpen, requestRef, setFuncOutput }) {
    const [nameInput, setNameInput] = useState("")

    const createBlankProfile = async () => {
        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "add-profile", { profileName: nameInput },
                "Failed to add profile: ", "Profile " + nameInput + " successfully added."
            )

            if (data?.errorMessage != "None") {
                setFuncOutput("Failed to create profile.")
            } else {
                setFuncOutput("Profile successfully created.")
            }
        } else {
            console.error("requestRef is not set!")
        }
    }

    const importProfile = async (parsedData, errorMessage = null) => {
        if (parsedData == null || parsedData === undefined) {
            console.error("parsed JSON data is null or undefined")
        }
        else if (errorMessage != null) {
            console.error("Error parsing JSON data: " + errorMessage)
        }
        else if (!requestRef.current) {
            console.error("requestRef is not set!")
        }
        else {
            const data = await requestRef.current?.genericRequest(
                "add-profile", { profileName: nameInput, profileData: parsedData },
                "Failed to import profile: ", "Profile " + nameInput + " successfully imported."
            )
            setIsOpen(false)

            if (data?.errorMessage != "None") {
                setFuncOutput("Failed to import profile.")
            } else {
                setFuncOutput("Profile successfully imported.")
            }
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
