import './styles/profileSelectWindow.css'

function ProfileSelectWindow({ profileList, requestRef }) {
    const profiles = profileList ?? []

    function onTileClick(tileNum) {
        console.log("Going to details window for profile #" + tileNum)
        const base = window.location.origin.replace(/\/+$/, "")
        window.location.href = `${base}/profile=${tileNum}`
    }

    const createNewProfile = async () => {
        if (requestRef.current) {
            const data = await requestRef.current?.genericRequest(
                "add-profile", {},
                "Failed to add profile: ", "Profile successfully added."
            )
        } else {
            console.error("requestRef is not set!")
        }
    }

    return (
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
                    <button key={i} className="tile" onClick={() => onTileClick(i)}>
                        <div className="tile-inner">
                            <h2 className="profile-name">{profile.name}</h2>
                            <div className="mods-count">{modsCount} mods</div>
                            <div className="ready">{percent}% ready for {profile.version}</div>
                        </div>

                        <button className="tile-edit">✏️</button>
                        <button className="tile-close">X</button>
                    </button>
                )
            })}

            <button className="tile" onClick={createNewProfile}>
                <div className="tile-inner">
                    <h1>+</h1>
                </div>
            </button>
        </section>
    )
}

export default ProfileSelectWindow