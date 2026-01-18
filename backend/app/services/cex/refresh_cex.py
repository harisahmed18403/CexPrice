import requests
from app import app, db
from app.models import SuperCat, ProductLine, Category, Product, CexProduct
from urllib.parse import urlencode

class RefreshCex():
    apiUrl = f"https://wss2.cex.{app.config['CEX_COUNTRY_CODE']}.webuy.io/v3"
    websiteApiUrl = "https://search.webuy.io/1/indexes/*/queries"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
    }

    def fetchFromApi(self, endpoint, responseKey, params = None):
        response = requests.get(self.apiUrl + endpoint, timeout=30, headers=self.headers, params=params)
        response.raise_for_status()
        json = response.json()
        # print(json)
        if(json == None or json["response"] == None or json["response"]["data"] == None or json["response"]["data"][responseKey] == None):
            return []
        return json["response"]["data"][responseKey]

    def refreshSuperCats(self):
        with app.app_context():
            for row in self.fetchFromApi("/supercats", "superCats"):
                superCat = SuperCat.query.filter_by(id=row["superCatId"]).first()
                if not superCat:
                    superCat = SuperCat(id=row["superCatId"])
                    db.session.add(superCat)
                superCat.name = row["superCatFriendlyName"]
            db.session.commit()

    # Product Lines
    def refreshProductLines(self):
        with app.app_context():
            for row in self.fetchFromApi("/productlines", "productLines"):
                productLine = ProductLine.query.filter_by(id=row["productLineId"]).first()
                if not productLine:
                    productLine = ProductLine(id=row["productLineId"])
                    db.session.add(productLine)

                productLine.super_cat_id = row["superCatId"]
                productLine.name = row["productLineName"]
            db.session.commit()

    # Categories
    def refreshCategories(self):
        with app.app_context():
            # Fetch all IDs and flatten the list
            productLineIds = [row.id for row in ProductLine.query.with_entities(ProductLine.id).all()]

            for productLineId in productLineIds:
                params = {
                    "productLineIds": f"[{productLineId}]"
                }
                response = self.fetchFromApi("/categories", "categories", params)                  
                for row in response:
                    category = Category.query.filter_by(id=row["categoryId"]).first()
                    if not category:
                        category = Category(id=row["categoryId"])
                        db.session.add(category)

                    category.product_line_id = row["productLineId"]
                    category.name = row["categoryFriendlyName"]
                    db.session.commit()

    def refreshProducts(self):
        with app.app_context():
            headers = {
                "User-Agent": "Mozilla/5.0",
                "Content-Type": "application/json",
                "X-Algolia-API-Key": app.config['CEX_ALGOLIA_API_KEY'],
                "X-Algolia-Application-Id": app.config['CEX_ALGOLIA_APP_ID'],
            }

            categories = Category.query.with_entities(Category.id).filter_by(product_line_id=106).all()

            for category in categories:
                params_dict = {
                    "attributesToRetrieve": ["boxBuyAllowed","boxName","boxSaleAllowed","boxWebBuyAllowed","boxWebSaleAllowed","cannotBuy","cashPrice","categoryFriendlyName","categoryName","collectionQuantity","ecomQuantity","exchangePrice","imageUrls","isNewBox","masterBoxId","masterBoxName","outOfEcomStock","superCatFriendlyName","superCatName","boxId","outOfStock","sellPrice","exchangePerc","cashBuyPrice","scId","discontinued","new","cashPriceCalculated","exchangePriceCalculated","rating","ecomQuantityOnHand","priceLastChanged","isImageTypeInternal","imageNames","Grade"],
                    "clickAnalytics": "false",
                    "facets": '["*"]',
                    "filters": f"boxVisibilityOnWeb=1 AND boxSaleAllowed=1 AND categoryId:{category.id}",
                    "hitsPerPage": "100",
                    "maxValuesPerFacet": "1",
                    "page": "1",
                    "query": "",
                    "userToken": "abc123"
                }

                page = 1

                while True:
                    params_dict["page"] = str(page)
                    params_str = urlencode(params_dict)

                    payload = {
                        "requests": [
                            {
                                "indexName": "prod_cex_uk",
                                "params": params_str
                            }
                        ]
                    }

                    try:
                        response = requests.post(self.websiteApiUrl, json=payload, headers=headers, timeout=10)
                        response.raise_for_status()
                        data = response.json()

                    except requests.exceptions.HTTPError as http_err:
                        print(f"HTTP error occurred: {http_err}")
                    except requests.exceptions.ConnectionError:
                        print("Error: Could not connect to the server. Check your internet or the URL.")
                    except requests.exceptions.Timeout:
                        print("Error: The request timed out.")
                    except ValueError:
                        print("Error: The response was not valid JSON.")
                    except requests.exceptions.RequestException as err:
                        print(f"An unexpected error occurred: {err}")

                    if "results" not in data or not data["results"]:
                        break

                    results = data["results"][0]
                    for row in results["hits"]:
                        print(row["objectID"], row["_highlightResult"]["boxName"]["value"])
                        cexProduct = CexProduct.query.filter_by(cex_id=row["objectID"]).first()
                        
                        boxUrl = f"/boxes/{row["objectID"]}/detail"
                        boxDetails = self.fetchFromApi(boxUrl, 'boxDetails')
                        boxDetails = boxDetails[0]

                        if not cexProduct:
                            product = Product(
                                name=boxDetails["boxName"],
                                cash_price=boxDetails["cashPrice"],
                                category_id=boxDetails["categoryId"],
                                image_path=boxDetails["imageUrls"]["medium"]
                            )
                            db.session.add(product)
                            db.session.flush()

                            cexProduct = CexProduct(
                                cex_id=row["objectID"],
                                product_id=product.id
                            )
                            db.session.add(cexProduct)
                        else:
                            product = Product.query.get(cexProduct.product_id)
                            product.name = boxDetails["boxName"]
                            product.cash_price = boxDetails["cashPrice"]
                            product.category_id = boxDetails["categoryId"]
                            product.image_path=boxDetails["imageUrls"]["medium"]

                        db.session.commit()

                    if results["page"] >= results["nbPages"]:
                        break

                    page += 1


