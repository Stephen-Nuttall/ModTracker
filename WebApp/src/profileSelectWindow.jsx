import { useState, useEffect } from 'react'
import NewProfilePopup from './newProfilePopup'
import './styles/profileSelectWindow.css'

function ProfileSelectWindow({ profileList, requestRef, setCurProfileIndex, isLoading }) {
    const [popupOpen, setPopupOpen] = useState(false)
    const [funcOutputText, setFuncOutput] = useState('');
    const profiles = profileList ?? []

    useEffect(() => {
        if (isLoading == true) {
            setFuncOutput("Loading...")
        } else if (funcOutputText == "Loading...") {
            setFuncOutput("")
        }
    }, [isLoading])

    function onTileClick(tileNum) {
        console.log("Going to details window for profile #" + tileNum)
        setCurProfileIndex(tileNum)
    }

    const removeProfile = async (index) => {
        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "remove-profile", { profileIndex: index },
                "Failed to remove profile: ", "Profile successfully removed."
            )

            if (data?.errorMessage != "None") {
                setFuncOutput("Failed to remove profile.")
            } else {
                setFuncOutput("Profile successfully removed.")
            }
        } else {
            console.error("requestRef is not set!")
        }
    }

    const editProfile = async (profileIndex) => {
        console.log("placeholder")
    }

    return (
        <div className='profile-select-container'>
            <div className='function-output-profileSelect'>{funcOutputText}</div>
            <section className="profile-grid">
                {profiles.map((profile, i) => {
                    let readyCount = 0
                    for (const mod of profile.modlist) {
                        if (mod.versions.includes(profile.version)) {
                            readyCount++
                        }
                    }

                    const modsCount = Number(profile.modlist.length || 0)
                    const percent = modsCount ? Math.round((readyCount / modsCount) * 100) : 0

                    return (
                        <div key={i} className="tile" role="button" onClick={() => onTileClick(i)}>
                            <div className="tile-inner">
                                <h2 className="profile-name">{profile.name}</h2>
                                <div className="mods-count">{modsCount} mods</div>
                                <div className="ready">{percent}% ready for {profile.version}</div>
                            </div>

                            {/* <button className="tile-edit" onClick={
                            (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (typeof editProfile === 'function')
                                    editProfile(i)
                            }
                        }
                        >✏️</button> */}
                            <button className="tile-close" onClick={
                                (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (typeof removeProfile === 'function')
                                        removeProfile(i)
                                }
                            }
                            >X</button>
                        </div>
                    )
                })}

                <div className="tile" role="button" onClick={() => { setPopupOpen(true) }}>
                    <div className="tile-inner">
                        <h1>+</h1>
                    </div>
                </div>
            </section>

            <NewProfilePopup isOpen={popupOpen} setIsOpen={setPopupOpen} requestRef={requestRef} setFuncOutput={setFuncOutput} />
        </div>
    )
}

export default ProfileSelectWindow