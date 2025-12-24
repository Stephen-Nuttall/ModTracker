import React from "react"
import { SketchPicker } from 'react-color'
import profileManager from '../data/stateProvider.jsx'

import TextInputBox from './textInputBox'
import mod from '../data/mod.js'
import '../styles/popup.css'

function NewPriorityPopup({ isOpen = false, setIsOpen, modToAddPriorityTo }) {
    const priorityList = profileManager.getPriorityList()
    const [textInput, setTextInput] = React.useState("")
    const [color, setColor] = React.useState({ r: 255, g: 255, b: 255, a: 1 })

    function createNewPriority() {
        if (textInput === undefined || textInput == "") {
            console.log("Failed to add priority level: PriorityName (" + textInput + ") is invalid.")
            return
        } else if (modToAddPriorityTo == -1) {
            console.log("Failed to add priority level: modToAddPriorityTo (" + modToAddPriorityTo + ") is not set.")
            return
        } else {
            let priorityNames = []
            for (const priority of priorityList) {
                priorityNames.push(priority.name)
            }

            if (priorityNames.includes(textInput)) {
                console.log("Failed to add priority level: There is already a priority named " + textInput + " in the priority list.")
                setOutput("Can't create priority level. There is already a priority level named '" + textInput + "'!")
                return
            } else {
                const priority = new mod.Priority(textInput, color.r, color.g, color.b)
                profileManager.addPriority(priority)
                modToAddPriorityTo.priority = priority
            }
        }
    }

    const handleColorChange = (color) => {
        setColor(color.rgb)
    }

    return (
        <div className='popupContainer'>
            {isOpen && (
                <div className='popupOverlay'>
                    <div className='popupContent'>
                        <div className='popupTitle'>Create a New Priority Level</div>
                        <div className='popupTextInputArea'>
                            <div className='popupLabel'>Priority Name:</div>
                            <TextInputBox
                                onTextChange={(newInput) => { setTextInput(newInput) }}
                                placeholderText='Enter Priority Name'
                                length={25}
                                className={"popupTextInput"}
                            />
                        </div>
                        <div className='colorPickerArea'>
                            <div className='popupLabel'>Priority Color:</div>
                            <SketchPicker
                                color={color}
                                onChange={handleColorChange}
                                className='colorPicker'
                            />
                        </div>
                        <div className='popupButtonArea'>
                            <button
                                className='popupOptionButton'
                                onClick={() => {
                                    createNewPriority()
                                    setIsOpen(false)
                                }}
                            >
                                Create New Priority
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
    )
}

export default NewPriorityPopup
