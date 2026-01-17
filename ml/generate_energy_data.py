import os
import random

import pandas as pd


def generate_synthetic_energy_rows(n_rows: int) -> pd.DataFrame:
    rows = []
    for i in range(n_rows):
        avg_usage_last_year = random.uniform(700.0, 1100.0)
        current_usage_mw = random.uniform(600.0, 1300.0)
        peak_demand_mw = random.uniform(900.0, 1500.0)
        grid_stability = random.uniform(75.0, 100.0)
        renewable_percentage = random.uniform(10.0, 40.0)
        rows.append(
            {
                "sample_id": i,
                "current_usage_mw": round(current_usage_mw, 2),
                "avg_usage_last_year": round(avg_usage_last_year, 2),
                "peak_demand_mw": round(peak_demand_mw, 2),
                "grid_stability": round(grid_stability, 2),
                "renewable_percentage": round(renewable_percentage, 2),
            }
        )
    return pd.DataFrame(rows)


def build_energy_dataset(n_rows: int = 20000, output_path: str = "ml/data/energy_data.csv") -> pd.DataFrame:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = generate_synthetic_energy_rows(n_rows)
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    build_energy_dataset()

