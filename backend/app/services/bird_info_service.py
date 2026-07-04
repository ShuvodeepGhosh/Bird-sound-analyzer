import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger("birdsense.services.bird_info")

class BirdInfoService:
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        
    async def get_bird_info(self, scientific_name: str) -> Dict[str, Any]:
        if scientific_name in self.cache:
            return self.cache[scientific_name]
            
        info = {
            "image_url": None,
            "description": None,
            "order": None,
            "family": None,
            "gbif_taxon_key": None
        }
        
        headers = {"User-Agent": "BirdSoundAnalyzer/1.0 (https://github.com/example/bird-sound-analyzer)"}
        async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
            try:
                # 1. Fetch from GBIF API
                # https://api.gbif.org/v1/species/match?name=Turdus%20migratorius
                gbif_resp = await client.get(
                    "https://api.gbif.org/v1/species/match",
                    params={"name": scientific_name, "strict": "true"}
                )
                if gbif_resp.status_code == 200:
                    gbif_data = gbif_resp.json()
                    if gbif_data.get("matchType") == "EXACT" or gbif_data.get("matchType") == "FUZZY":
                        info["gbif_taxon_key"] = gbif_data.get("usageKey")
                        info["order"] = gbif_data.get("order")
                        info["family"] = gbif_data.get("family")
                        
            except Exception as e:
                logger.error(f"GBIF API error for {scientific_name}: {str(e)}")

            try:
                # 2. Fetch from Wikipedia API (using categories to get IUCN status and summary for description)
                # First, query categories to get IUCN status (resolving redirects)
                wiki_cat_resp = await client.get(
                    "https://en.wikipedia.org/w/api.php",
                    params={
                        "action": "query",
                        "prop": "categories",
                        "titles": scientific_name,
                        "cllimit": "50",
                        "redirects": "1",
                        "format": "json"
                    }
                )
                if wiki_cat_resp.status_code == 200:
                    cat_data = wiki_cat_resp.json()
                    pages = cat_data.get("query", {}).get("pages", {})
                    for page_id, page_info in pages.items():
                        categories = page_info.get("categories", [])
                        for cat in categories:
                            title = cat.get("title", "").lower()
                            if "iucn red list" in title:
                                if "extinct species" in title: info["iucn_category"] = "EX"
                                elif "extinct in the wild" in title: info["iucn_category"] = "EW"
                                elif "critically endangered" in title: info["iucn_category"] = "CR"
                                elif "endangered" in title: info["iucn_category"] = "EN"
                                elif "vulnerable" in title: info["iucn_category"] = "VU"
                                elif "near threatened" in title: info["iucn_category"] = "NT"
                                elif "least concern" in title: info["iucn_category"] = "LC"
                                elif "data deficient" in title: info["iucn_category"] = "DD"
                                break
                                
                # 3. Fetch Wikipedia summary
                wiki_resp = await client.get(
                    f"https://en.wikipedia.org/api/rest_v1/page/summary/{scientific_name.replace(' ', '_')}"
                )
                if wiki_resp.status_code == 200:
                    wiki_data = wiki_resp.json()
                    if "thumbnail" in wiki_data:
                        info["image_url"] = wiki_data["thumbnail"].get("source")
                    if "extract" in wiki_data:
                        info["description"] = wiki_data.get("extract")
                        
            except Exception as e:
                logger.error(f"Wikipedia API error for {scientific_name}: {str(e)}")
                
        self.cache[scientific_name] = info
        return info

# Singleton instance
bird_info_service = BirdInfoService()
