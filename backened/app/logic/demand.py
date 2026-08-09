import pandas as pd
import os

def load_demand_data():
    """Load demand data from CSV file."""
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "demand_mock.csv")
    
    # If file doesn't exist, return empty DataFrame
    if not os.path.exists(csv_path):
        return pd.DataFrame(columns=["commodity", "variety", "location", "expected_demand_kg"])
    
    df = pd.read_csv(csv_path)
    return df

def get_expected_demand(commodity: str, variety: str, location: str) -> float:
    """
    Return expected demand (in kg) for a given commodity/variety/location.
    If not found, return a default fallback of 500 kg.
    """
    df = load_demand_data()
    
    if df.empty:
        return 500.0
    
    # Filter by commodity, variety, and location (case-insensitive)
    filtered = df[
        (df["commodity"].str.lower() == commodity.lower()) &
        (df["variety"].str.lower() == variety.lower()) &
        (df["location"].str.lower() == location.lower())
    ]
    
    if not filtered.empty:
        return float(filtered.iloc[0]["expected_demand_kg"])
    
    # Fallback: return 500 kg if no match
    return 500.0