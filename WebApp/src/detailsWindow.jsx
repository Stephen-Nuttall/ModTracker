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

    const downloadProfile = async () => {
        let select = document.getElementById("loaderDropdown")
        let loader = select.value

        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "download-mods", { profileIndex: 0, modLoader: loader },
                "Failed to download mods: ", false, false
            )

            let numSuccess = 0
            if (data.errorMessage == "None") {
                for (let url of data.downloadLinks) {
                    if (url != false) {
                        window.open(url, '_blank')
                        numSuccess++
                    }
                }
            }

            console.log("Successfully downloaded " + numSuccess + " " + loader + " mods for " + profileData.profile.version)
            setOutput("Successfully downloaded " + numSuccess + " " + loader + " mods for " + profileData.profile.version)
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

            <div>
                <button onClick={downloadProfile} className="generic-button">Download Ready Mods</button>
                <select id='loaderDropdown'>
                    <option value="forge">Forge</option>
                    <option value="fabric">Fabric</option>
                    <option value="neoforge">NeoForge</option>
                    <option value="quilt">Quilt</option>
                </select>
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
