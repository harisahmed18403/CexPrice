import requests
from urllib.parse import urlencode

params_dict = {
    "attributesToRetrieve": ["boxBuyAllowed","boxName","boxSaleAllowed","boxWebBuyAllowed","boxWebSaleAllowed","cannotBuy","cashPrice","categoryFriendlyName","categoryName","collectionQuantity","ecomQuantity","exchangePrice","imageUrls","isNewBox","masterBoxId","masterBoxName","outOfEcomStock","superCatFriendlyName","superCatName","boxId","outOfStock","sellPrice","exchangePerc","cashBuyPrice","scId","discontinued","new","cashPriceCalculated","exchangePriceCalculated","rating","ecomQuantityOnHand","priceLastChanged","isImageTypeInternal","imageNames","Grade"],
    "clickAnalytics": "true",
    "facets": '["*"]',
    "filters": "boxVisibilityOnWeb=1 AND boxSaleAllowed=1 AND categoryId:1225",
    "hitsPerPage": "100",
    "maxValuesPerFacet": "1",
    "page": "1",
    "query": "",
    "userToken": "abc123"
}

# Convert to URL-encoded string
params_str = urlencode(params_dict)


url = "https://search.webuy.io/1/indexes/*/queries"
headers = {
    "Content-Type": "application/json",
    "X-Algolia-API-Key": "bf79f2b6699e60a18ae330a1248b452c",
    "X-Algolia-Application-Id": "LNNFEEWZVA",
    "User-Agent": "Mozilla/5.0"
}

payload = {
    "requests": [
        {
            "indexName":"prod_cex_uk",
"params":params_str
        }
    ]
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print(data)

for result in data["results"]:
    for hit in result["hits"]:
        print(hit["objectID"], hit["_highlightResult"]["boxName"]["value"])
