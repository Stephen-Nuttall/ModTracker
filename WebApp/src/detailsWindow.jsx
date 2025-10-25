import { useState, useRef } from 'react'

import ProfileFetcher from './profileFetcher'
import TableManager from './tableManager'
import NewPriorityPopup from './newPriorityPopup'
import TextInputBox from './textInputBox'

function DetailsWindow() {
    const requestRef = useRef(null)
    const [priorityPopupOpen, OpenPriorityPopup] = useState(false)
    const [modToAddPriorityTo, setModToAddPriorityTo] = useState(-1)

    const blankProfileData = {
        profile: {
            "name": "No Data",
            "version": "No Data",
            "modlist": [],
            "priorityList": []
        },
        modListLength: 0,
        priorityListLength: 0,
        errorMessage: "None"
    }

    const [profileData, setProfileData] = useState(blankProfileData)
    const [modInput, setModInput] = useState('');
    const [versionInput, setVersionInput] = useState('');
    const [output, setOutput] = useState('');

    const addMod = async () => {
        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "add-mod", { url: modInput, profileIndex: 0 },
                "Failed to add mod: ", "Mod successfully added."
            )
        } else {
            console.error("requestRef is not set!")
        }
    }

    const reloadProfile = async () => {
        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "update-profile", { profileIndex: 0, profileVersion: versionInput },
                "Failed to update profile: ", "Profile successfully reloaded."
            )
        } else {
            console.error("requestRef is not set!")
        }
    }

    return (
        <>
            <ProfileFetcher updateData={setProfileData} setOutputText={setOutput} ref={requestRef} />

            <div>
                <h2>{profileData.profile.name}</h2>
                Selected Version:
                <TextInputBox
                    onTextChange={(newInput) => { setVersionInput(newInput) }}
                    placeholderText={profileData.profile.version}
                    length={25}
                />
                <button onClick={reloadProfile} className="generic-button">⟳</button>
            </div>

            <TableManager
                profileData={profileData}
                requestRef={requestRef}
                OpenPriorityPopup={OpenPriorityPopup}
                setModToAddPriorityTo={setModToAddPriorityTo}
            />

            <div>
                <TextInputBox
                    onTextChange={(newInput) => { setModInput(newInput) }}
                    placeholderText='Enter Mod URL'
                    length={75}
                />
                <button onClick={addMod} className="generic-button">Add Mod</button>
                <pre>{output}</pre>
            </div>

            <NewPriorityPopup
                isOpen={priorityPopupOpen}
                setIsOpen={OpenPriorityPopup}
                requestRef={requestRef}
                priorityList={profileData.profile.priorityList}
                modToAddPriorityTo={modToAddPriorityTo}
            />
        </>
    );
}

export default DetailsWindow;
