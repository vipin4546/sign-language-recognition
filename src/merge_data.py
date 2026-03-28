import pandas as pd
import glob
import os

all_files = glob.glob("data/raw/**/*.csv", recursive=True)
print(f"Found {len(all_files)} CSV files")

if len(all_files) == 0:
    print("ERROR: No CSV files found in data/raw/")
    exit()

dfs = []
for filepath in all_files:
    df = pd.read_csv(filepath)
    print(f"  Loaded {filepath}: {len(df)} rows")
    dfs.append(df)

merged = pd.concat(dfs, ignore_index=True)

print("\n--- Label Distribution ---")
print(merged["label"].value_counts().sort_index())
print(f"\nTotal rows : {len(merged)}")
print(f"Total columns : {len(merged.columns)}")

os.makedirs("data/merged", exist_ok=True)
merged.to_csv("data/merged/gesture_data_v1.csv", index=False)
print("\nSaved: data/merged/gesture_data_v1.csv")