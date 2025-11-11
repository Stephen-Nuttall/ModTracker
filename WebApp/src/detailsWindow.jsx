import { useState } from 'react'

import TableManager from './tableManager'
import NewPriorityPopup from './newPriorityPopup'
import TextInputBox from './textInputBox'
import ChartManager from './chartManager'
import EditableText from './EditableText'

import './styles/detailsWindow.css'

function DetailsWindow({ profileIndex, profile, requestRef }) {
    const [priorityPopupOpen, OpenPriorityPopup] = useState(false)
    const [modToAddPriorityTo, setModToAddPriorityTo] = useState(-1)
    const [modInput, setModInput] = useState('');
    const [versionInput, setVersionInput] = useState('');
    const [funcOutputText, setFuncOutput] = useState('');

    const addMod = async () => {
        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "add-mod", { url: modInput, profileIndex: profileIndex },
                "Failed to add mod: ", "Mod successfully added."
            )

            if (data?.errorMessage != "None") {
                setFuncOutput("Unable to add this mod. Check the URL you provided and try again.")
            } else {
                setFuncOutput("Mod successfully added.")
            }
        } else {
            console.error("requestRef is not set!")
        }
    }

    const reloadProfile = async (newProfileName = "") => {
        let name = newProfileName.length > 0 ? newProfileName : profile?.name
        let version = versionInput.length > 0 ? versionInput : profile?.version

        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "update-profile", { profileIndex: profileIndex, profileVersion: version, profileName: name },
                "Failed to update profile: ", "Profile successfully refreshed."
            )

            if (data?.errorMessage != "None") {
                setFuncOutput("Failed to update profile.")
            } else {
                setFuncOutput("Profile successfully refreshed.")
            }
        } else {
            console.error("requestRef is not set!")
        }
    }

    const renameProfile = async (profileName) => {
        reloadProfile(profileName)
    }

    const downloadMods = async () => {
        let select = document.getElementById("loaderDropdown")
        let loader = select.value

        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "download-mods", { profileIndex: profileIndex, modLoader: loader },
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

            console.log("Successfully downloaded " + numSuccess + " " + loader + " mods for " + profile?.version)
            setFuncOutput("Successfully downloaded " + numSuccess + " " + loader + " mods for " + profile?.version)
        } else {
            console.error("requestRef is not set!")
        }
    }

    function exportProfile() {
        const json = JSON.stringify(profile);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = profile?.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        setFuncOutput("Profile successfully exported.")
    }

    function backToSelectView() {
        console.log("Going to profile select window")
        const base = window.location.origin.replace(/\/+$/, "");
        window.location.href = base;
    }

    return (
        <>
            <div className="profile-layout">
                {/* LEFT COLUMN */}
                <div className="left-column">
                    <div className="controls">
                        <h2>
                            <EditableText value={profile?.name} onChange={renameProfile} />
                        </h2>
                        <label>Selected Version: {profile?.version}</label>
                    </div>

                    <TableManager
                        profile={profile}
                        requestRef={requestRef}
                        profileIndex={profileIndex}
                        OpenPriorityPopup={OpenPriorityPopup}
                        setModToAddPriorityTo={setModToAddPriorityTo}
                    />

                    <div className="add-mod">
                        <TextInputBox
                            onTextChange={(newInput) => { setModInput(newInput) }}
                            onPressEnter={addMod}
                            placeholderText='Enter Mod URL'
                            className={"add-mod-textbox"}
                        />
                        <button onClick={addMod} className="add-mod-button">Add Mod</button>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <aside className="right-column">
                    <div className="button-row">
                        <TextInputBox
                            onTextChange={(newInput) => { setVersionInput(newInput) }}
                            onPressEnter={reloadProfile}
                            placeholderText={"Enter new version"}
                            length={15}
                            className={"version-input"}
                        />
                        <button onClick={reloadProfile} className="generic-button">⟳</button>
                        <button onClick={exportProfile} className="generic-button">Export</button>
                        <button onClick={backToSelectView} className="generic-button">Back</button>
                    </div>

                    <ChartManager className="chart" profile={profile} />
                    <pre>{funcOutputText}</pre>

                    <div className="download-row">
                        <button onClick={downloadMods} className="generic-button">Download Available Mods</button>
                        <select id='loaderDropdown'>
                            <option value="forge">Forge</option>
                            <option value="fabric">Fabric</option>
                            <option value="neoforge">NeoForge</option>
                            <option value="quilt">Quilt</option>
                        </select>
                    </div>
                </aside>
            </div>

            <NewPriorityPopup
                isOpen={priorityPopupOpen}
                setIsOpen={OpenPriorityPopup}
                requestRef={requestRef}
                profileIndex={profileIndex}
                priorityList={profile?.priorityList}
                modToAddPriorityTo={modToAddPriorityTo}
            />
        </>
    );
}

export default DetailsWindow;
