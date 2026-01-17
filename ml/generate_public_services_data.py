import os
import random

import pandas as pd


def generate_synthetic_public_services_rows(n_rows: int) -> pd.DataFrame:
    rows = []
    for i in range(n_rows):
        roads_needing_repair = random.randint(5, 50)
        water_supply_level = random.uniform(20.0, 100.0)
        sewer_system_health = random.uniform(60.0, 100.0)
        emergency_response_time = random.uniform(5.0, 25.0)
        pending_maintenance_tasks = random.randint(10, 70)
        rows.append(
            {
                "sample_id": i,
                "roads_needing_repair": roads_needing_repair,
                "water_supply_level": round(water_supply_level, 2),
                "sewer_system_health": round(sewer_system_health, 2),
                "emergency_response_time": round(emergency_response_time, 2),
                "pending_maintenance_tasks": pending_maintenance_tasks,
            }
        )
    return pd.DataFrame(rows)


def build_public_services_dataset(n_rows: int = 20000, output_path: str = "ml/data/public_services_data.csv") -> pd.DataFrame:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = generate_synthetic_public_services_rows(n_rows)
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    build_public_services_dataset()

