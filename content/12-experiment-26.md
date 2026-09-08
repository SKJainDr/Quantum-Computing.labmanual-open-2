<h1 id="exp-26-quantum-phase-estimation-eigenvalue-extraction">Exp. 26: Quantum Phase Estimation — Eigenvalue Extraction</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>26</strong></p><p>3 hrs</p></td><td><p><strong>Quantum Phase Estimation — Eigenvalue Extraction</strong></p><p>Advanced Algorithms | Cluster V</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Implement QPE to estimate the eigenphase φ of a unitary U=Rz(π/4) with eigenvector |1⟩; use 4 ancilla qubits for 4-bit precision; compare measured phase with theoretical φ=1/8.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-10">1. Background Theory</h2><p>QPE: given unitary U with eigenstate |u⟩ and eigenphase e^{2πiφ}, estimate φ to n-bit precision. Circuit: (1) Prepare n ancilla in |+⟩^n, target in |u⟩, (2) Apply controlled-U^{2^k} for k=0,...,n-1 (phase kickback), (3) Apply QFT† to ancillae, (4) Measure → binary approximation of φ. For U=Rz(π/4): eigenvalue e^{iπ/4} for |1⟩ → phase φ=1/8. With n=4 ancilla: resolution=1/16. Expected peak at m=2 (=2/16=1/8). Precision: error &lt; 1/2^n = 0.0625.</p><h2 id="2-qiskit-code-10">2. Qiskit Code</h2><h3 id="first-program-simple-version-10">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 26 — First Program
# Quantum Phase Estimation — Eigenvalue Extraction
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit, transpile
from qiskit.circuit.library import QFT
from qiskit_aer import AerSimulator
import numpy as np

n_ancilla = 4
qc = QuantumCircuit(n_ancilla + 1, n_ancilla)
qc.x(n_ancilla)
qc.h(range(n_ancilla))

for k in range(n_ancilla):
    angle = (np.pi / 4) * (2 ** k)
    qc.cp(angle, k, n_ancilla)

qc.append(QFT(n_ancilla, inverse=True), range(n_ancilla))
qc.measure(range(n_ancilla), range(n_ancilla))

sim = AerSimulator()
counts = sim.run(transpile(qc, sim), shots=4096).result().get_counts()
top = max(counts, key=counts.get)
m = int(top, 2)
phi_est = m / (2 ** n_ancilla)

print(f'True eigenphase phi = 1/8 = {1/8:.4f}  (U = Rz(pi/4), eigenstate |1&gt;)')
print(f'Most frequent ancilla readout: {top} (decimal m={m})')
print(f'Estimated phase = m/2^n = {phi_est:.4f}')
print(f'Estimation error = {abs(phi_est - 1/8):.4f}  (theoretical bound: &lt; 1/2^n = {1/2**n_ancilla:.4f})')
print(f'Top 5 outcomes: {sorted(counts.items(), key=lambda x: -x[1])[:5]}')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  True eigenphase phi = 1/8 = 0.1250  (U = Rz(pi/4), eigenstate |1&gt;)
  Most frequent ancilla readout: 0010 (decimal m=2)
  Estimated phase = m/2^n = 0.1250
  Estimation error = 0.0000  (theoretical bound: &lt; 1/2^n = 0.0625)
  Top 5 outcomes: [('0010', 4096)]</code></pre><h3 id="full-program-complete-version-10">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 26: Quantum Phase Estimation — Eigenvalue Extraction
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit, transpile
from qiskit.circuit.library import QFT
from qiskit_aer import AerSimulator
import numpy as np, matplotlib.pyplot as plt

sim = AerSimulator()

def qpe_circuit(n_ancilla, true_phase_numerator, denom_bits):
    angle_unit = 2 * np.pi * true_phase_numerator / (2 ** denom_bits)
    qc = QuantumCircuit(n_ancilla + 1, n_ancilla)
    qc.x(n_ancilla)
    qc.h(range(n_ancilla))
    for k in range(n_ancilla):
        qc.cp(angle_unit * (2 ** k), k, n_ancilla)
    qc.append(QFT(n_ancilla, inverse=True), range(n_ancilla))
    qc.measure(range(n_ancilla), range(n_ancilla))
    return qc

print('--- Precision vs number of ancilla qubits (phase = 1/8, exactly representable) ---')
for n in [2, 3, 4, 5, 6]:
    qc = qpe_circuit(n, 1, 3)
    counts = sim.run(transpile(qc, sim), shots=4096).result().get_counts()
    top = max(counts, key=counts.get)
    phi_est = int(top, 2) / 2**n
    print(f'n_ancilla={n}: estimated phi={phi_est:.5f}  (true=0.12500)  '
          f'P(correct)={counts.get(top,0)/4096:.4f}')

print('\n--- Fixed n_ancilla=4, several eigenphases ---')
test_phases = [(1, 3), (1, 4), (3, 8), (1, 5)]
results = []
for num, denom in test_phases:
    true_phi = num / 2**denom
    qc = qpe_circuit(4, num, denom)
    counts = sim.run(transpile(qc, sim), shots=4096).result().get_counts()
    top = max(counts, key=counts.get)
    phi_est = int(top, 2) / 16
    err = abs(phi_est - true_phi)
    results.append((true_phi, phi_est, err, counts))
    print(f'true phi={true_phi:.4f}  estimated={phi_est:.4f}  error={err:.4f}  '
          f'(bound 1/16={1/16:.4f})')

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
ns = [2,3,4,5,6]
precisions = [1/2**n for n in ns]
axes[0].semilogy(ns, precisions, 'o-', color='#4C72B0')
axes[0].set_xlabel('number of ancilla qubits n'); axes[0].set_ylabel('worst-case error bound 1/2^n')
axes[0].set_title('QPE Precision vs Ancilla Count')

labels = [f'{n}/{2**d}' for n,d in test_phases]
true_vals = [r[0] for r in results]
est_vals = [r[1] for r in results]
x = np.arange(len(labels))
axes[1].bar(x-0.15, true_vals, width=0.3, label='true phi', color='#55A868')
axes[1].bar(x+0.15, est_vals, width=0.3, label='estimated phi', color='#C44E52')
axes[1].set_xticks(x); axes[1].set_xticklabels(labels)
axes[1].set_title('QPE: True vs Estimated Phase (n=4)'); axes[1].legend()

plt.tight_layout()
plt.savefig('lab26_qpe_full_analysis.png', dpi=150)
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 26 — Expected Output &amp; Console Results</p><pre>  Expected results for Experiment 26:
  QPE: given unitary U with eigenstate |u⟩ and eigenphase e^{2πiφ}, estimate φ to n-bit precision. Circuit: (1) Prepare n ancilla in |+⟩^n, target in |u...
  Actual console output for Experiment 26:
  --- Precision vs number of ancilla qubits (phase = 1/8, exactly representable) ---
  n_ancilla=2: estimated phi=0.00000  (true=0.12500)  P(correct)=0.4329
  n_ancilla=3: estimated phi=0.12500  (true=0.12500)  P(correct)=1.0000
  n_ancilla=4: estimated phi=0.12500  (true=0.12500)  P(correct)=1.0000
  n_ancilla=5: estimated phi=0.12500  (true=0.12500)  P(correct)=1.0000
  n_ancilla=6: estimated phi=0.12500  (true=0.12500)  P(correct)=1.0000
  --- Fixed n_ancilla=4, several eigenphases ---
  true phi=0.1250  estimated=0.1250  error=0.0000  (bound 1/16=0.0625)
  true phi=0.0625  estimated=0.0625  error=0.0000  (bound 1/16=0.0625)
  true phi=0.0117  estimated=0.0000  error=0.0117  (bound 1/16=0.0625)
  true phi=0.0312  estimated=0.0625  error=0.0312  (bound 1/16=0.0625)</pre><img class="fig-img" src="content/images/image17.png"/></div><h2 id="3-observation-and-results-10">3. Observation and Results</h2><h3 id="observation-tables-4">Observation Tables</h3><p><em>Record all experimental data for Experiment 26 in the tables below. Complete during the practical session using actual measurements from simulation and/or IBM Quantum hardware.</em></p><table>
<colgroup>
<col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Parameter / Quantity</strong></td><td><strong>Expected Value</strong></td><td><strong>Simulation Value</strong></td><td><strong>Hardware Value</strong></td><td><strong>Analysis / Notes</strong></td></tr>
<tr class="even"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td></td><td></td><td></td><td></td><td></td></tr>
</tbody>
</table><h2 id="4-discussion-questions-10">4. Discussion Questions</h2><ol type="1"><li><p>Why does increasing the number of ancilla qubits improve QPE's precision, and why does the error bound scale as 1/2^n rather than, say, 1/n?</p></li><li><p>For a phase that is NOT exactly representable in n bits (like 3/256 with n=4 ancillas), the estimation showed a nonzero error even though the algorithm worked correctly. Why is this an expected limitation rather than a bug?</p></li><li><p>How is the controlled-phase gate cp(angle, k, target) applied with angle scaled by 2^k tied to the binary representation of the eigenphase being estimated?</p></li><li><p>Write complete answers with supporting calculations, equations, and diagrams.</p></li><li><p>For IBM Hardware experiments: justify your choice of backend, qubit pair, and optimisation level.</p></li><li><p>Compare simulation vs hardware results and quantify all sources of error.</p></li></ol><h2 id="5-lab-record-requirements-10">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record key outputs and verify the basic concept.</p></li><li><p>Run the Full Program. Save all generated figures (label them lab26_*.png).</p></li><li><p>Complete all observation tables during the practical session.</p></li><li><p>Write complete, well-reasoned answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>Describe QPE and its quantum advantage.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>QPE estimates eigenphase φ of unitary U to n-bit precision using n ancilla qubits. Classical equivalent: compute U^{2^k}|u⟩ for each k — costs O(2^n) for n-bit precision (exponential). QPE achieves n-bit precision with O(n) ancilla and O(n·T_U) circuit depth — exponential quantum speedup over classical eigenphase estimation.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>What is phase kickback?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Phase kickback: controlled-U with control |+⟩=(|0⟩+|1⟩)/√2, target eigenstate |u⟩: ctrl-U|+⟩|u⟩ = (|0⟩+e^{2πiφ}|1⟩)/√2 ⊗ |u⟩. The eigenvalue phase kicks back to the control qubit. Repeating with U^{2^k}: control gets phase e^{2πi·2^kφ}. After n operations, counting register encodes all bits of φ. QFT† converts phase encoding to amplitude encoding.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>How does QPE precision scale with n?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>With n ancilla: resolution=1/2^n, precision error &lt; 1/2^n. For non-integer multiples of 1/2^n: P(correct) ≥ 4/π² ≈ 0.405 (at least 40%). To achieve ε precision: n = ⌈log₂(1/ε + 2log(1/(2δ)))⌉. Doubling n halves precision (in bits). IBM hardware with n=4: can distinguish phases differing by 1/16 = 0.0625.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>What is the quantum counting algorithm?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Quantum counting: QPE applied to Grover iterate G=D·O to count solutions M in N-item database. Eigenvalues of G: e^{±2iθ} where sin(θ)=√(M/N). QPE measures θ → M = N·sin²(θ). Speedup: O(√N/ε) queries for ε accuracy vs O(N) classical. Applications: Grover with unknown M, amplitude estimation, Monte Carlo acceleration.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What is the relationship between QPE and Shor algorithm?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Shor's uses QPE as a subroutine: estimate eigenphases of U|y⟩=|a·y mod N⟩. Eigenphases are s/r (s=0,...,r-1). QPE measures s/r → continued fractions extracts period r → factoring. Without QPE, Shor's would need exponential classical computation. QPE is the quantum part enabling polynomial-time period finding — the heart of the quantum speedup.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>Why is the inverse QFT, rather than the forward QFT, applied to the ancilla register at the end of the QPE circuit?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The controlled-U operations encode the eigenphase into the ancilla register as a Fourier-transformed (phase-kicked-back) state. Applying the inverse QFT undoes that Fourier encoding, converting the phase information back into a directly measurable computational-basis bit-string.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>Why does each ancilla qubit k control U raised to the power 2^k, rather than just U itself?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>This exponential scaling ensures each ancilla qubit picks up a phase proportional to a different binary digit of the eigenphase, exactly mirroring how binary digits represent a fraction; without the 2^k scaling, the ancilla register could not resolve more than one bit of precision.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>What happens to the QPE estimate if the true eigenphase requires MORE bits of precision than the number of ancilla qubits provided?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The measured outcome will be the closest n-bit binary approximation to the true phase, with an estimation error bounded by 1/2^n; the algorithm doesn't fail, but its output is simply rounded to the available precision.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>Why must the target qubit be prepared in an actual eigenstate of U for QPE to give a sharp, single-outcome result?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>If the target qubit is in a superposition of multiple eigenstates of U, the algorithm produces a superposition over their corresponding phases, and measurement will return one of several possible phases probabilistically rather than a single well-defined answer.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>How does the precision (number of ancilla qubits) needed for QPE relate to the resources required by algorithms like Shor's factoring algorithm that use QPE as a subroutine?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Shor's algorithm needs enough ancilla precision to resolve the periodicity being searched for, meaning the number of ancilla qubits must scale with the number of bits in the number being factored; this directly drives the qubit-count requirements for factoring large numbers.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>Why does adding just one extra ancilla qubit to a QPE circuit roughly double the precision of the phase estimate?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Each additional ancilla qubit contributes one more bit to the binary fraction representing the estimated phase, and each additional bit of binary precision halves the smallest representable increment -- directly doubling the resolution of the estimate.</td></tr>
</tbody>
</table>