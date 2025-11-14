import requests, re, sys, os

# Add the parent directory to the Python path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import API_Keys

_curseforgeRegex = r"^https:\/\/(www\.)?curseforge\.com\/minecraft\/mc-mods\/[a-zA-Z0-9-_]+\/?$"
_requestTimeout = 10.0 # How many seconds to wait for an API call before timeout.
_allowedCategoryIDs = [6, 4906, 6814, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441]

# Verify if the URL this mod was initialized with is specifically a Curseforge URL
def verifyURL(url:str):
    curseforge = re.compile(_curseforgeRegex)
    return curseforge.match(url)

def _genericCurseforgeCall(url:str, requestParameters:dict = None):
    apiKey = API_Keys.CurseForge
    # gameID = 432 # 432 = Minecraft

    headers = {"Accept": "application/json", "x-api-key": apiKey}

    try:
        if requestParameters == None:
            response = requests.get(url, headers=headers, timeout=_requestTimeout)
        else:
            response = requests.get(url, headers=headers, params=requestParameters, timeout=_requestTimeout)

        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error reaching CurseForge API: {response.status_code}, {response.text}")
            return False
    except requests.exceptions.Timeout:
        print(f"CurseForge API request timed out after {_requestTimeout} seconds")
        return False
    except requests.exceptions.ConnectionError:
        print(f"Failed to reach CurseForge API")
        return False
    
def ping():
    placeholder_mod_slug = "sodium"
    return _genericCurseforgeCall(f"https://api.curseforge.com/v1/mods/search?gameId=432&slug={placeholder_mod_slug}") != False

def modData(mod_slug):
    url = f"https://api.curseforge.com/v1/mods/search?gameId=432&slug={mod_slug}"
    json = _genericCurseforgeCall(url)

    if not json:
        return False

    try:
        # take the first search result that is not a custom map, texture pack, or anything that isn't a mod
        for entry in json["data"]:
            if entry["primaryCategoryId"] in _allowedCategoryIDs:
                return entry
        return False
    except IndexError:
        return False
    
def sortVersionList(curseforgeJson):
    fileIndexes = curseforgeJson["latestFilesIndexes"]
    parsedVersions = []

    for file in fileIndexes:
        parsedVersions.append(list(map(int, file["gameVersion"].split('.'))))

    sortedVersions = sorted(parsedVersions)

    unparsedVersions = []
    for versionComponents in sortedVersions:
        if len(versionComponents) == 3:
            versionStr = f"{versionComponents[0]}.{versionComponents[1]}.{versionComponents[2]}"
        else:
            versionStr = f"{versionComponents[0]}.{versionComponents[1]}"
        unparsedVersions.append(versionStr)
    
    return unparsedVersions

def modLoader_IDtoText(loaderID:int):
    match loaderID:
        case 0:
            return "Any"
        case 1:
            return "Forge"
        case 2:
            return "Cauldron"
        case 3:
            return "LiteLoader"
        case 4:
            return "Fabric"
        case 5:
            return "Quilt"
        case 6:
            return "NeoForge"
        case _:
            return -1

def downloadMod(curseforgeJson, mod_id:int, loader:str, version:str):
    fileIndexes = curseforgeJson["latestFilesIndexes"]

    # Get the FileId of the first file (from a sorted list) that has the right mod loader, and use it to get that file's download link
    for file in fileIndexes:
        # if file's gameVersion matches version, the file has a modLoader entry, and that modLoader entry matches loader, then make an API call for the download link
        if file["gameVersion"] == version and "modLoader" in file and (file["modLoader"] == 0 or modLoader_IDtoText(file["modLoader"]) == loader):
            url = f"https://api.curseforge.com/v1/mods/{mod_id}/files/{file['fileId']}"
            downloadLink = _genericCurseforgeCall(url)["data"]["downloadUrl"]

            if downloadLink:
                return downloadLink

    return False

def searchCurseforge(modName:str):
    validResults = []
    result = _genericCurseforgeCall("https://api.curseforge.com/v1/mods/search", {"gameId": 432, "searchFilter": modName, "pageSize": 1})

    if not result:
        return False

    for entry in result["data"]:
        if entry["primaryCategoryId"] in _allowedCategoryIDs:
            validResults.append(entry)
        
    if validResults:
        return validResults
    else:
        return False