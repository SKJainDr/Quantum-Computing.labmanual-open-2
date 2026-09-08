<h1 id="exp-23-steane-713-error-correcting-code">Exp. 23: Steane [[7,1,3]] Error Correcting Code</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>23</strong></p><p>4 hrs</p></td><td><p><strong>Steane [[7,1,3]] Error Correcting Code</strong></p><p>QEC Advanced | Cluster III</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Implement 7-qubit Steane code encoding; perform all 6 stabiliser syndrome measurements; correct any single X or Z error; verify fidelity = 1 after correction for all 14 single-qubit errors.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-7">1. Background Theory</h2><p>Steane [[7,1,3]] code: 7 physical qubits encode 1 logical qubit, distance 3, corrects any single-qubit error. X-type stabilisers (detect Z errors): g_x1=IIIXXXX, g_x2=IXXIIXX, g_x3=XIXIXIX. Z-type stabilisers (detect X errors): g_z1=IIIZZZZ, g_z2=IZZIIZZ, g_z3=ZIZIZIZ. The syndrome is a 6-bit string mapping to a 64-entry lookup table identifying error qubit and type. The Steane code is a CSS code built from the classical Hamming [7,4,3] code. Logical operators: X_L=X⁷ (X on all 7 qubits), Z_L=Z⁷.</p><h2 id="2-qiskit-code-7">2. Qiskit Code</h2><h3 id="first-program-simple-version-7">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 23 — First Program
# Steane [[7,1,3]] Error Correcting Code
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp
import numpy as np, itertools

G = np.array([[1,0,0,0,0,1,1],[0,1,0,0,1,0,1],[0,0,1,0,1,1,0],[0,0,0,1,1,1,1]])
P = G[:, 4:7]
H = np.hstack([P.T, np.eye(3, dtype=int)]) % 2

codewords = [tuple((m @ G) % 2) for m in itertools.product([0, 1], repeat=4)]
even_weight = [c for c in codewords if sum(c) % 2 == 0]

def logical_zero():
    amps = np.zeros(2**7, dtype=complex)
    for c in even_weight:
        idx = int(''.join(map(str, reversed(c))), 2)
        amps[idx] = 1
    return amps / np.linalg.norm(amps)

def pauli_on(qubits, n=7, p='Z'):
    chars = ['I'] * n
    for q in qubits:
        chars[q] = p
    return ''.join(reversed(chars))

zero_L = logical_zero()
checks = [[j for j in range(7) if H[r, j] == 1] for r in range(3)]

error_qubit = 3
qc = QuantumCircuit(7)
qc.initialize(zero_L, range(7))
qc.barrier()
qc.x(error_qubit)
sv = Statevector(qc)

print(f'Injected X error on physical qubit {error_qubit}\n')
syndrome = []
for i, qs in enumerate(checks):
    val = np.real(sv.expectation_value(SparsePauliOp(pauli_on(qs))))
    bit = 0 if val &gt; 0.5 else 1
    syndrome.append(bit)
    print(f'Stabiliser S{i+1} on qubits {qs}: &lt;Z...Z&gt; = {val:+.4f}  -&gt;  syndrome bit = {bit}')

syn_int = syndrome[0]*4 + syndrome[1]*2 + syndrome[2]
decoded_qubit = [j for j in range(7) if list(H[:, j]) == syndrome][0]
print(f'\nSyndrome = {syndrome}  (binary {syn_int})')
print(f'Decoded error location: qubit {decoded_qubit}  (actual error was on qubit {error_qubit})')
print(f'Correct decode: {decoded_qubit == error_qubit}')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  Injected X error on physical qubit 3

  Stabiliser S1 on qubits [1, 2, 3, 4]: &lt;Z...Z&gt; = -1.0000  -&gt;  syndrome bit = 1
  Stabiliser S2 on qubits [0, 2, 3, 5]: &lt;Z...Z&gt; = -1.0000  -&gt;  syndrome bit = 1
  Stabiliser S3 on qubits [0, 1, 3, 6]: &lt;Z...Z&gt; = -1.0000  -&gt;  syndrome bit = 1

  Syndrome = [1, 1, 1]  (binary 7)
  Decoded error location: qubit 3  (actual error was on qubit 3)
  Correct decode: True</code></pre><h3 id="full-program-complete-version-7">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 23: Steane [[7,1,3]] Error Correcting Code
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp
import numpy as np, itertools, matplotlib.pyplot as plt

G = np.array([[1,0,0,0,0,1,1],[0,1,0,0,1,0,1],[0,0,1,0,1,1,0],[0,0,0,1,1,1,1]])
P = G[:, 4:7]
H = np.hstack([P.T, np.eye(3, dtype=int)]) % 2

codewords = [tuple((m @ G) % 2) for m in itertools.product([0, 1], repeat=4)]
even_weight = [c for c in codewords if sum(c) % 2 == 0]

def logical_zero():
    amps = np.zeros(2**7, dtype=complex)
    for c in even_weight:
        idx = int(''.join(map(str, reversed(c))), 2)
        amps[idx] = 1
    return amps / np.linalg.norm(amps)

def pauli_on(qubits, n=7, p='Z'):
    chars = ['I'] * n
    for q in qubits:
        chars[q] = p
    return ''.join(reversed(chars))

zero_L = logical_zero()
checks = [[j for j in range(7) if H[r, j] == 1] for r in range(3)]

print('=== X (bit-flip) error syndrome table ===')
x_results = {}
for err_q in range(7):
    qc = QuantumCircuit(7)
    qc.initialize(zero_L, range(7))
    qc.x(err_q)
    sv = Statevector(qc)
    syndrome = [0 if np.real(sv.expectation_value(SparsePauliOp(pauli_on(qs)))) &gt; 0.5 else 1
                for qs in checks]
    decoded = [j for j in range(7) if list(H[:, j]) == syndrome][0]
    x_results[err_q] = (syndrome, decoded)
    print(f'  error on q{err_q}: syndrome={syndrome}  decoded-&gt;q{decoded}  correct={decoded==err_q}')

def pauli_on_x(qubits, n=7):
    return pauli_on(qubits, n, p='X')

print('\n=== Z (phase-flip) error syndrome table ===')
z_results = {}
for err_q in range(7):
    qc = QuantumCircuit(7)
    qc.initialize(zero_L, range(7))
    qc.z(err_q)
    sv = Statevector(qc)
    syndrome = [0 if np.real(sv.expectation_value(SparsePauliOp(pauli_on_x(qs)))) &gt; 0.5 else 1
                for qs in checks]
    decoded = [j for j in range(7) if list(H[:, j]) == syndrome][0]
    z_results[err_q] = (syndrome, decoded)
    print(f'  error on q{err_q}: syndrome={syndrome}  decoded-&gt;q{decoded}  correct={decoded==err_q}')

qc0 = QuantumCircuit(7)
qc0.initialize(zero_L, range(7))
sv0 = Statevector(qc0)
no_error_syndrome = [0 if np.real(sv0.expectation_value(SparsePauliOp(pauli_on(qs)))) &gt; 0.5 else 1
                      for qs in checks]
print(f'\nNo-error syndrome: {no_error_syndrome} (all-zero, as expected)')

x_success = sum(1 for q, (s, d) in x_results.items() if d == q) / 7
z_success = sum(1 for q, (s, d) in z_results.items() if d == q) / 7
print(f'\nX-error decode success rate: {x_success*100:.1f}%')
print(f'Z-error decode success rate: {z_success*100:.1f}%')
print('The [[7,1,3]] Steane code corrects ANY single-qubit error (X, Y, or Z) --')
print('a strict improvement over the [[3,1,3]] code, which corrects only one error type.')

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
x_syn_matrix = np.array([x_results[q][0] for q in range(7)]).T
z_syn_matrix = np.array([z_results[q][0] for q in range(7)]).T

im0 = axes[0].imshow(x_syn_matrix, cmap='Blues', aspect='auto', vmin=0, vmax=1)
axes[0].set_xticks(range(7)); axes[0].set_xticklabels([f'q{i}' for i in range(7)])
axes[0].set_yticks(range(3)); axes[0].set_yticklabels(['S1', 'S2', 'S3'])
axes[0].set_title('X-error Syndrome Table (Z-type stabilisers)')
for i in range(3):
    for j in range(7):
        axes[0].text(j, i, x_syn_matrix[i,j], ha='center', va='center')

im1 = axes[1].imshow(z_syn_matrix, cmap='Greens', aspect='auto', vmin=0, vmax=1)
axes[1].set_xticks(range(7)); axes[1].set_xticklabels([f'q{i}' for i in range(7)])
axes[1].set_yticks(range(3)); axes[1].set_yticklabels(['S1', 'S2', 'S3'])
axes[1].set_title('Z-error Syndrome Table (X-type stabilisers)')
for i in range(3):
    for j in range(7):
        axes[1].text(j, i, z_syn_matrix[i,j], ha='center', va='center')

plt.tight_layout()
plt.savefig('lab23_steane_full_analysis.png', dpi=150)
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 23 — Expected Output &amp; Console Results</p><pre>  Expected results for Experiment 23:
  Steane [[7,1,3]] code: 7 physical qubits encode 1 logical qubit, distance 3, corrects any single-qubit error. X-type stabilisers (detect Z errors): g_...
  Actual console output for Experiment 23:
  === X (bit-flip) error syndrome table ===
    error on q0: syndrome=[0, 1, 1]  decoded-&gt;q0  correct=True
    error on q1: syndrome=[1, 0, 1]  decoded-&gt;q1  correct=True
    error on q2: syndrome=[1, 1, 0]  decoded-&gt;q2  correct=True
    error on q3: syndrome=[1, 1, 1]  decoded-&gt;q3  correct=True
    error on q4: syndrome=[1, 0, 0]  decoded-&gt;q4  correct=True
    error on q5: syndrome=[0, 1, 0]  decoded-&gt;q5  correct=True
    error on q6: syndrome=[0, 0, 1]  decoded-&gt;q6  correct=True
  === Z (phase-flip) error syndrome table ===
    error on q0: syndrome=[0, 1, 1]  decoded-&gt;q0  correct=True
    error on q1: syndrome=[1, 0, 1]  decoded-&gt;q1  correct=True
    error on q2: syndrome=[1, 1, 0]  decoded-&gt;q2  correct=True
    error on q3: syndrome=[1, 1, 1]  decoded-&gt;q3  correct=True
    error on q4: syndrome=[1, 0, 0]  decoded-&gt;q4  correct=True
    error on q5: syndrome=[0, 1, 0]  decoded-&gt;q5  correct=True
    error on q6: syndrome=[0, 0, 1]  decoded-&gt;q6  correct=True
  No-error syndrome: [0, 0, 0] (all-zero, as expected)
  X-error decode success rate: 100.0%
  Z-error decode success rate: 100.0%
  The [[7,1,3]] Steane code corrects ANY single-qubit error (X, Y, or Z) --
  a strict improvement over the [[3,1,3]] code, which corrects only one error type.</pre><img class="fig-img" src="content/images/image12.png"/></div><h2 id="3-observation-and-results-7">3. Observation and Results</h2><h3 id="observation-tables-1">Observation Tables</h3><p><em>Record all experimental data for Experiment 23 in the tables below. Complete during the practical session using actual measurements from simulation and/or IBM Quantum hardware.</em></p><table>
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
</table><h2 id="4-discussion-questions-7">4. Discussion Questions</h2><ol type="1"><li><p>Why does the Steane code require two separate sets of stabilisers (X-type and Z-type) instead of the single set used by the 3-qubit bit-flip code?</p></li><li><p>The syndrome for a single-qubit X error exactly equals the corresponding column of the classical parity-check matrix H. Why does this classical-code structure carry over so directly into a quantum error-correcting code?</p></li><li><p>What practical advantage does the Steane [[7,1,3]] code have over concatenating two separate 3-qubit codes (one for bit-flips, one for phase-flips) to protect against a general single-qubit error?</p></li><li><p>Write complete answers with supporting calculations, equations, and diagrams.</p></li><li><p>For IBM Hardware experiments: justify your choice of backend, qubit pair, and optimisation level.</p></li><li><p>Compare simulation vs hardware results and quantify all sources of error.</p></li></ol><h2 id="5-lab-record-requirements-7">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record key outputs and verify the basic concept.</p></li><li><p>Run the Full Program. Save all generated figures (label them lab23_*.png).</p></li><li><p>Complete all observation tables during the practical session.</p></li><li><p>Write complete, well-reasoned answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>What is a CSS code and why is the Steane code an example?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>CSS (Calderbank-Shor-Steane) codes: constructed from two classical linear codes C₁⊃C₂ with C₂⊥⊆C₁. X stabilisers from H_X of C₁; Z stabilisers from H_Z of C₂⊥. CSS structure ensures X and Z errors corrected independently. Steane code uses C₁=C₂=Hamming[7,4,3] — same code for both, giving symmetric structure. CSS codes have transversal H, CNOT, and (for some codes) T gates.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>What is the Hamming [7,4,3] code?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Hamming [7,4,3]: first non-trivial perfect 1-error-correcting code. Parameters: n=7 bits, k=4 information bits, d=3. Parity-check matrix H: 3×7 matrix where each column is a distinct 3-bit non-zero vector. Syndrome = H·e identifies the error position (1-7 in binary). Steane code uses H as both H_X and H_Z, giving 6 stabilisers (3 X-type + 3 Z-type).</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>What is code distance and how does it determine error correction capability?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Code distance d = minimum weight of a logical operator not in the stabiliser group. A code with distance d: detects weight ≤ d-1 errors, corrects weight ≤ ⌊(d-1)/2⌋ errors. Steane d=3: corrects any single-qubit error. Surface code d: corrects ⌊(d-1)/2⌋ errors, requires d² physical qubits. For logical error rate &lt;10⁻¹⁵: need d≈25-30 surface code (~900 physical qubits per logical qubit).</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>What are logical operators in the Steane code?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Logical operators are Pauli operators acting on the logical qubit without being stabilisers. X_L=X⁷ (X on all 7 qubits), Z_L=Z⁷ (Z on all 7 qubits). Both are weight-7 operators (minimum weight = code distance = 3 for non-stabiliser elements). Transversality: X_L applied bitwise — enables fault-tolerant CNOT between two logical qubits. This is the key practical advantage of CSS codes.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What is fault-tolerant quantum computation?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Fault-tolerant QC: circuit execution where single-component failures do not cascade to uncorrectable errors. Requirements: (1) encoded gates preserve code space, (2) error correction does not spread errors faster than they accumulate. Clifford gates (H, S, CNOT) are transversal in many codes. Non-Clifford T gate requires magic state distillation: prepare ~100 noisy |T⟩=(|0⟩+e^{iπ/4}|1⟩)/√2 states, purify to 1 high-fidelity |T⟩. T gate distillation dominates fault-tolerant overhead.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>Why are there exactly 3 X-type and 3 Z-type stabilisers for the Steane code, rather than some other number?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The Steane code is built from the classical [7,4,3] Hamming code, whose parity-check matrix H has 3 rows (since 7-4=3 independent parity checks are needed to encode 4 message bits into 7 codeword bits). Each row of H becomes one Z-type stabiliser (for detecting X errors) and, by the code's self-dual CSS structure, also one X-type stabiliser (for detecting Z errors).</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>What does it mean for the Steane code to be a 'CSS code', and why does that make constructing it easier?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>CSS (Calderbank-Shor-Steane) codes are built directly from a pair of classical linear codes, one for detecting X errors and one for detecting Z errors. Because the Steane code uses the SAME classical Hamming code for both roles, its stabiliser generators can be written down directly from a single well-understood classical parity-check matrix rather than derived from scratch.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>Why does measuring all three Z-type stabilisers together, rather than one at a time, let you pinpoint exactly which qubit had an X error?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Each stabiliser only tells you whether an EVEN or ODD number of the affected qubits had an error within its own subset. Combining all three syndrome bits into a 3-bit binary number uniquely reproduces the column of the parity-check matrix corresponding to the single erroring qubit, since every qubit position has a distinct 3-bit syndrome pattern.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>Why can the same syndrome-decoding table be reused for both X-type and Z-type errors in this code?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Since the Steane code is self-dual (its classical parity-check matrix and generator matrix have the same row space up to relabelling), the qubit groupings used for the Z-type stabilisers are identical to those used for the X-type stabilisers, just measured with different Pauli operators. The same H matrix therefore decodes both error types.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>What advantage does the Steane code have over simply using two independent copies of the 3-qubit bit-flip code (one for X errors, one for Z errors)?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Two independent 3-qubit codes would require 6 physical qubits just to protect against EITHER an X or a Z error separately, and still could not correctly handle a combined Y error (simultaneous X and Z) on the same qubit. The Steane code uses only 7 qubits and, being a genuine CSS code with overlapping structure, correctly identifies and corrects any single-qubit Pauli error including Y.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>Why is the Steane code's minimum distance 3, and what does that guarantee here?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The classical Hamming(7,4) code has minimum distance 3, and the Steane code inherits this property from its classical parent code. A distance-3 quantum code can correct any single-qubit error, since any two single-qubit-error syndromes are guaranteed to be distinguishable.</td></tr>
<tr class="even"><td><strong>Q12</strong></td><td><strong>How would the syndrome table change if you used a different classical [7,4,3] generator matrix (a different but equivalent choice of G)?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The actual bit-string values of the syndromes and the specific check-qubit groupings would change, but as long as the generator matrix still describes a valid Hamming(7,4) code, the SAME correction capability (correcting any single-qubit error) would be preserved. Only the lookup table's specific entries would differ.</td></tr>
<tr class="even"><td><strong>Q13</strong></td><td><strong>Why does the code use INITIALIZE with a hand-computed amplitude vector rather than a gate-by-gate encoding circuit?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Deriving a fully correct 7-qubit gate-level encoding circuit by hand is complex and error-prone; directly constructing the target logical state's amplitude vector from the classical code's codewords is mathematically equivalent and much easier to verify for correctness, though a real hardware implementation would need an explicit gate sequence.</td></tr>
</tbody>
</table>