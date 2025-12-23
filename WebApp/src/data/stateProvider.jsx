import { proxy } from 'valtio'
import profile from './profile.js'
import loadFromJson from '../data/loadFromJson.js'

let profileManager = new profile.ProfileManager()
const storedData = localStorage.getItem('profiles')
const parsedData = JSON.parse(storedData)

if (storedData) {
    console.log("restoring saved data")
    try {
        profileManager = loadFromJson.createProfileManager(parsedData)
    } catch (error) {
        if (error.name == "Blank manager data") {
            profileManager = new profile.ProfileManager()
        } else {
            throw error
        }
    }
}

const profileState = proxy(profileManager)
export default profileState