<h1 id="exp-16-quantum-state-tomography-full-2-qubit-reconstruction">Exp. 16: Quantum State Tomography — Full 2-Qubit Reconstruction</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>16</strong></p><p>3 hrs</p></td><td><p><strong>Quantum State Tomography — Full 2-Qubit Reconstruction</strong></p><p>IBM Hardware Required | Cluster I: Hardware Characterisation</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Reconstruct the complete 4×4 density matrix of a 2-qubit Bell state from 16 Pauli basis measurements; compute tomographic fidelity; execute on IBM Quantum hardware and compare with the ideal Bell state.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory">1. Background Theory</h2><p>Quantum state tomography (QST) is the experimental procedure for completely characterising an unknown quantum state. For a 2-qubit system, the density matrix ρ is a 4×4 complex Hermitian matrix with unit trace, fully specified by 15 independent real parameters. These are extracted by measuring expectation values of all 16 tensor products of single-qubit Pauli operators {I, X, Y, Z}⊗{I, X, Y, Z}.</p><div class="box box-generic"><p>Tomographic reconstruction formula:</p><img class="fig-img" src="content/images/image2.png"/><p>For a 2-qubit system: 16 Pauli basis measurements needed</p><p>Tomographic fidelity: F_tomo = Tr(ρ_ideal · ρ_reconstructed)</p><p>Ideal |Φ+⟩ density matrix:</p><p>ρ_ideal = (1/2) [[1,0,0,1],[0,0,0,0],[0,0,0,0],[1,0,0,1]]</p></div><p>Expected non-zero Pauli expectation values for |Φ+⟩ = (|00⟩+|11⟩)/√2:</p><table>
<colgroup>
<col style="width: 33%"/><col style="width: 33%"/><col style="width: 33%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Pauli Operator</strong></td><td><strong>Expected </strong><strong>⟨</strong><strong>P</strong><strong>⟩</strong></td><td><strong>Physical Meaning</strong></td></tr>
<tr class="even"><td>II</td><td>+1.000</td><td>Normalisation (always 1)</td></tr>
<tr class="odd"><td>XX</td><td>+1.000</td><td>Perfect X-correlation between Q0 and Q1</td></tr>
<tr class="even"><td>YY</td><td>−1.000</td><td>Perfect Y anti-correlation</td></tr>
<tr class="odd"><td>ZZ</td><td>+1.000</td><td>Perfect Z-correlation</td></tr>
<tr class="even"><td>All others</td><td>0.000</td><td>No single-qubit polarisation for |Φ+⟩</td></tr>
</tbody>
</table><h2 id="2-qiskit-code">2. Qiskit Code</h2><h3 id="first-program-simple-version">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core algorithm.</p><pre><code class="language-python"># Experiment 16 — First Program: Quantum State Tomography
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp
from qiskit_aer.primitives import Estimator
import numpy as np

# Prepare |Phi+&gt; Bell state
qc = QuantumCircuit(2)
qc.h(0); qc.cx(0, 1)

# Measure 4 key Pauli operators
estimator = Estimator()
for op in ['II','XX','YY','ZZ']:
    obs = SparsePauliOp(op)
    result = estimator.run([(qc, obs)]).result()
    ev = float(result[0].data.evs)
    print(f'&lt;{op}&gt; = {ev:+.6f}  (expected: +1 for XX,ZZ; -1 for YY; +1 for II)')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  &lt;II&gt; = +1.000000  (expected: +1 for XX,ZZ; -1 for YY; +1 for II)
  &lt;XX&gt; = +1.000000  (expected: +1 for XX,ZZ; -1 for YY; +1 for II)
  &lt;YY&gt; = -1.000000  (expected: +1 for XX,ZZ; -1 for YY; +1 for II)
  &lt;ZZ&gt; = +1.000000  (expected: +1 for XX,ZZ; -1 for YY; +1 for II)</code></pre><h3 id="full-program-complete-version">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 16: Quantum State Tomography — Full 2-Qubit Reconstruction
#  Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit
from qiskit.quantum_info import DensityMatrix, Statevector, state_fidelity, SparsePauliOp
from qiskit_aer.primitives import Estimator
import numpy as np, matplotlib.pyplot as plt

# Prepare |Phi+&gt; Bell state
def bell_phi_plus():
    qc = QuantumCircuit(2)
    qc.h(0); qc.cx(0, 1)
    return qc

qc = bell_phi_plus()

# Ideal density matrix for verification
sv_ideal = Statevector(qc)
rho_ideal = DensityMatrix(sv_ideal).data

# All 16 two-qubit Pauli operators (Qiskit: rightmost = qubit 0)
pauli_labels = ['II','IX','IY','IZ','XI','XX','XY','XZ',
                'YI','YX','YY','YZ','ZI','ZX','ZY','ZZ']

# Measure all expectation values
estimator = Estimator()
observables = [SparsePauliOp(p) for p in pauli_labels]
jobs = [(qc, obs) for obs in observables]
results = estimator.run(jobs).result()

exp_values = {}
print('Pauli Expectation Values for |Phi+&gt;:')
expected = {'II':1,'XX':1,'YY':-1,'ZZ':1}
for label, result in zip(pauli_labels, results):
    ev = float(result.data.evs)
    exp_values[label] = ev
    exp_str = f'{expected.get(label,0):+.4f}'
    print(f'{label:&gt;4}  {ev:&gt;+10.6f}  (expected: {exp_str})')

# Reconstruct density matrix from Pauli expansion
I2=np.eye(2); X=np.array([[0,1],[1,0]])
Y=np.array([[0,-1j],[1j,0]]); Z=np.array([[1,0],[0,-1]])
paulis_1q = {'I':I2,'X':X,'Y':Y,'Z':Z}

rho_recon = np.zeros((4,4),dtype=complex)
for label, ev in exp_values.items():
    P_full = np.kron(paulis_1q[label[0]], paulis_1q[label[1]])
    rho_recon += ev * P_full
rho_recon /= 4.0

# Tomographic fidelity
F_tomo = float(np.real(np.trace(rho_ideal @ rho_recon)))
purity = float(np.real(np.trace(rho_recon @ rho_recon)))
print(f'\nTomographic fidelity: F = {F_tomo:.8f}  (expected: 1.0 for ideal sim)')
print(f'Purity of reconstructed state: {purity:.8f}  (expected: 1.0)')

# Three-panel heatmap
fig, axes = plt.subplots(1, 3, figsize=(17, 5))
im0=axes[0].imshow(np.real(rho_ideal),cmap='RdBu_r',vmin=-0.5,vmax=0.5)
axes[0].set_title('Re(rho) - Ideal |Phi+&gt;',fontweight='bold')
plt.colorbar(im0,ax=axes[0])
im1=axes[1].imshow(np.real(rho_recon),cmap='RdBu_r',vmin=-0.5,vmax=0.5)
axes[1].set_title('Re(rho) - Reconstructed',fontweight='bold')
plt.colorbar(im1,ax=axes[1])
im2=axes[2].imshow(np.abs(rho_ideal-rho_recon),cmap='hot_r')
axes[2].set_title('|rho_ideal - rho_recon| Error',fontweight='bold')
plt.colorbar(im2,ax=axes[2])
plt.suptitle(f'2-Qubit QST of |Phi+&gt; (F_tomo={F_tomo:.6f})',fontsize=13,fontweight='bold')
plt.tight_layout()
plt.savefig('lab16_tomography.png',dpi=150,bbox_inches='tight')
plt.show()

# IBM Hardware section
# from qiskit_ibm_runtime import QiskitRuntimeService, Estimator as HWEst
# service = QiskitRuntimeService(channel='ibm_quantum')
# backend = service.least_busy(operational=True,simulator=False,min_num_qubits=2)
# [Transpile, run 16 circuits on hardware, record Job ID, reconstruct rho_hw]</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 16 — Expected Output &amp; Console Results</p><pre>  CIRCUIT: |Phi+&gt; Bell State for QST
        ┌───┐
  q_0: ─┤ H ├─■─
        └───┘ │
  q_1: ──────┌┤X├─
               └───┘
  CONSOLE OUTPUT (simulation):
  Pauli Expectation Values for |Phi+&gt;:
    II  = +1.000000  (expected: +1)
    XX  = +1.000000  (expected: +1)
    YY  = -1.000000  (expected: -1)
    ZZ  = +1.000000  (expected: +1)
    IX  =  0.000000  (expected:  0)
    (all others ≈ 0)
  Tomographic fidelity: F = 1.00000000  (expected: 1.0)
  Purity of reconstructed state: 1.00000000
  RECONSTRUCTED 4×4 DENSITY MATRIX ρ (ideal):
  Re(ρ) = [[0.5, 0,   0,   0.5],
            [0,   0,   0,   0  ],
            [0,   0,   0,   0  ],
            [0.5, 0,   0,   0.5]]
  Im(ρ) = all zeros (no imaginary coherences for |Phi+&gt;)</pre></div><h2 id="3-observation-and-results">3. Observation and Results</h2><h3 id="table-161-pauli-expectation-values">Table 16.1 — Pauli Expectation Values</h3><table>
<colgroup>
<col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Operator</strong></td><td><strong>Simulation </strong><strong>⟨</strong><strong>P</strong><strong>⟩</strong></td><td><strong>Hardware </strong><strong>⟨</strong><strong>P</strong><strong>⟩</strong></td><td><strong>Expected</strong></td><td><strong>Deviation (HW−Sim)</strong></td></tr>
<tr class="even"><td>II</td><td></td><td></td><td>+1.000</td><td></td></tr>
<tr class="odd"><td>XX</td><td></td><td></td><td>+1.000</td><td></td></tr>
<tr class="even"><td>YY</td><td></td><td></td><td>−1.000</td><td></td></tr>
<tr class="odd"><td>ZZ</td><td></td><td></td><td>+1.000</td><td></td></tr>
<tr class="even"><td>XI</td><td></td><td></td><td>0.000</td><td></td></tr>
<tr class="odd"><td>IZ</td><td></td><td></td><td>0.000</td><td></td></tr>
<tr class="even"><td>All others</td><td>≈0</td><td></td><td>0.000</td><td></td></tr>
</tbody>
</table><h3 id="table-162-tomographic-fidelity-and-purity">Table 16.2 — Tomographic Fidelity and Purity</h3><table>
<colgroup>
<col style="width: 25%"/><col style="width: 25%"/><col style="width: 25%"/><col style="width: 25%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Metric</strong></td><td><strong>Simulation Value</strong></td><td><strong>Hardware Value</strong></td><td><strong>Ideal Value</strong></td></tr>
<tr class="even"><td>Tomographic fidelity F</td><td></td><td></td><td>1.0</td></tr>
<tr class="odd"><td>Purity Tr(ρ²)</td><td></td><td></td><td>1.0</td></tr>
<tr class="even"><td>Trace Tr(ρ)</td><td></td><td></td><td>1.0</td></tr>
<tr class="odd"><td>Max element error |ρ_ideal−ρ_recon|</td><td></td><td></td><td>0.0</td></tr>
<tr class="even"><td>Hardware F degradation F_hw−F_sim</td><td>—</td><td></td><td>—</td></tr>
</tbody>
</table><h3 id="ibm-hardware-execution-record-mandatory-for-this-experiment">IBM Hardware Execution Record (Mandatory for this Experiment)</h3><table>
<colgroup>
<col style="width: 50%"/><col style="width: 50%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Parameter</strong></td><td><strong>Value Recorded</strong></td></tr>
<tr class="even"><td>Device Name</td><td></td></tr>
<tr class="odd"><td>Number of Qubits</td><td></td></tr>
<tr class="even"><td>Qubits / Pair Used</td><td></td></tr>
<tr class="odd"><td>T₁ (μs) per qubit</td><td></td></tr>
<tr class="even"><td>T₂ (μs) per qubit</td><td></td></tr>
<tr class="odd"><td>CX / Gate Error Rate</td><td></td></tr>
<tr class="even"><td>Readout Error</td><td></td></tr>
<tr class="odd"><td>Transpiled Circuit Depth</td><td></td></tr>
<tr class="even"><td>Optimisation Level</td><td></td></tr>
<tr class="odd"><td>Shot Count</td><td></td></tr>
<tr class="even"><td>IBM Quantum Job ID</td><td></td></tr>
<tr class="odd"><td>Submission Date/Time</td><td></td></tr>
<tr class="even"><td>Queue Wait Time</td><td></td></tr>
<tr class="odd"><td>Hardware Counts (all states)</td><td></td></tr>
<tr class="even"><td>Simulation Counts (ideal)</td><td></td></tr>
<tr class="odd"><td>Error Rate (unexpected/total)</td><td></td></tr>
<tr class="even"><td>Mitigation Applied?</td><td></td></tr>
</tbody>
</table><h2 id="4-discussion-questions">4. Discussion Questions</h2><ol type="1"><li><p>Explain why measuring in only 9 Pauli bases suffices for 2-qubit tomography. What does the II measurement contribute?</p></li><li><p>Which Pauli measurement showed the largest deviation on hardware? Which noise process caused it?</p></li><li><p>Calculate the Hilbert-Schmidt distance between the ideal and reconstructed density matrices.</p></li><li><p>For an n-qubit system, how many Pauli measurements are needed for complete tomography?</p></li><li><p>Why does QST become exponentially expensive for large systems? What alternative methods exist?</p></li></ol><h2 id="5-lab-record-requirements">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record all 16 Pauli expectation values.</p></li><li><p>Run the Full Program. Save lab16_tomography.png and paste into your lab record.</p></li><li><p>Complete Tables 16.1 and 16.2 using simulation values.</p></li><li><p>Execute on IBM Quantum hardware. Record Job ID, calibration data, and hardware Pauli values.</p></li><li><p>Compare simulation vs hardware density matrices. Identify the largest error element and explain its origin.</p></li><li><p>Write answers to all 5 Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>What is quantum state tomography and why is it exponentially expensive?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>QST is the experimental procedure for completely characterising an unknown quantum state by measuring expectation values of a complete set of observables. For n qubits: 4ⁿ Pauli measurements needed to reconstruct the 4ⁿ−1 independent density matrix elements. For n=2: 16; n=5: 1,024; n=10: 1,048,576. This exponential scaling makes QST infeasible for large systems. Alternative methods: compressed sensing (O(r·d·log·d) for rank-r states), shadow tomography, and cross-entropy benchmarking.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>Explain the Pauli basis expansion of the density matrix.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>ρ = (1/2ⁿ) Σ_{P∈Pauliⁿ} Tr(Pρ)·P = (1/2ⁿ) Σ_P ⟨P⟩·P. The 4ⁿ Pauli operators {I,X,Y,Z}^⊗n form a complete orthonormal basis under the Hilbert-Schmidt inner product Tr(P†Q)=2ⁿ·δ_{P,Q}. Each expectation value ⟨P⟩=Tr(ρP) is measured on the hardware, and the density matrix is reconstructed as a linear combination.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>What is the tomographic fidelity and what value is expected for ideal simulation?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Tomographic fidelity F_tomo = Tr(ρ_ideal·ρ_recon) measures how well the reconstructed state matches the ideal target. For ideal noise-free simulation: F_tomo = 1.0 (exact reconstruction since we measure infinite-precision expectation values). On real hardware: F_tomo &lt; 1 due to gate errors, T₁ relaxation, T₂ dephasing, and readout errors. Typical IBM hardware values: F_tomo ≈ 0.85–0.97 for 2-qubit Bell states.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>Why is the imaginary part Im(ρ) important in QST?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Im(ρ) captures quantum coherences with non-trivial phases. For |Φ+⟩: Im(ρ)=0 (all coherences real). For states produced by Y rotations or GHZ+i, Im(ρ) can be large. Missing Y-operator measurements (YI, IY, XY, YX, YY, YZ, ZY) means losing all imaginary coherences — the wrong state is reconstructed. All 16 Pauli measurements are needed for the complete reconstruction.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What is compressed sensing QST and how does it reduce measurement overhead?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Compressed sensing QST: if the unknown state has special structure (e.g. low rank — near-pure states), far fewer than 4ⁿ measurements suffice. For a rank-r state of d-dimensional system: O(r·d·log·d) measurements. Algorithm: choose random Pauli measurements, solve a convex optimisation (semidefinite programming) with rank-minimisation regulariser. For near-pure states on real hardware, CS QST is 10–100× faster.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>Explain the relationship between tomographic fidelity and gate fidelity.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Tomographic fidelity F_tomo = Tr(ρ_ideal·ρ_reconstructed) measures state quality. Gate fidelity F_gate = 1 − p measures circuit quality (from RB). They are related but distinct: low F_tomo usually indicates low F_gate for the circuit's gates, plus readout errors. Full process tomography (not just state tomography) characterises F_gate completely.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>What is the positivity constraint in QST and how does it affect reconstruction?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A valid density matrix must be positive semidefinite: ρ ≥ 0 (all eigenvalues ≥ 0). Naive linear inversion of Pauli expectation values with shot noise can produce matrices with negative eigenvalues (unphysical). Maximum likelihood estimation (MLE) QST solves: argmin_{ρ≥0,Tr(ρ)=1} Σ_k (⟨P_k⟩_measured − Tr(P_k·ρ))². This enforces positivity and gives the most likely physical state.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>What is shadow tomography and how does it differ from full QST?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Shadow tomography: estimate expectation values ⟨O₁⟩,...,⟨O_M⟩ for M observables using O(log²M/ε²) measurements — exponentially fewer than full QST. Algorithm: apply random unitary U, measure in computational basis, store (U, outcome) as a 'classical shadow'. From many shadows, estimate ⟨O_k⟩ classically. Sufficient for VQE energy estimation, ML tasks, quantum error correction diagnostics — without reconstructing full ρ.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>How does hardware noise affect the tomographic reconstruction?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Hardware noise introduces systematic errors: (1) Gate errors during state preparation shift ρ away from ideal. (2) Readout errors confuse 0↔≡ in the measurement outcomes — mitigated by calibration matrix M^{−1}. (3) T₁ relaxation partially dephases |1⟩ components. (4) T₂ dephasing shrinks off-diagonal elements. Net effect: off-diagonal Pauli expectations are smaller than ideal, diagonal less affected. The error heatmap |rho_ideal−rho_recon| shows largest errors in the off-diagonal positions.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>What is the number of physical circuits needed for 2-qubit and 5-qubit QST?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>For n-qubit QST: 4ⁿ Pauli circuits needed (each circuit measures one Pauli operator). n=2: 16 circuits. n=3: 64 circuits. n=5: 1,024 circuits. n=10: 1,048,576 circuits (impractical). Each circuit requires N_shots measurements. Total shots: 4ⁿ × N_shots. For IBM Quantum with 1024 shots/circuit: n=5 requires 1,024 × 1,024 = 1,048,576 total shots — feasible. n=10: 10¹⁰ shots — impossible.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>What is the Hilbert-Schmidt distance and how does it relate to tomographic fidelity?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Hilbert-Schmidt distance: d_HS(ρ,σ) = √(Tr((ρ−σ)²)). For pure states: d_HS² = 2−2F_tomo. So high fidelity ⇔ small HS distance. For the ideal Bell state vs reconstructed: d_HS² = 2−2×1.0 = 0 (ideal). On hardware with F_tomo=0.92: d_HS² = 2−1.84 = 0.16, d_HS = 0.40.</td></tr>
<tr class="even"><td><strong>Q12</strong></td><td><strong>Explain what happens to the density matrix heatmap when T₂ decoherence is significant.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>T₂ decoherence decays off-diagonal coherences: ρᵢⱼ(t) = ρᵢⱼ(0)·e^(−t/T₂). In the 2-qubit density matrix heatmap: the off-diagonal elements ρ_{00,11}=ρ_{11,00}=0.5 for ideal |Phi+&gt; become 0.5·e^(−t/T₂) &lt; 0.5. The Re(ρ) heatmap shows: bright spots at (0,0) and (3,3) remain (diagonal, T₂-immune), but spots at (0,3) and (3,0) fade — directly visible as tomographic fidelity reduction.</td></tr>
<tr class="even"><td><strong>Q13</strong></td><td><strong>What is quantum process tomography (QPT) and how does it differ from QST?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>QST characterises a quantum STATE (output of a circuit for one fixed input). QPT characterises a quantum PROCESS (the circuit/channel itself for all possible inputs). QPT requires: preparing 4ⁿ input states, applying the process, doing QST on each output — total 16ⁿ circuits for n qubits. QPT gives the complete process matrix χ encoding how any state transforms. Much more expensive than QST; randomised benchmarking is more practical for routine gate characterisation.</td></tr>
<tr class="even"><td><strong>Q14</strong></td><td><strong>How do you verify that a reconstructed density matrix is physically valid?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A valid density matrix ρ must satisfy: (1) Tr(ρ)=1 (normalisation — check numerically), (2) ρ†=ρ (Hermitian — check by comparing ρ with ρ*ᵀ), (3) ρ ≥ 0 (positive semidefinite — all eigenvalues ≥ 0; check via np.linalg.eigvalsh(ρ)). Shot noise can cause small negative eigenvalues in the naive reconstruction. MLE projection enforces positivity. If any eigenvalue &lt; −0.01, the reconstruction is unreliable (too few shots or too much noise).</td></tr>
<tr class="even"><td><strong>Q15</strong></td><td><strong>What is the difference between state tomography and quantum process tomography for IBM hardware?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>State tomography of the output |Φ+⟩: run 16 circuits (different Pauli measurements) on the same 2-gate circuit (H+CX). Process tomography of the H+CX channel: prepare 4²=16 input states (each combination of {|0⟩,|1⟩,|+⟩,|+i⟩} on each qubit), apply H+CX, run QST on each output — 16×16=256 circuits total. State tomography tells you the state produced; process tomography tells you the full channel including all errors.</td></tr>
</tbody>
</table>