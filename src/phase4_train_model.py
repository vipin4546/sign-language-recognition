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
import tensorflow as tf
from tensorflow import keras
model = keras.Sequential([
    keras.layers.Dense(128,activation='relu',input_shape=(63,)),
    keras.layers.Dense(64,activation='relu'),
    keras.layers.Dense(5,activation='softmax')

])
model.summary()
from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()
Y_train_encoded = le.fit_transform(Y_train)
Y_test_encoded = le.transform(Y_test)

print("Labels:",le.classes_)
print("Encoded:", Y_train_encoded[:5])

model.compile(
    optimizer = 'adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
print("Model compiled!")
history = model.fit(
    X_train, Y_train_encoded,
    epochs = 50,
    batch_size = 32,
    validation_split = 0.2,
    verbose = 1
)

test_loss, test_accuracy = model.evaluate(X_test, Y_test_encoded, verbose=0)
print(f"Test Accuracy: {test_accuracy * 100:.2f}%")
print(f"Test Loss: {test_loss:.4f}")

import pickle 
model.save('models/gesture_model.h5')

with open('models/label_encoder.pkl','wb') as f:
    pickle.dump(le,f)
print("Model saved!")
print("LabelEncoder saved!")

