import cv2
import easyocr
import numpy as np
import matplotlib.pyplot as plt
from ultralytics import YOLO
from PIL import Image
import tldextract
from googlesearch import search
import time
import os
import csv
import os
from datetime import datetime

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

model = YOLO("best_model_2.pt")

CSV_FILE = "results.csv"

def extract_text_from_image(image_path):
    print("extract")
    image = cv2.imread(image_path)
    extract_list=[]
    if image is None:
        print("Error: Image not found!")
    else:
        results = model(image)

        reader = easyocr.Reader(['en'])

        if results and len(results[0].boxes) > 0:
            for result in results:
                for box in result.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cropped_logo = image[y1:y2, x1:x2]

                    gray_logo = cv2.cvtColor(cropped_logo, cv2.COLOR_BGR2GRAY)

                    text_results = reader.readtext(gray_logo)
                    extracted_text = " ".join([res[1] for res in text_results]) if text_results else "N/A"

                    extract_list.append(extracted_text)

                    cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(image, extracted_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)


            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            return extract_list
        else:
            print("No detections found.")
            return extract_list

def search_domains(query, num_results=5):

    domains = set() 
    
    for url in search(query): 
        # domain = tldextract.extract(url).domain
        domains.add(url)
    
    print(f"{bcolors.OKCYAN}{domains}{bcolors.ENDC}")
    return list(domains)
def verify_brand_websites(brand_names, original_url):
    if not brand_names:
        return False

    original_domain = tldextract.extract(original_url).domain

    for brand in brand_names:
        try:
            query = f"official website of {brand}"
            official_urls = search_domains(query)

            for official_url in official_urls:
                official_domain = tldextract.extract(official_url).domain
                if original_domain == official_domain:
                    print(f"{brand}: Website is Genuine ✅")
                    return True

        except Exception as e:
            print(f"Error verifying {brand}: {e}")

    print("⚠️ Possible Phishing Website!")
    return False
def detect_phishing_from_screenshot(url, screenshot_path):
    start_time = time.time()
    print(f"Processing {url} from {screenshot_path}...\n")

    extracted_texts = extract_text_from_image(screenshot_path)
    extracted_texts = list(set(text for text in extracted_texts if text != 'N/A'))
    # print("Got it")
    print(f"{bcolors.OKBLUE}Possible brand list:{bcolors.ENDC}")
    for x in extracted_texts:
        print(f"{bcolors.OKBLUE}{x}{bcolors.ENDC}")
    
    is_genuine = False
    if extracted_texts:
        is_genuine = verify_brand_websites(extracted_texts, url)

    end_time = time.time()
    original_domain = tldextract.extract(url).domain
    verification_result = "Safe" if is_genuine else "Phish"
    print('falak')
    store_result_in_csv(url, original_domain, extracted_texts, verification_result, (end_time - start_time))

    return {
        "url": url,
        "extracted_brands": extracted_texts,
        "verification_result": is_genuine,
        "processing_time": f"{end_time - start_time:.2f} seconds"
    }




def store_result_in_csv(url,original_domain, extracted_brands, verification_result, processing_time):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Ensure CSV file has headers if it doesn't exist
    file_exists = os.path.isfile(CSV_FILE)
    with open(CSV_FILE, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(["URL", "Original Domain","extracted_brands", "verification_result", "processing_time"])

        writer.writerow([
            url,
            original_domain,
            "; ".join(extracted_brands) if extracted_brands else "N/A",
            verification_result,
            processing_time
        ])
        
        print("Saved To CSV")