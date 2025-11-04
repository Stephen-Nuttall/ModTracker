import sys, os
from fastapi import Request

# Add the parent directory to the Python path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import Backend.mod as mod, Backend.loadFromJson as loadFromJson

class DataManager():
    _profileManager:mod.ProfileManager

    def __init__(self, useTestSetup = False):
        priorityList = [
            mod.Priority("High Priority", red=255, green=128, blue=0),
            mod.Priority("Medium Priority", red=255, green=196, blue=0),
            mod.Priority("Low Priority", red=255, green=255, blue=0)
        ]
        if useTestSetup:
            self._profileManager = mod.ProfileManager([mod.Profile(
                    [mod.Mod("Test Mod 1"), mod.Mod("Test Mod 2"), mod.Mod("Test Mod 3")], priorityList, name="Test Profile"
                )], priorityList
            )
        else:
            self._profileManager = mod.ProfileManager(priorityList=priorityList)

    def __del__(self):
        self._profileManager._profileList.clear()
        self._profileManager._priorityList.clear()

    async def getData(self):
        try:
            if self._profileManager:
                return {
                    "profileManager" : self._profileManager.createDict(),
                    "errorMessage" : "None"
                }
            else:
                return {"errorMessage" : "ERROR: profileManager does not exist!"}
        except Exception as e:
            return self._genericExceptionCatch(e)

    async def getProfileList(self):
        try:
            profileData = self._profileManager.createDict()
            return {
                "profileList" : profileData["profileList"],
                "errorMessage" : "None"
            }
        except Exception as e:
            return self._genericExceptionCatch(e)

    async def getPriorityList(self):
        try:
            priorityData = self._profileManager.createDict()
            return {
                "priorityList" : priorityData["priorityList"],
                "errorMessage" : "None"
            }
        except Exception as e:
            return self._genericExceptionCatch(e)

    async def getProfile(self, request: Request):
        try:
            data = await request.json()
            profileIndex = data.get("profileIndex", None)

            if profileIndex == None:
                return { "errorMessage" : "Profile index not provided (or it was falsy)" }

            profile = self._profileManager.getProfile(profileIndex)
            
            if profile:
                return {
                    "profile" : profile.createDict(),
                    "modListLength" : len(profile.modList),
                    "priorityListLength" : len(profile.priorityList),
                    "errorMessage" : "None"
                }
            else:
                return {
                    "errorMessage" : f"Could not find a profile at index {profileIndex}." 
                }
        except Exception as e:
            return self._genericExceptionCatch(e)
        
    async def addProfile(self, request: Request):
        def createDebugInfo():
            return {
                "profileData" : profileData,
                "profile" : str(profile),
                "profileManager" : self._profileManager.createDict()
            }

        try:
            data = await request.json()
            profileData = data.get("profileData", None)

            profile = mod.Profile()
            if profileData:
                profile = loadFromJson.createProfile(rawJson=profileData)
            else:
                return { "errorMessage" : "No profile data provided (or data was falsy)" }
            
            self._profileManager.addProfile(profile, saveToFile=False)

            return {
                "profile": profile.createDict(),
                "modListLength" : len(profile.modList),
                "priorityListLength" : len(profile.priorityList),
                "debugInfo" : createDebugInfo(),
                "errorMessage" : "None"
            }
            
        except Exception as e:
            return self._genericExceptionCatch(e, createDebugInfo())
        

    async def updateProfile(self, request: Request):
        try:
            data = await request.json()
            profileIndex = data.get("profileIndex", None)
            newVersion = data.get("profileVersion", None)
            newName = data.get("profileName", None)
            refresh = data.get("refresh", True)

            profile:mod.Profile = self._profileManager.getProfile(profileIndex)
            
            if profile:
                if newVersion:
                    profile.selectedVersion = newVersion
                
                if newName:
                    profile.name = newName
                
                if refresh:
                    profile.refresh(newVersion)
                    
                profileList = self._profileManager.getProfileList()
                profileList[profileIndex] = profile

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
            return self._genericExceptionCatch(e)
        
    async def downloadReadyMods(self, request: Request):
        try:
            data = await request.json()
            profileIndex = data.get("profileIndex", None)
            loader = data.get("modLoader", None)

            if profileIndex == None:
                return { "errorMessage" : "Profile index not provided (or it was falsy)" }

            profile:mod.Profile = self._profileManager.getProfile(profileIndex)

            links = profile.downloadReadyMods(loader, preventDownload=True)
            
            if profile:
                return {
                    "downloadLinks" : links,
                    "errorMessage" : "None"
                }
            else:
                return {
                    "errorMessage" : f"Could not find a profile at index {profileIndex}." 
                }
        except Exception as e:
            return self._genericExceptionCatch(e)

    async def addMod(self, request: Request):
        def createDebugInfo():
            profileDict = profile.createDict() if profile else "None"
            return {
                "url" : url,
                "profileIndex" : profileIndex,
                "profile" : profileDict,
                "profileManager" : self._profileManager.createDict()
            }
        
        try:
            data = await request.json()
            profileIndex = data.get("profileIndex", None)
            url = data.get("url", None)

            profile:mod.Profile = self._profileManager.getProfile(profileIndex)

            if not profile:
                return {
                    "errorMessage" : f"Could not find a profile at index {profileIndex}.",
                    "debugInfo" : createDebugInfo()
                }
            if not url:
                return {
                    "errorMessage" : "URL provided was invalid.",
                    "debugInfo" : createDebugInfo()
                }
            else:
                if profile.addMod(url):
                    return {
                        "errorMessage" : "None",
                        "debugInfo" : createDebugInfo()
                    }
                else:
                    return {
                        "errorMessage" : "Unable to add this mod. Check the URL you provided and verify it's correct.",
                        "debugInfo" : createDebugInfo()
                    }
                
        except Exception as e:
            return self._genericExceptionCatch(e, createDebugInfo())

    async def removeMod(self, request: Request):
        try:
            data = await request.json()
            profileIndex = data.get("profileIndex", None)
            modIndex = data.get("modIndex", -1)

            profile:mod.Profile = self._profileManager.getProfile(profileIndex)
            
            if profile.removeMod(modIndex):
                return {"errorMessage" : "None"}
            else:
                return {"errorMessage" : "Unable to remove this mod."}
        except Exception as e:
            return self._genericExceptionCatch(e)
        
    async def updateModPriority(self, request: Request):
        try:
            data = await request.json()

            profileIndex = data.get("profileIndex", None)
            modIndex = data.get("modIndex", -1)

            priorityName = data.get("priorityName", "Something went wrong")
            r = data.get("red", 0)
            g = data.get("green", 0)
            b = data.get("blue", 0)

            newPriority = mod.Priority(priorityName, r, g, b)

            profile:mod.Profile = self._profileManager.getProfile(profileIndex)
            modObj:mod.Mod = profile.getMod(modIndex)
            modObj.priority = newPriority
            
            return {
                "priority" : modObj.priority.createDict(),
                "errorMessage" : "None"
            }
        except Exception as e:
            return self._genericExceptionCatch(e)
        
    async def addPriority(self, request: Request):
        try:
            data = await request.json()

            profileIndex = data.get("profileIndex", None)
            modIndex = data.get("modIndex", -1)

            priorityName = data.get("priorityName", "Something went wrong")
            r = data.get("red", 0)
            g = data.get("green", 0)
            b = data.get("blue", 0)

            newPriority = mod.Priority(priorityName, r, g, b)

            self._profileManager.addPriority(newPriority)

            if profileIndex > -1 and modIndex > -1:
                profile:mod.Profile = self._profileManager.getProfile(profileIndex)
                if newPriority not in profile.priorityList:
                    profile.priorityList.append(newPriority)
                
                modObj:mod.Mod = profile.getMod(modIndex)
                modObj.priority = newPriority
                
                return {
                    "priority" : self._profileManager.getPriorityList()[-1].createDict(),
                    "errorMessage" : "None"
                }
            else:
                return {
                    "errorMessage" : "None"
                }
        except Exception as e:
            return self._genericExceptionCatch(e)

    def _genericExceptionCatch(self, exception, debugInfo = None):
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        output = { "errorMessage" : f"{str(exception)}.\nException Details: {exc_type} {fname} {exc_tb.tb_lineno}"}

        if debugInfo:
            output["debugInfo"] = debugInfo

        return output