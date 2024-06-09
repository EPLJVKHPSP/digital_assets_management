import numpy as np
from scipy.optimize import minimize
import pandas as pd

def load_data(filepath):
    """Load protocol data from CSV."""
    return pd.read_csv(filepath)

def calculate_inverted_risk_scores(ratings):
    """Calculate inverted risk scores from ratings."""
    return 1 / ratings

def create_risk_matrix(inverted_risk_scores):
    """Create diagonal risk matrix from inverted risk scores."""
    return np.diag(inverted_risk_scores)

def normalize_risk_matrix(Sigma):
    """Normalize the risk matrix."""
    return Sigma / np.linalg.norm(Sigma)

def define_constraints(n):
    """Define optimization constraints and bounds."""
    constraints = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1})
    bounds = [(0, 1) for _ in range(n)]
    return constraints, bounds

def optimize_weights(Sigma_norm, initial_weights, constraints, bounds):
    """Optimize weights to minimize variance of risk contributions."""
    return minimize(variance_risk_contributions, initial_weights, args=(Sigma_norm,),
                    method='SLSQP', bounds=bounds, constraints=constraints)

def variance_risk_contributions(weights, Sigma):
    """Calculate the variance of risk contributions."""
    contributions = risk_contributions(weights, Sigma)
    return np.var(contributions)

def risk_contributions(weights, Sigma):
    """Calculate risk contributions for given weights."""
    total_risk = np.dot(weights, np.dot(Sigma, weights))
    marginal_contributions = np.dot(Sigma, weights)
    return weights * marginal_contributions / total_risk

def save_allocation_summary_to_csv(protocols, weights, total_allocation, output_filepath):
    """Save the allocation summary to a CSV file formatted to two decimal places."""
    dollar_allocation = weights * total_allocation
    summary = pd.DataFrame({
        'Protocol': protocols,
        'Allocation ($)': dollar_allocation,
        'Weight (%)': weights * 100
    })

    # Format DataFrame columns to two decimal places
    summary['Allocation ($)'] = summary['Allocation ($)'].apply(lambda x: f"{x:.2f}")
    summary['Weight (%)'] = summary['Weight (%)'].apply(lambda x: f"{x:.2f}")

    # Save to CSV
    summary.to_csv(output_filepath, index=False)
    print(f"Allocation summary saved to {output_filepath}")

def main():
    """Main function to load data, perform calculations, and save summary to CSV."""
    filepath = './data/pools.csv'  # Path to the CSV file
    output_filepath = 'allocation_summary.csv'  # Output CSV file path
    total_allocation = 10000   # Total amount to allocate in dollars

    protocols_df = load_data(filepath)
    ratings = protocols_df['StrategyRating'].values
    protocols = protocols_df['Protocol'].tolist()

    inverted_risk_scores = calculate_inverted_risk_scores(ratings)
    Sigma = create_risk_matrix(inverted_risk_scores)
    Sigma_norm = normalize_risk_matrix(Sigma)

    n = len(protocols)
    initial_weights = np.ones(n) / n
    constraints, bounds = define_constraints(n)

    result = optimize_weights(Sigma_norm, initial_weights, constraints, bounds)
    optimal_weights = result.x

    save_allocation_summary_to_csv(protocols, optimal_weights, total_allocation, output_filepath)

if __name__ == '__main__':
    main()