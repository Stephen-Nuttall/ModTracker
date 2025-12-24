import React from "react"
import profileManager from '../data/stateProvider.jsx'

import TableManager from '../widgets/tableManager'
import NewPriorityPopup from '../widgets/newPriorityPopup'
import TextInputBox from '../widgets/textInputBox'
import ChartManager from '../widgets/chartManager'
import EditableText from '../widgets/EditableText'

import '../styles/detailsWindow.css'

function DetailsWindow({ profileIndex, setCurProfileIndex, isLoading }) {
    const [managerHash, forceRerender] = React.useState("")

    const [priorityPopupOpen, OpenPriorityPopup] = React.useState(false)
    const [modToAddPriorityTo, setModToAddPriorityTo] = React.useState(-1)
    const [modInput, setModInput] = React.useState('');
    const [versionInput, setVersionInput] = React.useState('');
    const [funcOutputText, setFuncOutput] = React.useState('');

    const profile = profileManager.getProfile(profileIndex)

    React.useEffect(() => {
        if (isLoading == true) {
            setFuncOutput("Loading...")
        } else if (funcOutputText == "Loading...") {
            setFuncOutput("")
        }
    }, [isLoading])

    const addMod = async () => {
        try {
            await profile.addMod(modInput)
            profileManager.saveToStorage()
            setFuncOutput("Mod added successfully.")
        } catch (error) {
            if (error.name == "Invalid URL") {
                setFuncOutput("Could not add that mod! Please check the URL and try again.")
            } else {
                throw error
            }
        }
    }

    function reloadProfile() {
        const version = versionInput.length > 0 ? versionInput : profile.selectedVersion
        profile.selectedVersion = version

        profile.refresh()
        profileManager.saveToStorage()
        forceRerender(profileManager.hash())
    }

    function renameProfile(profileName) {
        profile.name = profileName
        profileManager.saveToStorage()
        forceRerender(profileManager.hash())
    }

    function downloadMods() {
        let select = document.getElementById("loaderDropdown")
        let loader = select.value

        profile.downloadReadyMods(loader)
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
        setCurProfileIndex(-1)
    }

    return (
        <>
            <div className="profile-layout">
                {/* LEFT COLUMN */}
                <div className="left-column">
                    <div className="info-row">
                        <h2>
                            <EditableText value={profile.name} onChange={renameProfile} />
                        </h2>
                        <label>Selected Version: {profile.selectedVersion}</label>
                    </div>

                    <TableManager
                        profile={profile}
                        priorityList={profileManager.getPriorityList()}
                        OpenPriorityPopup={OpenPriorityPopup}
                        setModToAddPriorityTo={setModToAddPriorityTo}
                        forceRerender={forceRerender}
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
                <div className="right-column">
                    <div className="button-row">
                        <TextInputBox
                            onTextChange={(newInput) => { setVersionInput(newInput) }}
                            onPressEnter={reloadProfile}
                            placeholderText={"Enter new version"}
                            length={15}
                            className={"version-input"}
                        />
                        <button onClick={reloadProfile} className="menu-button">⟳</button>
                        <button onClick={exportProfile} className="menu-button">Export</button>
                        <button onClick={backToSelectView} className="menu-button">Back</button>
                    </div>

                    <div className='function-output-detailsWindow'>{funcOutputText}</div>
                    <ChartManager className="chart" profile={profile} />

                    <div className="download-row">
                        <button onClick={downloadMods} className="menu-button">Download Available Mods</button>
                        <select id='loaderDropdown' className="menu-button">
                            <option value="forge">Forge</option>
                            <option value="fabric">Fabric</option>
                            <option value="neoforge">NeoForge</option>
                            <option value="quilt">Quilt</option>
                        </select>
                    </div>
                </div>
            </div>

            <NewPriorityPopup
                isOpen={priorityPopupOpen}
                setIsOpen={OpenPriorityPopup}
                profileManager={profileManager}
                modToAddPriorityTo={modToAddPriorityTo}
            />
        </>
    );
}

export default DetailsWindow;
