import React from 'react'
import profileManager from '../data/stateProvider.jsx'
import NewProfilePopup from '../widgets/newProfilePopup'
import '../styles/profileSelectWindow.css'

function ProfileSelectWindow({ setCurProfileIndex }) {
    const [managerHash, forceRerender] = React.useState("")

    const [popupOpen, setPopupOpen] = React.useState(false)
    const [funcOutputText, setFuncOutput] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const profiles = profileManager.getProfileList()

    React.useEffect(() => {
        if (isLoading == true) {
            setFuncOutput("Loading...")
        } else if (funcOutputText == "Loading...") {
            setFuncOutput("")
        }
    }, [isLoading])

    function onTileClick(tileNum) {
        profileManager.refreshPriorityList()
        setCurProfileIndex(tileNum)
    }

    function removeProfile(index) {
        profileManager.removeProfile(index)
        forceRerender(profileManager.hash() + " ")
    }

    function editProfile(index) {
        console.log("placeholder")
        forceRerender(profileManager.hash())
    }

    return (
        <div className='profile-select-container'>
            <div className='function-output-profileSelect'>{funcOutputText}</div>
            <section className="profile-grid">
                {profiles.map((profile, i) => {
                    const modsCount = profile.getNumMods()
                    const percent = profile.getPercentReady()

                    return (
                        <div key={i} className="tile" role="button" onClick={() => onTileClick(i)}>
                            <div className="tile-inner">
                                <h2 className="profile-name">{profile.name}</h2>
                                <div className="mods-count">{modsCount} mods</div>
                                <div className="ready">{percent}% ready for {profile.selectedVersion}</div>
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

            <NewProfilePopup isOpen={popupOpen} setIsOpen={setPopupOpen} profileManager={profileManager} setFuncOutput={setFuncOutput} />
        </div>
    )
}

export default ProfileSelectWindow