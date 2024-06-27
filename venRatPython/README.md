Defi Venture Rating (using Jupyter Notebook)

This documentation covers the series of Jupyter Notebook scripts (risk_script_v1.ipynb, risk_script_v2.ipynb, risk_script_v3.ipynb) used for calculating and optimizing protocol allocations based on their risk assessments. These scripts utilize ratings derived from each protocol’s Time Value Locked (TVL) and their duration of existence, applying the Lindy Effect as a theoretical framework.

Overview

Each script version iterates on the process of evaluating protocol risks and optimizing allocation strategies. The scripts incorporate mathematical and statistical methods to minimize the variance of risk contributions across different protocols.

risk_script_v1.ipynb

•	Purpose: Establishes the foundational calculations for risk scores and optimizations.
•	Key Functions:
•	Risk Score Calculation: Converts direct risk metrics into inverted risk scores to prioritize lower-risk protocols.
•	Matrix Operations: Utilizes numpy for matrix operations to create a risk matrix and normalize it.
•	Optimization: Uses scipy’s minimize function to find optimal weights that balance the protocol risks effectively.


risk_script_v2.ipynb

Updates:

•	Dynamic Data Handling: Incorporates pandas for dynamic data management and datetime for handling dates.
•	Enhanced Risk Calculations: Introduces calculations based on real TVL data and protocol start dates to determine the days of existence, applying the Lindy Effect to risk evaluation.


risk_script_v3.ipynb

•	Further Improvements:
•	Comprehensive Data Integration: Extracts data from a CSV file, enhancing the scalability and maintenance of the script.
•	Refined Output: Includes detailed output formatting and the generation of a summary DataFrame to visualize allocation strategies effectively.


Calculation Details

Each script version uses the following steps to calculate and optimize allocations:

1.	Define Risk Scores: Based on protocol-specific data such as TVL and operational duration.
2.	Invert Risk Scores: Lower scores signify higher risks, thus inverting these emphasizes safer investments.
3.	Risk Matrix Creation and Normalization: Ensures that each protocol’s risk is proportionally represented.
4.	Optimization of Weights: Allocates investment amounts across protocols to minimize overall risk variance, using constraints that the sum of weights equals 1 and all weights are between 0 and 1.
5.	Summary of Allocations: Outputs the optimized weights and their corresponding dollar values to demonstrate the distribution of funds according to calculated risks.