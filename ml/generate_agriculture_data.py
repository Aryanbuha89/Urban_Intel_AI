import os
import random

import pandas as pd


def generate_synthetic_agriculture_rows(n_rows: int) -> pd.DataFrame:
    rows = []
    for i in range(n_rows):
        crop_yield_last_year = random.uniform(50.0, 110.0)
        current_stock_level = random.uniform(20.0, 100.0)
        supply_chain_efficiency = random.uniform(50.0, 100.0)
        import_dependency = random.uniform(5.0, 40.0)
        rows.append(
            {
                "sample_id": i,
                "crop_yield_last_year": round(crop_yield_last_year, 2),
                "current_stock_level": round(current_stock_level, 2),
                "supply_chain_efficiency": round(supply_chain_efficiency, 2),
                "import_dependency": round(import_dependency, 2),
            }
        )
    return pd.DataFrame(rows)


def build_agriculture_dataset(
    n_rows: int = 20000, output_path: str = "ml/data/agriculture_data.csv"
) -> pd.DataFrame:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = generate_synthetic_agriculture_rows(n_rows)
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    build_agriculture_dataset()

