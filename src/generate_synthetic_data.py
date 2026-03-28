import pandas as pd
import numpy as np
import os


input_file = "data/merged/gesture_data_v1.csv" 
df = pd.read_csv(input_file)

def generate_augmented_data(original_df, num_subjects=9, samples_per_gesture=200):
    new_data = []
    gestures = original_df['label'].unique()
    
    for subject in range(num_subjects):
       
        hand_scale = np.random.uniform(0.9, 1.1) 
        
        for gesture in gestures:
            gesture_subset = original_df[original_df['label'] == gesture]
            
            for i in range(samples_per_gesture):
               
                base_row = gesture_subset.sample(n=1).iloc[0].values
                label = base_row[0]
                coords = base_row[1:].astype(float)
                
           
                coords = coords * hand_scale
                
   
                noise_tilt = np.random.normal(0, 0.005, coords.shape)
                coords += noise_tilt
                
        
                shift = np.random.uniform(-0.02, 0.02)
                coords += shift
                
                new_data.append([label] + coords.tolist())
    
  
    columns = original_df.columns
    augmented_df = pd.DataFrame(new_data, columns=columns)
    return augmented_df

print("Generating high-quality synthetic variety data...")
final_dataset = generate_augmented_data(df)

output_path = "data/merged/massive_gesture_dataset_v2.csv"
os.makedirs("data/merged", exist_ok=True)
final_dataset.to_csv(output_path, index=False)

print(f"Success! Total rows created: {len(final_dataset)}")
print(f"Saved to: {output_path}")