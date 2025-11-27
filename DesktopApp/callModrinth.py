import requests, re

_modrinthRegex = r"^https:\/\/(www\.)?modrinth\.com\/mod\/[a-zA-Z0-9-_]+\/?$"
_requestTimeout = 10.0 # How many seconds to wait for an API call before timeout.

# Verify if the URL this mod was initialized with is specifically a Modrinth URL
def verifyURL(url:str):
    modrinth = re.compile(_modrinthRegex)
    return modrinth.match(url)

def _genericModrinthCall(url:str, requestParameters:dict = None):
    try:
        if requestParameters == None:
            response = requests.get(url, timeout=(_requestTimeout, _requestTimeout))
        else:
            response = requests.get(url, params=requestParameters, timeout=(_requestTimeout, _requestTimeout))
    
        if response.status_code == 200:
            return response.json()  
        else:
            print(f"Error reaching Modrinth API: {response.status_code}, {response.text}")
            return False
    except requests.exceptions.Timeout:
        print(f"Mondrinth API request timed out after {_requestTimeout} seconds")
        return False
    except requests.exceptions.ConnectionError:
        print(f"Failed to reach Modrinth API")
        return False
    
def ping():
    return _genericModrinthCall("https://api.modrinth.com/") != False

def modData(mod_slug:str):
    url = f"https://api.modrinth.com/v2/project/{mod_slug}"
    return _genericModrinthCall(url)

def modVersionList(mod_slug:str):
    url = f"https://api.modrinth.com/v2/project/{mod_slug}/version"
    return _genericModrinthCall(url)

def downloadMod(mod_slug:str, loader:str, version:str):
    loader = loader.lower()
    versionList = modVersionList(mod_slug)

    for ver in versionList:
        if loader in ver["loaders"] and version in ver["game_versions"]:
            for file in ver["files"]:
                return file["url"]
            
    return False

# Searches modrinth API for mods with a similar name to query.
# Returns a list of json data for each result, or False if no results were found. numResults must be > 0.
# If numResults is 1, only a single json dictionary will be returned, instead of a list of json dictionaries. 
def searchModrinth(modName:str, numResults:int):
    if numResults <= 0:
        return False

    search_url = "https://api.modrinth.com/v2/search"
    params = {"query": modName, "limit": numResults, "facets": '[["project_type:mod"]]'}
    response = _genericModrinthCall(search_url, params)

    if not response:
        return False
    else:
        results = response["hits"]
        if numResults == 1:
            return results[0]
        else:
            return results