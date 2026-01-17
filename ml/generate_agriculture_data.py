import os
import random

import pandas as pd


def generate_synthetic_agriculture_rows(n_rows: int) -> pd.DataFrame:
    rows = []
    for i in range(n_rows):
        crop_yield_last_year = random.randint(50, 110)
        current_stock_level = random.randint(20, 100)
        supply_chain_efficiency = random.randint(50, 100)
        import_dependency = random.randint(5, 40)
        rows.append(
            {
                "sample_id": i,
                "crop_yield_last_year": crop_yield_last_year,
                "current_stock_level": current_stock_level,
                "supply_chain_efficiency": supply_chain_efficiency,
                "import_dependency": import_dependency,
            }
        )
    return pd.DataFrame(rows)


def build_agriculture_dataset(
    n_rows: int = 200000, output_path: str = "ml/data/agriculture_data.csv"
) -> pd.DataFrame:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = generate_synthetic_agriculture_rows(n_rows)
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    build_agriculture_dataset()
