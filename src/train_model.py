import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import pickle, os, json, datetime
import matplotlib.pyplot as plt
import seaborn as sns

VERSION   = "v1"
#DATA_PATH = "data/merged/gesture_data_v1.csv"
DATA_PATH = "data/merged/massive_gesture_dataset_v2.csv"
SAVE_DIR  = f"models/{VERSION}"
os.makedirs(SAVE_DIR, exist_ok=True)

df = pd.read_csv(DATA_PATH)
print(f"Dataset shape : {df.shape}")
print(f"Unique gestures: {df['label'].nunique()}")

X = df.drop("label", axis=1).values
y = df["label"].values

le = LabelEncoder()
y_encoded = le.fit_transform(y)
NUM_GESTURES = len(le.classes_)
print(f"\nClasses ({NUM_GESTURES}): {le.classes_}")

X_train, X_temp, y_train, y_temp = train_test_split(
    X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.50, random_state=42
)
print(f"\nTrain: {len(X_train)}  Val: {len(X_val)}  Test: {len(X_test)}")

noise = np.random.normal(0, 0.005, X_train.shape)
X_train_final = np.vstack([X_train, X_train + noise])
y_train_final = np.concatenate([y_train, y_train])
print(f"After augmentation: {len(X_train_final)} training samples")

model = tf.keras.Sequential([
    tf.keras.layers.Dense(256, activation="relu", input_shape=(63,)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation="relu"),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(NUM_GESTURES, activation="softmax"),
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)
model.summary()

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy", patience=10, restore_best_weights=True),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss", patience=5, factor=0.5),
    tf.keras.callbacks.ModelCheckpoint(
        f"{SAVE_DIR}/best_model.h5", save_best_only=True),
]

history = model.fit(
    X_train_final, y_train_final,
    epochs=100,
    batch_size=32,
    validation_data=(X_val, y_val),
    callbacks=callbacks,
    verbose=1
)

test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"\nTest Accuracy : {test_acc * 100:.2f}%")
print(f"Test Loss     : {test_loss:.4f}")

y_pred = model.predict(X_test).argmax(axis=1)
print("\n--- Classification Report ---")
print(classification_report(y_test, y_pred, target_names=le.classes_))

cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(16, 14))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=le.classes_, yticklabels=le.classes_)
plt.title(f"Confusion Matrix — Model {VERSION}")
plt.ylabel("True Label")
plt.xlabel("Predicted Label")
plt.tight_layout()
plt.savefig(f"{SAVE_DIR}/confusion_matrix.png", dpi=150)
print(f"Confusion matrix saved: {SAVE_DIR}/confusion_matrix.png")

model.save(f"{SAVE_DIR}/gesture_model.h5")

with open(f"{SAVE_DIR}/label_encoder.pkl", "wb") as f:
    pickle.dump(le, f)

config = {
    "version": VERSION,
    "date": str(datetime.date.today()),
    "total_samples": len(df),
    "num_gestures": NUM_GESTURES,
    "gestures": list(le.classes_),
    "test_accuracy": round(float(test_acc), 4),
    "architecture": "Dense(256) → BN → Drop(0.3) → Dense(128) → BN → Drop(0.3) → Dense(64) → Drop(0.2) → Softmax"
}
with open(f"{SAVE_DIR}/config.json", "w") as f:
    json.dump(config, f, indent=2)

print(f"\nAll saved in: {SAVE_DIR}/")
print("  gesture_model.h5")
print("  label_encoder.pkl")
print("  config.json")
print("  confusion_matrix.png")