# LandGuard AI Model Methodology

## Scope

The AI component predicts transaction risk indicators. It does not classify people as criminals, determine legal ownership, or replace an authorized officer.

## Data

The training data is synthetic and created for academic development and testing. It is not official Rwandan land data. The generator creates normal and higher-risk transaction patterns from transaction-level indicators such as seller ownership match, duplicate activity, recent ownership changes, record inconsistency, and transaction frequency.

Generate it with:

```powershell
.\.venv\Scripts\python.exe -m ml.scripts.generate_dataset --output ml/data/synthetic_land_transactions.csv --rows 1200
```

## Training and evaluation

Three classifiers are trained and compared:

- Logistic Regression with feature standardization
- Decision Tree
- Random Forest

The evaluation records accuracy, weighted precision, weighted recall, weighted F1, and a confusion matrix. Weighted F1 selects the serialized model because class imbalance makes accuracy alone insufficient.

```powershell
.\.venv\Scripts\python.exe -m ml.training.train --dataset ml/data/synthetic_land_transactions.csv --model-dir ml/models
```

The model is saved locally as `ml/models/risk_model.joblib`; binary artifacts are excluded from Git and should be regenerated after setup.

## Prediction

The backend derives features from transaction, parcel, and ownership history records, then returns:

- risk score from 0 to 100
- LOW, MEDIUM, or HIGH risk level
- model version
- explanations tied to observed indicators

The result is an advisory risk indicator. Any flagged transaction requires human review.
