import os
import random

import pandas as pd


def generate_synthetic_energy_rows(n_rows: int) -> pd.DataFrame:
    rows = []
    for i in range(n_rows):
        avg_usage_last_year = random.randint(700, 1100)
        current_usage_mw = random.randint(600, 1300)
        peak_demand_mw = random.randint(900, 1500)
        grid_stability = random.randint(75, 100)
        renewable_percentage = random.randint(10, 40)
        rows.append(
            {
                "sample_id": i,
                "current_usage_mw": current_usage_mw,
                "avg_usage_last_year": avg_usage_last_year,
                "peak_demand_mw": peak_demand_mw,
                "grid_stability": grid_stability,
                "renewable_percentage": renewable_percentage,
            }
        )
    return pd.DataFrame(rows)


def build_energy_dataset(n_rows: int = 200000, output_path: str = "ml/data/energy_data.csv") -> pd.DataFrame:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = generate_synthetic_energy_rows(n_rows)
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    build_energy_dataset()
