import pandas as pd
from selenium import webdriver
from selenium.webdriver.edge.options import Options
import time

# Load URLs
# with open("websites.txt") as f:
#     websites = [line.strip() for line in f.readlines()]

# Edge options
# websites = ["https://www.youtube.com","https://www.facebook.com" ]
df = pd.read_csv("Websites.csv")
websites = df['urls'].dropna().str.strip().tolist()
print(websites[:5])
options = Options()
options.use_chromium = True
options.add_argument("--load-extension=F:/projects/btp_final/extension")  # Absolute path to extension

# Create driver
driver = webdriver.Edge(options=options)

# Visit each website
for index, site in enumerate(websites[456:10000]):
    try:
        print(f"[{index+1}] Visiting: {site}")
        driver.get(site)

        # Allow time for extension to take screenshot and upload
        time.sleep(20)

    except Exception as e:
        print(f"Error with {site}: {e}")

driver.quit()
