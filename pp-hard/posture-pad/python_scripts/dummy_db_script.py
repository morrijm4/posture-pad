import csv
import sys

# ============ IMPORTANT ============ ============ IMPORTANT ============ ============ IMPORTANT ============
# This would just be from the labels BUT ORDER MATTERS BECAUSE good MUST ASSOCIATE WITH INDEX 0, SLOUCH WITH 1, etc
# ============ IMPORTANT ============ ============ IMPORTANT ============ ============ IMPORTANT ============
CSV_FILES = ["good.csv", "slouch.csv", "left.csv", "right.csv", "mega.csv", "no.csv"]
ROOT_PATH = "posture_data"
writer = csv.writer(sys.stdout)

for label_index, filepath in enumerate(CSV_FILES):
    with open(f"{ROOT_PATH}/{filepath}", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if row:  # skip blank lines
                writer.writerow(row + [label_index])