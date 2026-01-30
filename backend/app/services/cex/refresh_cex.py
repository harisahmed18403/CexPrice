import requests
import traceback
import threading
from app import app, db
from app.models import SuperCat, ProductLine, Category, Product, CexProduct, ProductVariant
from urllib.parse import urlencode
from concurrent.futures import ThreadPoolExecutor, as_completed

from app.status_store import refresh_status

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
        try:
            response = requests.get(self.apiUrl + endpoint, timeout=30, headers=self.headers, params=params)
            response.raise_for_status()
            json = response.json()
            if(json == None or json["response"] == None or json["response"]["data"] == None or json["response"]["data"][responseKey] == None):
                return []
            return json["response"]["data"][responseKey]
        except Exception as e:
            # We raise this so the caller knows the fetch failed, but we log context there
            raise e

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

                    pl = ProductLine.query.get(productLineId)
                    if pl and pl not in category.product_lines:
                        category.product_lines.append(pl)
                        
                    category.name = row["categoryFriendlyName"]
                    db.session.commit()

    def refreshCategory(self, category_id, headers):
        """Processes a single category. Runs in a background thread."""
        global refresh_status
        
        with app.app_context():
            # Use a fresh session for this thread to avoid sharing state
            session = db.session
            
            try:
                msg_cat = f"Starting Category ID: {category_id}"
                print(msg_cat)
                refresh_status["logs"].append(msg_cat)
                
                params_dict = {
                    "attributesToRetrieve": ["boxBuyAllowed","boxName","boxSaleAllowed","boxWebBuyAllowed","boxWebSaleAllowed","cannotBuy","cashPrice","categoryFriendlyName","categoryName","collectionQuantity","ecomQuantity","exchangePrice","imageUrls","isNewBox","masterBoxId","masterBoxName","outOfEcomStock","superCatFriendlyName","superCatName","boxId","outOfStock","sellPrice","exchangePerc","cashBuyPrice","scId","discontinued","new","cashPriceCalculated","exchangePriceCalculated","rating","ecomQuantityOnHand","priceLastChanged","isImageTypeInternal","imageNames","Grade"],
                    "clickAnalytics": "false",
                    "facets": '["*"]',
                    "filters": f"boxVisibilityOnWeb=1 AND boxSaleAllowed=1 AND categoryId:{category_id}",
                    "hitsPerPage": "100",
                    "maxValuesPerFacet": "1",
                    "page": "1",
                    "query": "",
                    "userToken": "abc123"
                }

                page = 1
                while True:
                    if not refresh_status["is_running"]: break
                    
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
                    except Exception as e:
                        print(f"Error fetching page {page} for cat {category_id}: {str(e)}")
                        break

                    if "results" not in data or not data["results"]:
                        break

                    results = data["results"][0]
                    if not results.get("hits"):
                        break

                    for row in results["hits"]:
                        if not refresh_status["is_running"]: break
                        
                        try:
                            item_name = row["_highlightResult"]["boxName"]["value"]
                            refresh_status["current_item"] = item_name

                            # Grade extraction
                            grade = None
                            if row.get("Grade") and len(row["Grade"]) > 0:
                                grade = row["Grade"][0]
                            
                            if not grade:
                                name_upper = item_name.upper()
                                for g in ["A", "B", "C"]:
                                    if any(name_upper.endswith(p + g) for p in [" ", "/", ", ", "-"]):
                                        grade = g
                                        break

                            clean_name = item_name
                            if grade:
                                for pattern in [f" {grade}", f", {grade}", f"/{grade}", f"- {grade}"]:
                                    if clean_name.endswith(pattern):
                                        clean_name = clean_name[:-len(pattern)].strip()
                                        break
                            
                            master_product = Product.query.filter_by(name=clean_name).first()
                            if not master_product:
                                master_product = Product(
                                    name=clean_name,
                                    category_id=category_id,
                                    image_path=row.get("imageUrls", {}).get("medium") if row.get("imageUrls") else None
                                )
                                session.add(master_product)
                                session.flush()

                            cexProduct = CexProduct.query.filter_by(cex_id=row["objectID"]).first()
                            
                            boxUrl = f"/boxes/{row['objectID']}/detail"
                            boxDetails = self.fetchFromApi(boxUrl, 'boxDetails')
                            if not boxDetails: continue
                            boxDetails = boxDetails[0]

                            if not cexProduct:
                                # Create a new variant
                                variant = ProductVariant(
                                    name=boxDetails["boxName"],
                                    product_id=master_product.id
                                )
                                session.add(variant)
                                session.flush()

                                cexProduct = CexProduct(cex_id=row["objectID"], variant_id=variant.id)
                                session.add(cexProduct)
                            else:
                                variant = cexProduct.variant

                            # Update variant fields
                            variant.cash_price = boxDetails["cashPrice"]
                            variant.voucher_price = boxDetails.get("exchangePrice")
                            variant.sale_price = boxDetails.get("sellPrice")
                            variant.image_path = boxDetails.get("imageUrls", {}).get("medium") if boxDetails.get("imageUrls") else None
                            variant.grade = grade
                            # Ensure variant is linked to correct master product if it changed
                            variant.product_id = master_product.id

                            session.commit()
                            refresh_status["logs"].append(f"Processed: {item_name}")
                        except Exception as item_err:
                            session.rollback()
                            refresh_status["logs"].append(f"Error item {row.get('objectID')}: {str(item_err)}")
                            continue 

                    if results["page"] >= results["nbPages"]:
                        break
                    page += 1
            except Exception as e:
                refresh_status["logs"].append(f"Error in category {category_id}: {str(e)}")

    def refreshProducts(self, category_ids=None, product_line_ids=None):
        global refresh_status
        refresh_status["is_running"] = True
        refresh_status["logs"] = []
        
        try:
            with app.app_context():
                headers = {
                    "User-Agent": "Mozilla/5.0",
                    "Content-Type": "application/json",
                    "X-Algolia-API-Key": app.config['CEX_ALGOLIA_API_KEY'],
                    "X-Algolia-Application-Id": app.config['CEX_ALGOLIA_APP_ID'],
                }

                all_category_ids = set()
                if category_ids:
                    all_category_ids.update(category_ids)
                
                if product_line_ids:
                    for pl_id in product_line_ids:
                        pl = ProductLine.query.get(pl_id)
                        if pl:
                            all_category_ids.update([c.id for c in pl.categories])
                
                # If nothing selected, default to Phones (106)
                if not all_category_ids:
                    pl_106 = ProductLine.query.get(106)
                    if pl_106:
                        all_category_ids.update([c.id for c in pl_106.categories])

                refresh_status["logs"].append(f"Targeting {len(all_category_ids)} categories for sync.")
                
                # Use ThreadPoolExecutor for concurrent sync
                # 5 threads as a safe starting point to avoid heavy rate limiting
                with ThreadPoolExecutor(max_workers=5) as executor:
                    futures = [executor.submit(self.refreshCategory, cid, headers) for cid in all_category_ids]
                    
                    for future in as_completed(futures):
                        # This just ensures we re-raise any fatal exceptions from the thread if needed
                        try:
                            future.result()
                        except Exception as thread_exc:
                            refresh_status["logs"].append(f"Thread failed: {str(thread_exc)}")

        except Exception as e:
            err_msg = f"Fatal Refresh Error: {str(e)}\n{traceback.format_exc()}"
            print(err_msg)
            refresh_status["logs"].append(err_msg)
        finally:
            refresh_status["is_running"] = False
            refresh_status["current_item"] = "Done"
