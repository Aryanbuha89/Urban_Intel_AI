import os
import random

import pandas as pd


def generate_synthetic_public_services_rows(n_rows: int) -> pd.DataFrame:
    rows = []
    for i in range(n_rows):
        roads_needing_repair = random.randint(5, 50)
        water_supply_level = random.randint(20, 100)
        sewer_system_health = random.randint(60, 100)
        emergency_response_time = random.randint(5, 25)
        pending_maintenance_tasks = random.randint(10, 70)
        rows.append(
            {
                "sample_id": i,
                "roads_needing_repair": roads_needing_repair,
                "water_supply_level": water_supply_level,
                "sewer_system_health": sewer_system_health,
                "emergency_response_time": emergency_response_time,
                "pending_maintenance_tasks": pending_maintenance_tasks,
            }
        )
    return pd.DataFrame(rows)


def build_public_services_dataset(n_rows: int = 200000, output_path: str = "ml/data/public_services_data.csv") -> pd.DataFrame:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = generate_synthetic_public_services_rows(n_rows)
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    build_public_services_dataset()
