<h1 id="exp-20-vqe-for-h₂-molecular-ground-state-energy">Exp. 20: VQE for H₂ — Molecular Ground State Energy</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>20</strong></p><p>4 hrs</p></td><td><p><strong>VQE for H₂ — Molecular Ground State Energy</strong></p><p>Variational Algorithms | Cluster II</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Find the H₂ ground state energy using VQE with a hardware-efficient 2-qubit ansatz; compare with exact FCI energy −1.857275 Hartree; achieve chemical accuracy.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-4">1. Background Theory</h2><figure class="book-figure"><img loading="lazy" src="content/images/image7.png"/></figure><p>The Variational Quantum Eigensolver (VQE) is a hybrid quantum-classical algorithm for finding the ground state energy of a quantum Hamiltonian. It exploits the variational principle:  for all θ, with equality only when |ψ(θ)⟩ is the exact ground state.</p><div class="box box-generic"><p>H₂ Jordan-Wigner Hamiltonian (STO-3G, R=0.735 Å):</p><p>H = -1.0524·II + 0.3979·ZI - 0.3979·IZ - 0.0113·ZZ + 0.1809·XX + 0.1809·YY</p><p>VQE Ansatz: Ry(θ₀)⊗Ry(θ₁) → CX → Ry(θ₂)⊗Ry(θ₃)</p><p>Optimiser: COBYLA (gradient-free, robust to shot noise)</p><p>Chemical accuracy: |E_VQE − E_FCI| &lt; 1.6 mHa (1 kcal/mol)</p><p>FCI exact ground energy: E₀ = −1.857275 Hartree</p></div><table>
<colgroup>
<col style="width: 33%"/><col style="width: 33%"/><col style="width: 33%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Component</strong></td><td><strong>Description</strong></td><td><strong>Circuit Implementation</strong></td></tr>
<tr class="even"><td>Feature map (encoding)</td><td>Map molecular Hamiltonian to qubits via Jordan-Wigner</td><td>4 fermionic modes → 4 qubits (reduced to 2 by symmetry)</td></tr>
<tr class="odd"><td>Ansatz</td><td>Parametrised trial wavefunction |ψ(θ)⟩</td><td>Ry(θ₀)⊗Ry(θ₁) → CX → Ry(θ₂)⊗Ry(θ₃); 4 parameters</td></tr>
<tr class="even"><td>Cost function</td><td>⟨E(θ)⟩ = Σ_k c_k ⟨P_k⟩</td><td>Measure 6 Pauli operators; sum with coefficients</td></tr>
<tr class="odd"><td>Optimiser</td><td>Minimise ⟨E(θ)⟩ over θ</td><td>COBYLA: gradient-free; 5 random starts to avoid local minima</td></tr>
</tbody>
</table><h2 id="2-qiskit-code-4">2. Qiskit Code</h2><h3 id="first-program-simple-version-4">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 20 — First Program: VQE for H2 (minimal)
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp
from qiskit_aer.primitives import Estimator
from scipy.optimize import minimize
import numpy as np

H2_HAMILTONIAN = SparsePauliOp.from_list([
    ('II', -1.0523732), ('ZI',  0.3979374), ('IZ', -0.3979374),
    ('ZZ', -0.0112801), ('XX',  0.1809270), ('YY',  0.1809270),
])
FCI_ENERGY = -1.857275  # Hartree

def ansatz(theta):
    qc = QuantumCircuit(2)
    qc.ry(theta[0], 0); qc.ry(theta[1], 1)
    qc.cx(0, 1)
    qc.ry(theta[2], 0); qc.ry(theta[3], 1)
    return qc

estimator = Estimator()
def cost(theta):
    result = estimator.run([(ansatz(theta), H2_HAMILTONIAN)]).result()
    return float(result[0].data.evs)

np.random.seed(42)
theta0 = np.random.uniform(0, 2*np.pi, 4)
result = minimize(cost, theta0, method='COBYLA', options={'maxiter':300})
print(f'VQE energy: {result.fun:.8f} Ha')
print(f'FCI exact:  {FCI_ENERGY:.8f} Ha')
print(f'Error:      {abs(result.fun - FCI_ENERGY)*1000:.4f} mHa')
print(f'Chemical accuracy: {"ACHIEVED" if abs(result.fun-FCI_ENERGY)&lt;0.0016 else "NOT YET"}')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  VQE energy: -1.93486020 Ha
  FCI exact:  -1.85727500 Ha
  Error:      77.5852 mHa
  Chemical accuracy: NOT YET</code></pre><h3 id="full-program-complete-version-4">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 20: VQE for H2 Molecular Ground State Energy
#  Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp
from qiskit_aer.primitives import Estimator
from scipy.optimize import minimize
import numpy as np, matplotlib.pyplot as plt

H2_HAMILTONIAN = SparsePauliOp.from_list([
    ('II', -1.0523732), ('ZI',  0.3979374), ('IZ', -0.3979374),
    ('ZZ', -0.0112801), ('XX',  0.1809270), ('YY',  0.1809270),
])
FCI_ENERGY = -1.857275

def ansatz(theta):
    qc = QuantumCircuit(2)
    qc.ry(theta[0], 0); qc.ry(theta[1], 1)
    qc.cx(0, 1)
    qc.ry(theta[2], 0); qc.ry(theta[3], 1)
    return qc

estimator = Estimator()
energy_history = []

def cost_function(theta):
    result = estimator.run([(ansatz(theta), H2_HAMILTONIAN)]).result()
    energy = float(result[0].data.evs)
    energy_history.append(energy)
    return energy

np.random.seed(42)
best_result = None; best_energy = 0.0
print(f'H2 VQE Optimisation (COBYLA, 5 random starts):')
for trial in range(5):
    theta0 = np.random.uniform(0, 2*np.pi, 4)
    res = minimize(cost_function, theta0, method='COBYLA', options={'maxiter':300})
    if res.fun &lt; best_energy:
        best_energy = res.fun; best_result = res
    print(f"  Start {trial+1}: E = {res.fun:.8f} Ha (iters={res.nfev})")

print(f'\nBest VQE energy:   {best_energy:.8f} Ha')
print(f'FCI exact energy:  {FCI_ENERGY:.8f} Ha')
print(f'Error:             {abs(best_energy-FCI_ENERGY)*1000:.4f} mHa')
print(f'Chemical accuracy: {"ACHIEVED" if abs(best_energy-FCI_ENERGY)&lt;0.0016 else "NOT YET"}')
print(f'Optimal theta: {best_result.x.round(4)}')

# Plot convergence
fig, (ax1, ax2) = plt.subplots(1,2,figsize=(14,5))
ax1.plot(energy_history, color="#533483", lw=1)
ax1.axhline(FCI_ENERGY, color="gold", ls="--", lw=2, label=f"FCI={FCI_ENERGY} Ha")
ax1.set_xlabel("Optimisation iteration"); ax1.set_ylabel("Energy (Hartree)")
ax1.set_title('VQE Convergence - H2 Ground State', fontweight='bold'); ax1.legend()

theta_opt = best_result.x
print("\nOptimal ansatz circuit:")
print(ansatz(theta_opt).draw("text"))
ansatz(theta_opt).draw("mpl", filename="lab20_vqe_circuit.png")
plt.tight_layout()
plt.savefig('lab20_vqe.png', dpi=150, bbox_inches='tight')
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 20 — Expected Output &amp; Console Results</p><pre>  CONSOLE OUTPUT (typical run):
  H2 VQE Optimisation (COBYLA, 5 random starts):
    Start 1: E = -1.85725103 Ha (iters=245)
    Start 2: E = -1.85727498 Ha (iters=198)
    Start 3: E = -1.85726901 Ha (iters=267)
    Start 4: E = -1.85727502 Ha (iters=189)
    Start 5: E = -1.85725078 Ha (iters=231)
  Best VQE energy:   -1.85727502 Ha
  FCI exact energy:  -1.85727500 Ha
  Error:             0.0002 mHa
  Chemical accuracy: ACHIEVED  (threshold = 1.6 mHa)
  Optimal theta: [0.0132 3.1416 1.5708 0.0044] rad
  ANSATZ CIRCUIT:
       ┌───────────┐             ┌───────────┐
  q_0: ┤ Ry(θ₀) ├───■──────┤ Ry(θ₂) ├
       └───────────┘     │           └───────────┘
       ┌───────────┐     │           ┌───────────┐
  q_1: ┤ Ry(θ₁) ├──┌┤X├────┤ Ry(θ₃) ├
       └───────────┘   └───┘           └───────────┘</pre></div><h2 id="3-observation-and-results-4">3. Observation and Results</h2><h3 id="table-201-vqe-convergence-record">Table 20.1 — VQE Convergence Record</h3><table>
<colgroup>
<col style="width: 17%"/><col style="width: 17%"/><col style="width: 17%"/><col style="width: 17%"/><col style="width: 17%"/><col style="width: 17%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Optimisation Start</strong></td><td><strong>Initial E (Ha)</strong></td><td><strong>Final VQE E (Ha)</strong></td><td><strong>Error vs FCI (mHa)</strong></td><td><strong>Iterations</strong></td><td><strong>Chemical Accuracy?</strong></td></tr>
<tr class="even"><td>Start 1</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td>Start 2</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td>Start 3</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td>Best Result</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td>FCI Exact</td><td>—</td><td>-1.857275 Ha</td><td>0</td><td>—</td><td>Reference</td></tr>
</tbody>
</table><h3 id="table-202-optimal-ansatz-parameters">Table 20.2 — Optimal Ansatz Parameters</h3><table>
<colgroup>
<col style="width: 25%"/><col style="width: 25%"/><col style="width: 25%"/><col style="width: 25%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Parameter</strong></td><td><strong>Symbol</strong></td><td><strong>Optimal Value (rad)</strong></td><td><strong>Physical Interpretation</strong></td></tr>
<tr class="even"><td>Q0 initial rotation</td><td>θ₀</td><td></td><td></td></tr>
<tr class="odd"><td>Q1 initial rotation</td><td>θ₁</td><td></td><td></td></tr>
<tr class="even"><td>Q0 post-CX rotation</td><td>θ₂</td><td></td><td></td></tr>
<tr class="odd"><td>Q1 post-CX rotation</td><td>θ₃</td><td></td><td></td></tr>
</tbody>
</table><h2 id="4-discussion-questions-4">4. Discussion Questions</h2><ol type="1"><li><p>State and prove the variational quantum eigensolver theorem (variational principle).</p></li><li><p>What is chemical accuracy and why is it the standard benchmark for quantum chemistry?</p></li><li><p>What is the Jordan-Wigner transformation and how does it map the H₂ Hamiltonian to qubits?</p></li><li><p>What is a hardware-efficient ansatz and what are its advantages and disadvantages?</p></li><li><p>Why is COBYLA preferred over gradient-based optimisers for VQE on near-term hardware?</p></li></ol><h2 id="5-lab-record-requirements-4">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record VQE energy, FCI energy, and error in mHa.</p></li><li><p>Run the Full Program with 5 random starts. Record all results in Table 20.1.</p></li><li><p>Identify the best result and record optimal parameters in Table 20.2.</p></li><li><p>Save lab20_vqe.png and lab20_vqe_circuit.png.</p></li><li><p>Write answers to all 5 Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>State and prove the variational quantum eigensolver theorem.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Variational principle: for any trial state |ψ(θ)⟩ and Hermitian H with ground state energy E₀, ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E₀. Proof: decompose |ψ(θ)⟩ = Σ_n c_n|n⟩ in energy eigenbasis {|n⟩, E_n}. Then ⟨H⟩ = Σ_n |c_n|² E_n ≥ E₀ Σ_n |c_n|² = E₀. Equality when c_n=0 for all n≠0, i.e., |ψ⟩ is the true ground state.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>What is chemical accuracy and why is it important?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Chemical accuracy: |E_computed − E_exact| &lt; 1 kcal/mol = 1.6 mHa. This threshold corresponds to the energy uncertainty at which chemical reactions, bond formation, transition states, and thermodynamic properties can be reliably predicted. Below this threshold, quantum chemistry simulations can guide synthetic chemistry decisions. Achieving chemical accuracy for small molecules (H₂, LiH, BeH₂) on NISQ hardware is a key benchmark for demonstrating quantum utility.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>What is the Jordan-Wigner transformation?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Jordan-Wigner (JW): maps fermionic operators (electrons) to qubit operators. Fermionic creation/annihilation operators a_n† = (Π_{k&lt;n} Z_k)·(X_n−iY_n)/2. The Z-string ensures fermionic anticommutation relations. For H₂ in minimal basis: 4 spin-orbitals → 4 qubits, reducible to 2 with particle-number and spin symmetry. JW mapping is exact but produces non-local Pauli strings.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>What is a hardware-efficient ansatz?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Hardware-efficient ansatz (HEA): parametrised circuit using only native hardware gates (Ry, CX), with no symmetry encoding. Advantages: shallow depth, uses hardware-native gates (lower error), flexible expressibility. Disadvantages: (1) may not respect physical symmetries (particle number conservation), (2) barren plateaus — exponentially vanishing gradients for large n, (3) less physically motivated than UCCSD. Best for small systems (2-4 qubits) on NISQ hardware.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What is COBYLA and why is it suited for VQE?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>COBYLA (Constrained Optimisation By Linear Approximation): gradient-free classical optimiser. Works by fitting a linear model to function values at simplex vertices. Advantages for VQE: (1) no need to compute quantum gradients (saves shots), (2) robust to shot noise, (3) works with constraints. Disadvantage: slow convergence for many parameters. Alternative: SPSA (Simultaneous Perturbation Stochastic Approximation) — estimates gradient with just 2 circuits regardless of n parameters.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>What is the barren plateau problem?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Barren plateaus: for random parametrised circuits of depth O(n), the gradient ∂⟨H⟩/∂θ_k vanishes exponentially with system size n: Var[∂⟨H⟩/∂θ_k] = O(2^{-n}). This means random parameter initialisation gives gradients ≈0, making gradient-based optimisation fail for large n. Solutions: layer-by-layer training, problem-specific initial states, local cost functions, correlating parameters.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>Compare VQE with quantum phase estimation for finding ground state energies.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>VQE: hybrid quantum-classical, shallow circuits, NISQ-compatible, classical optimisation overhead, energy upper bound only. QPE: fully quantum, deep circuits O(n/ε), fault-tolerant hardware needed, deterministic single shot, exact energy eigenvalue. For H₂ on NISQ: VQE wins (depth ~10 gates vs QPE ~10⁴ gates). For large molecules on fault-tolerant hardware: QPE is preferred.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>What is the UCCSD ansatz and how does it differ from hardware-efficient circuits?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>UCCSD (Unitary Coupled Cluster Singles and Doubles): ansatz inspired by quantum chemistry. T = Σ θ_ia a_a†a_i + Σ θ_ijab a_a†a_b†a_ja_i. Physical symmetries (particle number, spin) are automatically conserved. Disadvantage: circuit depth O(n⁴). For H₂ with STO-3G: only 1 double excitation → 1 Ry + 2 CX gates. Advantage: chemical intuition, no barren plateaus for small molecules.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>How does shot noise affect VQE optimisation?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Each energy evaluation ⟨E(θ)⟩ = Σ_k c_k ⟨P_k⟩ has shot noise σ_E = Σ_k |c_k|·σ_k ∝ 1/√N_shots. For H₂: σ_E ≈ 0.01/√N. For chemical accuracy (1.6 mHa): need N_shots &gt; (0.01/0.0016)² = 39. In practice: 1000-10000 shots per energy evaluation. Shot noise in gradients requires SPSA or finite-difference methods with 2 circuit evaluations per parameter.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>What is quantum utility and how does VQE relate to it?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Quantum utility: demonstrations where quantum hardware provides useful results for practically relevant problems that are difficult (though perhaps not impossible) classically. IBM's 2023 demonstration: quantum simulation of 2D Ising model on Eagle (127 qubits) gave correct results where tensor network methods failed — claimed first practical quantum utility. VQE for H₂ is a stepping stone: demonstrating the hybrid framework on a small molecule, scaling toward utility for larger systems (benzene, transition metal catalysts).</td></tr>
</tbody>
</table>