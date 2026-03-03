import pandas as pd 
import numpy as np 

df = pd.read_csv('data/gesture_data.csv')

print("Shape:",df.shape)
print("Coloumns",df.columns.tolist()[:5])
print("First row label:",df['label'][0])
print(df.head())
X = df.drop('label',axis=1).values
Y = df['label'].values
print("X shape:", X.shape)
print("y shape:", Y.shape)
print("Unique gestures:", np.unique(Y))

from sklearn.model_selection import train_test_split

X_train, X_test, Y_train, Y_test = train_test_split(
    X,Y,
    test_size = 0.2,
    random_state = 42,
    stratify = Y)
print("X_train shape:", X_train.shape)
print("X_test shape:", X_test.shape)
print("y_train shape:", Y_train.shape)
print("y_test shape:", Y_test.shape)


