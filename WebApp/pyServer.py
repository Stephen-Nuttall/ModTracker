from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import sys, os

# Add the parent directory to the Python path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import Backend.mod as mod, Backend.loadFromJson as loadFromJson

profileManager:mod.ProfileManager

async def lifespan(app: FastAPI):
    global profileManager
    profileManager = mod.ProfileManager([mod.Profile([
        mod.Mod(url="https://modrinth.com/mod/sodium"),
        mod.Mod(url="https://modrinth.com/mod/lithium")])], [
        mod.Priority("High Priority"), mod.Priority("Medium Priority"), mod.Priority("Low Priority")
    ])

    yield

    profileManager._profileList.clear()
    profileManager._priorityList.clear()

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def genericExceptionCatch(exception):
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    return { "errorMessage" : f"{str(exception)}.\nException Details: {exc_type} {fname} {exc_tb.tb_lineno}"}

@app.post("/get-data")
async def getData():
    global profileManager
    try:
        if profileManager:
            return profileManager.createDict()
        else:
            return {"errorMessage" : "ERROR: profileManager does not exist!"}
    except Exception as e:
        return genericExceptionCatch(e)

@app.post("/get-profile-list")
async def getProfileList():
    global profileManager
    try:
        profileData = profileManager.createDict()
        return profileData["profileList"]
    except Exception as e:
        return genericExceptionCatch(e)

@app.post("/get-priority-list")
async def getPriorityList():
    global profileManager
    try:
        profileData = profileManager.createDict()
        return profileData["priorityList"]
    except Exception as e:
        return genericExceptionCatch(e)

@app.post("/get-profile")
async def getProfile(request: Request):
    global profileManager
    try:
        data = await request.json()
        profileIndex = data.get("profileIndex", -1)

        profile = profileManager.getProfile(profileIndex)
        
        if profile:
            return {
                "profile": profile.createDict(),
                "modListLength" : len(profile.modList),
                "priorityListLength" : len(profile.priorityList),
                "errorMessage" : "None"
            }
        else:
            return {
                "errorMessage" : f"Could not find a profile at index {profileIndex}." 
            }
    except Exception as e:
        return genericExceptionCatch(e)
    
@app.post("/load-profiles")
async def loadProfiles():
    global profileManager
    try:
        profileList = loadFromJson.createProfileList()
        for profile in profileList:
            profileManager.addProfile(profile)   

        return profileManager.createDict()     
    except Exception as e:
        return genericExceptionCatch(e)

@app.post("/add-mod")
async def addMod(request: Request):
    global profileManager
    try:
        data = await request.json()
        profileIndex = data.get("profileIndex", -1)
        url = data.get("url", "Something went wrong")

        profile:mod.Profile = profileManager.getProfile(profileIndex)
        
        if profile.addMod(url):
            return {"errorMessage" : "None"}
        else:
            return {"errorMessage" : "Unable to add this mod. Check the URL you provided and verify it's correct."}
    except Exception as e:
        return genericExceptionCatch(e)

@app.post("/remove-mod")
async def removeMod(request: Request):
    global profileManager
    try:
        data = await request.json()
        profileIndex = data.get("profileIndex", -1)
        modIndex = data.get("modIndex", -1)

        profile:mod.Profile = profileManager.getProfile(profileIndex)
        
        if profile.removeMod(modIndex):
            return {"errorMessage" : "None"}
        else:
            return {"errorMessage" : "Unable to remove this mod."}
    except Exception as e:
        return genericExceptionCatch(e)
    
@app.post("/update-mod-priority")
async def updateModPriority(request: Request):
    global profileManager
    try:
        data = await request.json()

        profileIndex = data.get("profileIndex", -1)
        modIndex = data.get("modIndex", -1)

        priorityName = data.get("priorityName", "Something went wrong")
        r = data.get("red", 0)
        g = data.get("green", 0)
        b = data.get("blue", 0)

        newPriority = mod.Priority(priorityName, r, g, b)

        profile:mod.Profile = profileManager.getProfile(profileIndex)
        modObj:mod.Mod = profile.getMod(modIndex)
        modObj.priority = newPriority
        
        return {
            "priority" : modObj.priority.createDict(),
            "errorMessage" : "None"
        }
    except Exception as e:
        return genericExceptionCatch(e)
    
@app.post("/add-priority")
async def addPriority(request: Request):
    global profileManager
    try:
        data = await request.json()

        profileIndex = data.get("profileIndex", -1)
        modIndex = data.get("modIndex", -1)

        priorityName = data.get("priorityName", "Something went wrong")
        r = data.get("red", 0)
        g = data.get("green", 0)
        b = data.get("blue", 0)

        newPriority = mod.Priority(priorityName, r, g, b)
        profileManager.addPriority(newPriority)

        if profileIndex > -1 and modIndex > -1:
            profile:mod.Profile = profileManager.getProfile(profileIndex)
            profile.priorityList.append(newPriority)
            
            modObj:mod.Mod = profile.getMod(modIndex)
            modObj.priority = newPriority
        
        return {
            "priority" : profileManager.getPriorityList()[-1].createDict(),
            "errorMessage" : "None"
        }
    except Exception as e:
        return genericExceptionCatch(e)