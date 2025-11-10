import sys, os

# Add the parent directory to the Python path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import Backend.mod as mod, Backend.loadFromJson as loadFromJson

class DataManager():
    _profileManager:mod.ProfileManager

    def __init__(self):
        priorityList = [
            mod.Priority("High Priority", red=255, green=128, blue=0),
            mod.Priority("Medium Priority", red=255, green=196, blue=0),
            mod.Priority("Low Priority", red=255, green=255, blue=0)
        ]
        self._profileManager = mod.ProfileManager(priorityList=priorityList)

    def __del__(self):
        self._profileManager._profileList.clear()
        self._profileManager._priorityList.clear()

    def getData(self, data = False):
        try:
            if self._profileManager:
                return {
                    "profileManager" : self._profileManager.createDict(),
                    "errorMessage" : "None"
                }
            else:
                return {"errorMessage" : "profileManager does not exist!"}
        except Exception as e:
            return self._genericExceptionCatch(e)
        
    def restoreData(self, newData):
        try:
            if not self._profileManager:
                return {"errorMessage" : "profileManager does not exist!"}
            elif not newData:
                return {"errorMessage" : f"new data provided to this call is none or falsy"}

            profileIndex = 0
            for profileIndex, profileData in enumerate(newData["profileList"]):
                profile = loadFromJson.createProfile(rawJson=profileData, requireValidModURL=False)
                
                profileList = self._profileManager.getProfileList()
                if profileIndex >= len(profileList):
                    self._profileManager.addProfile(profile, saveToFile=False)
                else:
                    profileList[profileIndex] = profile
                    self._profileManager.updatePriorityLists()
                    self._profileManager.sortModLists()
            
            if profileIndex == 0:
                profile = mod.Profile()
                self._profileManager.addProfile(profile, saveToFile=False)

            for priorityData in newData["priorityList"]:
                priority = mod.Priority(
                    priorityData["name"],
                    priorityData["r"],
                    priorityData["g"],
                    priorityData["b"]
                )
                if priority not in self._profileManager._priorityList:
                    self._profileManager._priorityList.append(priority)

            return {
                "profileManager" : self._profileManager.createDict(),
                "errorMessage" : "None"
            }
        except Exception as e:
            return self._genericExceptionCatch(e)

    def getProfileList(self, data):
        try:
            profileData = self._profileManager.createDict()
            return {
                "profileList" : profileData["profileList"],
                "errorMessage" : "None"
            }
        except Exception as e:
            return self._genericExceptionCatch(e)
        
    def getNumProfiles(self, data):
        try:
            numProfiles = self._profileManager.getNumProfiles()
            return {
                "numProfiles" : numProfiles,
                "errorMessage" : "None"
            }
        except Exception as e:
            return self._genericExceptionCatch(e)

    def getPriorityList(self, data):
        try:
            priorityData = self._profileManager.createDict()
            return {
                "priorityList" : priorityData["priorityList"],
                "errorMessage" : "None"
            }
        except Exception as e:
            return self._genericExceptionCatch(e)

    def getProfile(self, data):
        try:
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
        
    def addProfile(self, data):
        def createDebugInfo():
            return {
                "profileData" : profileData,
                "profile" : str(profile),
                "profileManager" : self._profileManager.createDict()
            }

        try:
            profileData = data.get("profileData", None)
            profileName = data.get("profileName", None)

            if profileData:
                profile = loadFromJson.createProfile(rawJson=profileData)
            else:
                profile = mod.Profile()

            if profileName and len(profileName) > 0:
                profile.name = profileName
            
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
        
    def removeProfile(self, data):
        def createDebugInfo():
            return {
                "profileIndex" : profileIndex,
                "profileManager" : self._profileManager.createDict()
            }

        try:
            profileIndex = data.get("profileIndex", None)

            if profileIndex:
                profileList = self._profileManager.getProfileList()
                profileList.pop(profileIndex)
            else:
                return { "errorMessage" : "No profile index provided" }

            return {
                "debugInfo" : createDebugInfo(),
                "errorMessage" : "None"
            }
            
        except Exception as e:
            return self._genericExceptionCatch(e, createDebugInfo())
        
    def restoreProfile(self, data):
        def createDebugInfo():
            return {
                "profileData" : profileData,
                "profile" : str(profile),
                "profileManager" : self._profileManager.createDict()
            }

        try:
            profileData = data.get("profileData", None)
            profileIndex = data.get("profileIndex", None)

            profile = mod.Profile()
            if profileData:
                profile = loadFromJson.createProfile(rawJson=profileData)
            else:
                return { "errorMessage" : "No profile data provided (or it was falsy)" }
            
            profileList = self._profileManager.getProfileList()
            if profileIndex >= len(profileList):
                self._profileManager.addProfile(profile, saveToFile=False)
            else:
                profileList[profileIndex] = profile
                self._profileManager.updatePriorityLists()
                self._profileManager.sortModLists()

            return {
                "profile": profile.createDict(),
                "modListLength" : len(profile.modList),
                "priorityListLength" : len(profile.priorityList),
                "debugInfo" : createDebugInfo(),
                "errorMessage" : "None"
            }
            
        except Exception as e:
            return self._genericExceptionCatch(e, createDebugInfo())
        
    def updateProfile(self, data):
        try:
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
        
    def downloadReadyMods(self, data):
        try:
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

    def addMod(self, data):
        def createDebugInfo():
            profileDict = profile.createDict() if profile else "None"
            return {
                "url" : url,
                "profileIndex" : profileIndex,
                "profile" : profileDict,
                "profileManager" : self._profileManager.createDict()
            }
        
        try:
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

    def removeMod(self, data):
        try:
            profileIndex = data.get("profileIndex", None)
            modIndex = data.get("modIndex", -1)

            profile:mod.Profile = self._profileManager.getProfile(profileIndex)
            
            if profile.removeMod(modIndex):
                return {"errorMessage" : "None"}
            else:
                return {"errorMessage" : "Unable to remove this mod."}
        except Exception as e:
            return self._genericExceptionCatch(e)
        
    def updateModPriority(self, data):
        try:
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
        
    def addPriority(self, data):
        try:
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