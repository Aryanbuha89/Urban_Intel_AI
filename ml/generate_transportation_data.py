import os
import random

import pandas as pd


def generate_synthetic_transportation_rows(n_rows: int) -> pd.DataFrame:
    rows = []
    for i in range(n_rows):
        total_buses = 300
        buses_operating = random.randint(120, 280)
        avg_vehicles = random.randint(3000, 9000)
        peak_multiplier = round(random.uniform(1.2, 2.2), 2)
        routes = ["west", "south", "east", "north", "central"]
        congested = {route: 1 if random.random() < 0.5 else 0 for route in routes}
        if sum(congested.values()) == 0:
            congested[random.choice(routes)] = 1
        rows.append(
            {
                "sample_id": i,
                "buses_operating": buses_operating,
                "total_buses": total_buses,
                "avg_vehicles_per_hour": avg_vehicles,
                "peak_hour_multiplier": peak_multiplier,
                "congested_west": congested["west"],
                "congested_south": congested["south"],
                "congested_east": congested["east"],
                "congested_north": congested["north"],
                "congested_central": congested["central"],
            }
        )
    return pd.DataFrame(rows)


def build_transportation_dataset(n_rows: int = 20000, output_path: str = "ml/data/transportation_data.csv") -> pd.DataFrame:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = generate_synthetic_transportation_rows(n_rows)
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    build_transportation_dataset()

