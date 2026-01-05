import React from 'react'
import profile from './profile.js'
import loadFromJson from '../data/loadFromJson.js'

let profileManager = new profile.ProfileManager()
const storedData = localStorage.getItem('profiles')

if (storedData) {
    console.log("Restoring saved data...")
    try {
        const parsedData = JSON.parse(storedData)
        profileManager = loadFromJson.createProfileManager(parsedData)
        console.log("Saved data restored.")
    } catch (error) {
        if (error.name == "Blank manager data") {
            console.log("Stored data was empty or invalid. Creating blank save.")
            profileManager = new profile.ProfileManager()
        } else {
            console.error("Error restoring saved data. Creating blank save.\n" + error)
            profileManager = new profile.ProfileManager()
        }
    }
} else {
    console.log("No saved data found. Creating blank save.")
}

export default profileManager