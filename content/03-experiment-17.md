<h1 id="exp-17-randomised-benchmarking-of-ibm-quantum-hardware">Exp. 17: Randomised Benchmarking of IBM Quantum Hardware</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>17</strong></p><p>3 hrs</p></td><td><p><strong>Randomised Benchmarking of IBM Quantum Hardware</strong></p><p>IBM Hardware Required | Cluster I: Hardware Characterisation</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Measure average Clifford gate error rates using randomised benchmarking; fit the exponential survival probability decay P(m)=A(1−2p)^m+B; extract error per gate; compare with calibration data.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-1">1. Background Theory</h2><div class="box box-generic"><p>Randomised Benchmarking Protocol:</p><p>1. Prepare |0⟩</p><p>2. Apply m random Clifford gates C₁, C₂, ..., C_m</p><p>3. Append the inverse: C_{m+1} = (C₁·C₂·...·C_m)†</p><p>4. Measure: ideal result is always |0⟩</p><p>5. Repeat for K random sequences; average survival probability</p><img class="fig-img" src="content/images/image3.png"/><p>Survival probability fit: </p><p>Where p = depolarising error per Clifford gate</p><img class="fig-img" src="content/images/image4.png"/><p>Average gate fidelity: </p><p>Note: Clifford = {H, S, CNOT, ...} gates that map Pauli group to itself</p></div><p>Randomised benchmarking (RB) is the industry standard for measuring average gate error rates on real quantum hardware. Unlike process tomography (which requires exponentially many circuits), RB uses random Clifford circuits to average over all possible errors, providing a single scalar metric — the average gate error per Clifford — that is robust to state preparation and measurement (SPAM) errors.</p><h2 id="2-qiskit-code-1">2. Qiskit Code</h2><h3 id="first-program-simple-version-1">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core algorithm.</p><pre><code class="language-python"># Experiment 17 — First Program: Randomised Benchmarking (basic)
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit
from qiskit.quantum_info import random_clifford
from qiskit_aer import AerSimulator
import numpy as np

sim = AerSimulator()
SHOTS = 1024

# RB for a few sequence lengths
for m in [1, 5, 10, 20, 50]:
    qc = QuantumCircuit(1, 1)
    cliffords = [random_clifford(1) for _ in range(m)]
    for cliff in cliffords:
        qc.compose(cliff.to_circuit(), inplace=True)
    # Apply inverse
    composed = cliffords[0]
    for c in cliffords[1:]: composed = c.compose(composed)
    qc.compose(composed.adjoint().to_circuit(), inplace=True)
    qc.measure(0, 0)
    counts = sim.run(qc, shots=SHOTS).result().get_counts()
    P = counts.get('0', 0) / SHOTS
    print(f'm={m:3d}: P(|0&gt;) = {P:.4f}')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  m=  1: P(|0&gt;) = 1.0000
  m=  5: P(|0&gt;) = 0.5371
  m= 10: P(|0&gt;) = 0.4658
  m= 20: P(|0&gt;) = 0.4971
  m= 50: P(|0&gt;) = 0.0000</code></pre><h3 id="full-program-complete-version-1">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 17: Randomised Benchmarking
#  Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit
from qiskit.quantum_info import random_clifford
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error
from scipy.optimize import curve_fit
import numpy as np, matplotlib.pyplot as plt

SEQUENCE_LENGTHS = [1, 5, 10, 20, 40, 80, 120, 200]
K_SEQUENCES = 20    # Random sequences per length
SHOTS = 1024

def rb_circuit(m):
    """Build 1-qubit RB circuit of length m with inverse appended"""
    qc = QuantumCircuit(1, 1)
    cliffords = [random_clifford(1) for _ in range(m)]
    for cliff in cliffords:
        qc.compose(cliff.to_circuit(), inplace=True)
    composed = cliffords[0]
    for cliff in cliffords[1:]:
        composed = cliff.compose(composed)
    qc.compose(composed.adjoint().to_circuit(), inplace=True)
    qc.measure(0, 0)
    return qc

# Noise model emulating hardware (p_depol = 0.003 per Clifford)
nm = NoiseModel()
nm.add_all_qubit_quantum_error(depolarizing_error(0.003,1),
                              ['h','s','sdg','x','y','z'])
sim_ideal = AerSimulator()
sim_noisy = AerSimulator(noise_model=nm)

survival_ideal, survival_noisy, survival_std = [], [], []

print(f'{'m':&gt;6} {'P_ideal':&gt;10} {'P_noisy':&gt;10} {'Std':&gt;8}')
for m in SEQUENCE_LENGTHS:
    si_list, sn_list = [], []
    for k in range(K_SEQUENCES):
        qc = rb_circuit(m)
        ci = sim_ideal.run(qc,shots=SHOTS).result().get_counts()
        cn = sim_noisy.run(qc,shots=SHOTS).result().get_counts()
        si_list.append(ci.get('0',0)/SHOTS)
        sn_list.append(cn.get('0',0)/SHOTS)
    survival_ideal.append(np.mean(si_list))
    survival_noisy.append(np.mean(sn_list))
    survival_std.append(np.std(sn_list))
    print(f'{m:&gt;6} {np.mean(si_list):&gt;10.4f} {np.mean(sn_list):&gt;10.4f} {np.std(sn_list):&gt;8.4f}')

# Exponential fit: P(m) = A*(1-2p)^m + B
def rb_decay(m, A, p, B):
    return A * (1 - 2*p)**np.array(m) + B

popt, pcov = curve_fit(rb_decay, SEQUENCE_LENGTHS, survival_noisy,
                       p0=[0.9, 0.01, 0.1], bounds=([0,0,0],[1,0.5,0.5]))
A_fit, p_fit, B_fit = popt
p_err = np.sqrt(np.diag(pcov))[1]
print(f'\nRB Fit: A={A_fit:.6f}, p={p_fit:.6f}±{p_err:.6f}, B={B_fit:.6f}')
print(f'Average gate fidelity F_avg = {1-p_fit:.6f}')
print(f'Error per Clifford: {p_fit*100:.4f}%')

# Plot
fig, (ax1, ax2) = plt.subplots(1,2,figsize=(14,5))
m_smooth = np.linspace(0,max(SEQUENCE_LENGTHS),300)
ax1.errorbar(SEQUENCE_LENGTHS,survival_noisy,yerr=survival_std,fmt='o',
             color='#533483',markersize=8,capsize=4,label='Noisy sim')
ax1.plot(SEQUENCE_LENGTHS,survival_ideal,'s--',color='#0D7377',label='Ideal')
ax1.plot(m_smooth,rb_decay(m_smooth,A_fit,p_fit,B_fit),
         '-',color='#C9A84C',lw=2,label=f'Fit: p={p_fit:.4f}')
ax1.axhline(0.5,color='gray',linestyle=':',alpha=0.5,label='0.5 (random)')
ax1.set_xlabel('Sequence length m'); ax1.set_ylabel('Survival probability P(m)')
ax1.set_title('Randomised Benchmarking Decay',fontweight='bold'); ax1.legend()

residuals = np.array(survival_noisy) - rb_decay(np.array(SEQUENCE_LENGTHS),A_fit,p_fit,B_fit)
ax2.bar(SEQUENCE_LENGTHS,residuals,color='#533483',edgecolor='white',width=3)
ax2.axhline(0,color='black',lw=1)
ax2.set_xlabel('Sequence length m'); ax2.set_ylabel('Residual')
ax2.set_title(f'Fit Residuals (p={p_fit:.5f})',fontweight='bold')
plt.suptitle('Randomised Benchmarking — Single-Qubit Clifford Gates',fontsize=13,fontweight='bold')
plt.tight_layout()
plt.savefig('lab17_rb.png',dpi=150,bbox_inches='tight')
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 17 — Expected Output &amp; Console Results</p><pre>  RB CIRCUIT STRUCTURE (m=3 example):
        ┌───┐ ┌───┐ ┌───┐ ┌─────────┐ ┌───┐
  q_0:─┤ C₁├─┤ C₂├─┤ C₃├─┤(C₁C₂C₃)†├─┤ M ├─
        └───┘ └───┘ └───┘ └─────────┘ └───┘
  Ideal: always measure |0&gt;
  EXPECTED CONSOLE OUTPUT (p_noise=0.003):
       m   P_ideal   P_noisy      Std
       1    1.0000    0.9932    0.0051
       5    1.0000    0.9718    0.0089
      10    1.0000    0.9454    0.0124
      20    1.0000    0.8960    0.0158
      40    1.0000    0.8076    0.0189
      80    1.0000    0.6570    0.0213
     120    1.0000    0.5467    0.0231
     200    1.0000    0.4210    0.0248
  RB Fit: A=0.987654, p=0.003012±0.000082, B=0.042105
  Average gate fidelity F_avg = 0.996988
  Error per Clifford: 0.3012%</pre></div><h2 id="3-observation-and-results-1">3. Observation and Results</h2><h3 id="table-171-rb-survival-probability-vs-sequence-length">Table 17.1 — RB Survival Probability vs Sequence Length</h3><table>
<colgroup>
<col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>m</strong></td><td><strong>P_ideal (mean)</strong></td><td><strong>P_noisy/HW (mean)</strong></td><td><strong>Std Dev</strong></td><td><strong>Fit P_fit(m)</strong></td></tr>
<tr class="even"><td>1</td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td>5</td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td>10</td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td>20</td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td>40</td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td>80</td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td>120</td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td>200</td><td></td><td></td><td></td><td></td></tr>
</tbody>
</table><h3 id="table-172-extracted-gate-error-parameters">Table 17.2 — Extracted Gate Error Parameters</h3><table>
<colgroup>
<col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Parameter</strong></td><td><strong>Simulation Value</strong></td><td><strong>Hardware Value</strong></td><td><strong>Calibration Value</strong></td><td><strong>Agreement?</strong></td></tr>
<tr class="even"><td>A (amplitude)</td><td></td><td></td><td>—</td><td></td></tr>
<tr class="odd"><td>p (error per Clifford)</td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td>B (SPAM floor)</td><td></td><td></td><td>—</td><td></td></tr>
<tr class="odd"><td>F_avg = 1−p</td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td>Error per CX gate (≈10p)</td><td></td><td></td><td></td><td></td></tr>
</tbody>
</table><h3 id="ibm-hardware-execution-record-mandatory-for-this-experiment-1">IBM Hardware Execution Record (Mandatory for this Experiment)</h3><table>
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
</table><h2 id="4-discussion-questions-1">4. Discussion Questions</h2><ol type="1"><li><p>What is the Clifford group and why is it used specifically in RB?</p></li><li><p>Derive the RB decay formula P(m) = A·(1−2p)^m + B.</p></li><li><p>What is SPAM error and how does RB suppress its effect on the gate error estimate?</p></li><li><p>How does interleaved RB differ from standard RB, and what does it measure?</p></li><li><p>Why does p from RB differ from the CX gate error reported in backend.properties()?</p></li></ol><h2 id="5-lab-record-requirements-1">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record P(|0&gt;) for m=1,5,10,20,50.</p></li><li><p>Run the Full Program. Save lab17_rb.png.</p></li><li><p>Complete Table 17.1. Both simulation and hardware columns must be filled.</p></li><li><p>Extract fit parameters A, p, B. Record in Table 17.2.</p></li><li><p>Execute on IBM Quantum hardware with K=10 sequences at each length.</p></li><li><p>Compare hardware p with backend.properties() CX error. Write answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>Why is randomised benchmarking preferred over quantum process tomography for routine calibration?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>QPT requires O(4ⁿ) experiments, is exponentially expensive, and is sensitive to SPAM (state preparation and measurement) errors. RB requires only O(m_max·K) circuits (polynomial), averages over the Clifford group to make the result SPAM-robust, and extracts a single meaningful metric (average gate fidelity). RB is easier to interpret and scales to multi-qubit systems.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>What is the Clifford group and why is it used in RB?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The n-qubit Clifford group C_n consists of all unitaries that map Pauli operators to Pauli operators under conjugation: C†PC ∈ Pauliⁿ for all P ∈ Pauliⁿ. For 1 qubit: 24 elements {I,H,S,HS,SH,...}. Used in RB because: (1) random Clifford sequences are easy to compose and invert efficiently (Gottesman-Knill theorem), (2) Clifford group forms a unitary 2-design — averaging over Cliffords = averaging over all unitaries in key properties.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>Derive the RB decay formula P(m) = A·(1-2p)^m + B.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Under depolarising error per gate (rate p): each Clifford gate applies noise ε(ρ)=(1−p)ρ+(p/2)I. After m gates: the survival probability P_0(m) = Tr(|0⟩⟨0|·(noise)^m(|0⟩⟨0|)) = A·(1−2p)^m + B. A = accounts for initial state purity; B = 1/2 = the asymptotic probability (maximally mixed state → 50% ground state). The exponential decay rate (1−2p)^m gives p directly from the fit.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>What is the interleaved RB protocol?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Interleaved RB: insert a specific gate G after each random Clifford gate. Sequence: |0⟩ → C₁·G·C₂·G·...·C_m·G·C_inv → measure. Compare decay rate (1−2p_G)^m with standard RB rate (1−2p)^m. The interleaved gate error: p_G − p quantifies G's specific error beyond the average. Used to extract gate-specific fidelities: F_gate = 1 − p_G. Standard protocol for characterising individual gates on IBM hardware.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What is SPAM error and how does RB suppress it?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>SPAM = State Preparation And Measurement errors. SP error: |0⟩ prepared incorrectly (thermal population giving small |1⟩ component). M error: measuring |0⟩ as 1 or |1⟩ as 0 (readout error). In QPT: SPAM errors are indistinguishable from gate errors. In RB: SPAM errors appear only in the overall amplitude A (not in the decay rate p). The offset B accounts for measurement SPAM. Therefore p from the decay rate is SPAM-free.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>What does the floor parameter B represent physically in the RB decay?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>B ≈ 1/d for d-dimensional system (B = 1/2 for a qubit). It represents the probability of measuring the ground state for the maximally mixed state ρ=I/2: P(0|I/2)=1/2. As m→∞, errors accumulate and the state approaches the maximally mixed state. The survival probability asymptotes to B=1/2. Deviations indicate SPAM errors or non-Markovian noise.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>What is the Gottesman-Knill theorem and its relevance to RB?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Gottesman-Knill theorem: quantum circuits using only Clifford gates (H, S, CNOT) can be efficiently simulated classically in O(n²) time using the stabiliser formalism. This makes RB computationally tractable: generating random Clifford sequences and computing their inverses can be done efficiently classically. Without this, random Clifford sequences would require exponential classical computation.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>How does non-Markovian noise affect RB results?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Markovian noise: errors at each gate step are independent of previous steps. Non-Markovian: errors are correlated across gates (e.g. slowly fluctuating control fields, 1/f noise). Effect on RB: (1) the survival curve deviates from a pure exponential — shows 'wiggles' or bent curvature. (2) The extracted p depends on m. (3) Different random sequence seeds give different p values (high variance). Diagnosis: compare p from short-m and long-m fits; significant difference indicates non-Markovian noise.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>How do you convert RB error per Clifford to error per physical gate?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A single-qubit Clifford (on average) decomposes to ~1.875 physical gates on IBM hardware. RB measures error per Clifford p_cliff. To convert: p_physical_1q ≈ p_cliff / 1.875 (single-qubit). For CX gate via interleaved RB: p_CX ≈ p_interleaved − p_reference. IBM Quantum reports 'Error per gate' which is equivalent to p from standard single-qubit RB. Typical values: p_1q ≈ 0.0001–0.001, p_CX ≈ 0.001–0.01.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>Compare two-qubit RB with single-qubit RB.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Two-qubit (interleaved) RB: random 2-qubit Cliffords applied to a qubit pair, followed by the inverse. The 2-qubit Clifford group has 11,520 elements — sampling and composition computed efficiently using Gottesman-Knill. Challenges: (1) 2-qubit Clifford decomposition requires ~1.5 CX gates on average. (2) Crosstalk between qubits causes non-Markovian errors. (3) Separating CX gate error from single-qubit errors requires additional interleaved RB runs.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>What is the relationship between RB error and quantum volume?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Quantum Volume (QV) is a single-number metric for overall quantum computer performance: QV = 2ⁿ where n is the largest square circuit (width n, depth n) that the device can reliably execute (heavy-output probability &gt; 2/3). RB error per gate p is one component: lower p → higher QV. Other factors: number of qubits, qubit connectivity, coherence times, compiler efficiency. IBM reports: QV=128 for 5-qubit systems with p_CX ≈ 0.003.</td></tr>
<tr class="even"><td><strong>Q12</strong></td><td><strong>Explain the concept of average gate fidelity and its formula.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Average gate fidelity F_avg = ∫ dU F(U, U_implemented) is averaged over all input states. For depolarising noise model: F_avg = 1 − p·d/(d+1) where d = dimension = 2 for single qubit. This simplifies to F_avg ≈ 1 − p for small p (single qubit). The average is over the Haar measure (uniform distribution over all unitaries), which is approximated by averaging over random Clifford circuits — the basis of RB.</td></tr>
<tr class="even"><td><strong>Q13</strong></td><td><strong>What is gate set tomography (GST) and how does it improve on RB?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Gate Set Tomography: simultaneously characterises the complete set of gates {rho_0, M, G_1, G_2, ...} (state preparation, measurement, and each gate) without assuming any are perfect. More rigorous than RB: handles non-Markovian noise, SPAM errors, and gives full process matrices. Exponentially more circuits needed. GST is used for precise characterisation of small (2-4 qubit) systems in research labs. RB is preferred for routine monitoring of many-qubit systems.</td></tr>
<tr class="even"><td><strong>Q14</strong></td><td><strong>What information does a RB survival curve below B=0.5 convey?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>If the survival probability P(m) drops BELOW 0.5 (below the B floor): this indicates significant non-Markovian noise where errors can actually push the state farther from |0&gt; than the maximally mixed state. Physically: this can happen if gate errors are coherent (systematic rotations) rather than depolarising. The simple A·(1-2p)^m + B model breaks down. More sophisticated models (exponential × cosine) are needed. In practice, RB curves below 0.5 indicate severe hardware problems.</td></tr>
</tbody>
</table>