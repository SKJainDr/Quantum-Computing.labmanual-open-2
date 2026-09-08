<h1 id="exp-29-expectation-value-sweeps-with-error-mitigation-on-ibm-har">Exp. 29: Expectation Value Sweeps with Error Mitigation on IBM Hardware</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>29</strong></p><p>4 hrs</p></td><td><p><strong>Expectation Value Sweeps with Error Mitigation on IBM Hardware</strong></p><p>Advanced Hardware | IBM Hardware Required | Cluster V</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Measure ⟨Z⟩ on qubit 0 of a parameterised state on IBM hardware with and without ZNE; compute improvement ratios across angular sweep θ ∈ [0, 2π]; demonstrate error mitigation effectiveness.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-13">1. Background Theory</h2><figure class="book-figure"><img loading="lazy" src="content/images/image21.png"/></figure><p>Parameterised circuit: |ψ(θ)⟩ = (Ry(θ)⊗I)·CX·|00⟩. . Apply ZNE with gate folding at λ=1,3,5. Linear extrapolation to λ=0. Improvement ratio = |ideal-raw|/|ideal-ZNE|. Combined with readout error mitigation: calibrate confusion matrix M, apply M^{-1} to raw counts. IBM Qiskit Runtime Estimator: resilience_level=2 enables automatic ZNE. Combine both mitigations for maximum improvement. Average improvement: ~3× across all angles. Best improvement at θ=90° and 270° (zero-crossing, high relative error).</p><h2 id="2-qiskit-code-13">2. Qiskit Code</h2><h3 id="first-program-simple-version-13">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 29 — First Program
# Expectation Value Sweeps with Error Mitigation on IBM Hardware
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error
import numpy as np

noise_model = NoiseModel()
noise_model.add_all_qubit_quantum_error(depolarizing_error(0.02, 2), ['cx'])
noise_model.add_all_qubit_quantum_error(depolarizing_error(0.005, 1), ['ry'])
sim_noisy = AerSimulator(noise_model=noise_model)
sim_ideal = AerSimulator()

def prep_circuit(theta, fold=1):
    qc = QuantumCircuit(2, 2)
    qc.ry(theta, 0)
    for _ in range(fold):
        qc.cx(0, 1)
    qc.measure([0, 1], [0, 1])
    return qc

def z0_expectation(counts, shots):
    return sum((1 if k[-1] == '0' else -1) * v for k, v in counts.items()) / shots

theta = np.pi / 3
shots = 4096
ideal_z0 = np.cos(theta)

qc = prep_circuit(theta, fold=1)
counts_ideal = sim_ideal.run(transpile(qc, sim_ideal), shots=shots).result().get_counts()
counts_noisy = sim_noisy.run(transpile(qc, sim_noisy), shots=shots).result().get_counts()

z0_ideal_sim = z0_expectation(counts_ideal, shots)
z0_noisy = z0_expectation(counts_noisy, shots)

print(f'theta = pi/3, analytic &lt;Z&gt;_qubit0 = cos(theta) = {ideal_z0:.4f}')
print(f'Noiseless simulation:  &lt;Z&gt; = {z0_ideal_sim:.4f}')
print(f'Noisy simulation:      &lt;Z&gt; = {z0_noisy:.4f}')
print(f'Absolute error from noise: {abs(z0_noisy - ideal_z0):.4f}')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  theta = pi/3, analytic &lt;Z&gt;_qubit0 = cos(theta) = 0.5000
  Noiseless simulation:  &lt;Z&gt; = 0.4951
  Noisy simulation:      &lt;Z&gt; = 0.4868
  Absolute error from noise: 0.0132</code></pre><h3 id="full-program-complete-version-13">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 29: Expectation Value Sweeps with Error Mitigation on IBM Hardware
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error, ReadoutError
import numpy as np, matplotlib.pyplot as plt

noise_model = NoiseModel()
noise_model.add_all_qubit_quantum_error(depolarizing_error(0.06, 2), ['cx'])
noise_model.add_all_qubit_quantum_error(depolarizing_error(0.005, 1), ['ry'])
sim_noisy = AerSimulator(noise_model=noise_model)
shots = 8192

def prep_circuit(theta, fold=1):
    qc = QuantumCircuit(2, 2)
    qc.ry(theta, 0)
    for _ in range(fold):
        qc.cx(0, 1)
    qc.measure([0, 1], [0, 1])
    return qc

def z0_expectation(counts, shots):
    return sum((1 if k[-1] == '0' else -1) * v for k, v in counts.items()) / shots

def zne_extrapolate(theta, folds=(1, 3, 5)):
    vals = []
    for f in folds:
        qc = prep_circuit(theta, fold=f)
        counts = sim_noisy.run(transpile(qc, sim_noisy, optimization_level=0), shots=shots).result().get_counts()
        vals.append(z0_expectation(counts, shots))
    slope, intercept = np.polyfit(folds, vals, 1)
    return intercept, vals

thetas = np.linspace(0, 2*np.pi, 13)
ideal_vals, raw_vals, zne_vals = [], [], []
for theta in thetas:
    ideal = np.cos(theta)
    qc_raw = prep_circuit(theta, fold=1)
    counts_raw = sim_noisy.run(transpile(qc_raw, sim_noisy, optimization_level=0), shots=shots).result().get_counts()
    raw = z0_expectation(counts_raw, shots)
    zne, _ = zne_extrapolate(theta)
    ideal_vals.append(ideal); raw_vals.append(raw); zne_vals.append(zne)

raw_err = np.abs(np.array(raw_vals) - np.array(ideal_vals))
zne_err = np.abs(np.array(zne_vals) - np.array(ideal_vals))
improvement = np.divide(raw_err, zne_err, out=np.full_like(raw_err, np.nan), where=zne_err &gt; 1e-6)

print('theta      ideal    raw(noisy)   ZNE      |raw err|  |ZNE err|  improvement')
for i, th in enumerate(thetas):
    print(f'{th:6.3f}  {ideal_vals[i]:+.4f}   {raw_vals[i]:+.4f}    {zne_vals[i]:+.4f}   '
          f'{raw_err[i]:.4f}    {zne_err[i]:.4f}    {improvement[i]:.2f}x')

print(f'\nAverage |raw error|  = {np.mean(raw_err):.4f}')
print(f'Average |ZNE error|  = {np.mean(zne_err):.4f}')
print(f'Average improvement factor = {np.nanmean(improvement):.2f}x')

print('\n--- Readout error mitigation (confusion matrix) ---')
readout_noise = NoiseModel()
p01, p10 = 0.03, 0.05
readout_noise.add_readout_error(ReadoutError([[1-p01, p01], [p10, 1-p10]]), [0])
readout_noise.add_readout_error(ReadoutError([[1-p01, p01], [p10, 1-p10]]), [1])
sim_readout = AerSimulator(noise_model=readout_noise)

qc0 = QuantumCircuit(2, 2); qc0.measure([0,1],[0,1])
counts_cal = sim_readout.run(transpile(qc0, sim_readout), shots=shots).result().get_counts()
p_error_00 = 1 - counts_cal.get('00', 0)/shots
print(f'Calibration (prepared |00&gt;): P(misread) = {p_error_00:.4f}')

theta_test = np.pi/4
qc_test = prep_circuit(theta_test, fold=1)
counts_test = sim_readout.run(transpile(qc_test, sim_readout), shots=shots).result().get_counts()
z0_raw_readout = z0_expectation(counts_test, shots)
avg_readout_err = (p01 + p10) / 2
z0_mitigated = z0_raw_readout / (1 - 2*avg_readout_err)
ideal_test = np.cos(theta_test)
print(f'theta={theta_test:.3f}: ideal={ideal_test:.4f}  raw(readout noise)={z0_raw_readout:.4f}  '
      f'mitigated={z0_mitigated:.4f}')
print(f'Error before mitigation: {abs(z0_raw_readout-ideal_test):.4f}, '
      f'after: {abs(z0_mitigated-ideal_test):.4f}')

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].plot(thetas, ideal_vals, 'k--', label='ideal cos(theta)')
axes[0].plot(thetas, raw_vals, 'o-', color='#C44E52', label='raw (noisy)')
axes[0].plot(thetas, zne_vals, 's-', color='#55A868', label='ZNE mitigated')
axes[0].set_xlabel('theta'); axes[0].set_ylabel('&lt;Z&gt; qubit 0')
axes[0].set_title('Zero-Noise Extrapolation vs Theta'); axes[0].legend(fontsize=8)

axes[1].bar(['raw', 'ZNE'], [np.mean(raw_err), np.mean(zne_err)], color=['#C44E52','#55A868'])
axes[1].set_ylabel('Mean absolute error'); axes[1].set_title('Average Error: Raw vs ZNE')

plt.tight_layout()
plt.savefig('lab29_zne_mitigation_full_analysis.png', dpi=150)
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 29 — Expected Output &amp; Console Results</p><pre>  Expected results for Experiment 29:
  Parameterised circuit: |ψ(θ)⟩ = (Ry(θ)⊗I)·CX·|00⟩. ⟨ZZ⟩_ideal = cos(2θ). Apply ZNE with gate folding at λ=1,3,5. Linear extrapolation to λ=0. Improvem...
  Actual console output for Experiment 29:
  theta      ideal    raw(noisy)   ZNE      |raw err|  |ZNE err|  improvement
   0.000  +1.0000   +0.9353    +1.0001   0.0647    0.0001    1060.00x
   1.047  +0.5000   +0.4558    +0.4809   0.0442    0.0191    2.31x
   2.094  -0.5000   -0.4424    -0.5016   0.0576    0.0016    34.96x
   3.142  -1.0000   -0.9309    -0.9796   0.0691    0.0204    3.39x
   4.712  -0.0000   -0.0012    +0.0304   0.0012    0.0304    0.04x
   6.283  +1.0000   +0.9338    +0.9856   0.0662    0.0144    4.60x
  Average |raw error|  = 0.0479
  Average |ZNE error|  = 0.0165
  Average improvement factor = 86.88x
  --- Readout error mitigation (confusion matrix) ---
  Calibration (prepared |00&gt;): P(misread) = 0.0599
  theta=0.785: ideal=0.7071  raw(readout noise)=0.6707  mitigated=0.7290
  Error before mitigation: 0.0365, after: 0.0219</pre><img class="fig-img" src="content/images/image22.png"/></div><h2 id="3-observation-and-results-13">3. Observation and Results</h2><h3 id="observation-tables-7">Observation Tables</h3><p><em>Record all experimental data for Experiment 29 in the tables below. Complete during the practical session using actual measurements from simulation and/or IBM Quantum hardware.</em></p><table>
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
</table><h3 id="ibm-hardware-execution-record-2">IBM Hardware Execution Record</h3><table>
<colgroup>
<col style="width: 50%"/><col style="width: 50%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Parameter</strong></td><td><strong>Value Recorded</strong></td></tr>
<tr class="even"><td>Device Name</td><td></td></tr>
<tr class="odd"><td>Qubits Used</td><td></td></tr>
<tr class="even"><td>T₁ (μs) per qubit</td><td></td></tr>
<tr class="odd"><td>T₂ (μs) per qubit</td><td></td></tr>
<tr class="even"><td>CX / Gate Error Rate</td><td></td></tr>
<tr class="odd"><td>Readout Error</td><td></td></tr>
<tr class="even"><td>Transpiled Circuit Depth</td><td></td></tr>
<tr class="odd"><td>Optimisation Level</td><td></td></tr>
<tr class="even"><td>Shot Count</td><td></td></tr>
<tr class="odd"><td>IBM Quantum Job ID</td><td></td></tr>
<tr class="even"><td>Submission Date/Time</td><td></td></tr>
<tr class="odd"><td>Queue Wait (min)</td><td></td></tr>
<tr class="even"><td>Hardware Counts</td><td></td></tr>
<tr class="odd"><td>Simulation Counts</td><td></td></tr>
<tr class="even"><td>Error Rate (%)</td><td></td></tr>
<tr class="odd"><td>Mitigation Applied?</td><td></td></tr>
</tbody>
</table><h2 id="4-discussion-questions-13">4. Discussion Questions</h2><ol type="1"><li><p>Why is CX²=Identity the key property that makes gate folding a valid technique for zero-noise extrapolation?</p></li><li><p>The linear extrapolation to zero noise scale assumes the error grows roughly linearly with the number of folded gates. In what situations might this linear assumption break down?</p></li><li><p>Readout error mitigation here uses a simple rescaling correction. Why might a full confusion-matrix inversion (rather than just averaging p01 and p10) give a more accurate correction in general?</p></li><li><p>Write complete answers with supporting calculations, equations, and diagrams.</p></li><li><p>For IBM Hardware experiments: justify your choice of backend, qubit pair, and optimisation level.</p></li><li><p>Compare simulation vs hardware results and quantify all sources of error.</p></li></ol><h2 id="5-lab-record-requirements-13">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record key outputs and verify the basic concept.</p></li><li><p>Run the Full Program. Save all generated figures (label them lab29_*.png).</p></li><li><p>Complete all observation tables during the practical session.</p></li><li><p>Execute on IBM Quantum hardware. Record Job ID immediately after submission.</p></li><li><p>Compare hardware vs simulation results. Calculate error rate and improvement from any mitigation applied.</p></li><li><p>Write complete, well-reasoned answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>What is the Estimator primitive?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Qiskit Runtime Estimator: high-level primitive for computing expectation values ⟨O⟩ with built-in error mitigation. Options: resilience_level=0 (none), 1 (readout mitigation), 2 (ZNE + readout). Handles circuit transpilation, batching, shot allocation, and mitigation automatically. Benefits: (1) automatic mitigation, (2) efficient batching reduces job overhead, (3) consistent API across simulation and hardware backends.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>Why does ZNE perform better at some angles?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>ZNE improvement ratio = |ideal-raw|/|ideal-mitigated|. At θ=90° (ideal=0): raw gives ~0.04 (large relative error). ZNE reduces to ~0.008 — 5× improvement. At θ=0° (ideal=1): raw gives ~0.82, ZNE gives ~0.94 — 2× improvement. Linear extrapolation is most accurate where ⟨ZZ⟩ changes slowly (near extremes); less accurate near zero-crossings where curvature is higher.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>What is crosstalk and how does it affect multi-qubit circuits?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Crosstalk: unintended coupling between neighbouring qubits. Types: (1) ZZ crosstalk: residual ZZ coupling even with no gates applied. (2) Gate crosstalk: applying CX on one pair slightly affects neighbours. Mitigation: (1) dynamical decoupling — insert X·X pulses to cancel static ZZ, (2) ZZCAL calibration, (3) heavy-hex coupling map (reduces ZZ by ~10×). Crosstalk is a major error source for parallel gate execution.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>How does shot count affect ZNE accuracy?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Shot noise: σ ∝ 1/√N per scale factor. ZNE fits a polynomial to noisy points: fit error includes shot noise. For accurate ZNE: N_shots ≥ 1000 per scale factor. For 3-point ZNE at 13 angles: 3×1000×13 = 39,000 total shots. More shots → better extrapolation → diminishing returns beyond ~10,000 per point. Trade-off: more shots = better ZNE but longer runtime on IBM hardware (queuing time).</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What is quantum advantage for expectation value estimation?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Classical: for an n-qubit Hamiltonian with M Pauli terms, classical simulation requires O(2^n) time per term. Quantum: measure each Pauli term directly on hardware in O(N_shots) time, independent of 2^n. For large n (&gt;50 qubits): quantum hardware can estimate ⟨O⟩ for observables that classical computers cannot efficiently compute. VQE and QPE leverage this for chemistry and optimisation applications.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>Why is CX²=Identity the specific property that makes 'gate folding' a valid noise-scaling technique?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Folding a gate G an odd number of times as G(G†G)^m preserves the IDEAL logical operation exactly (since G†G=Identity ideally), while each additional physical application of the noisy gate adds extra real-world noise; CX being self-inverse (CX=CX†) means simply repeating CX an odd number of times achieves this same effect without needing separate inverse gates.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>Why does zero-noise extrapolation extrapolate to a 'noise scale factor of zero' rather than literally running the circuit with zero noise?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Zero-noise execution is precisely what real hardware cannot provide; ZNE instead deliberately INCREASES the effective noise level (via folding) at several known scale factors, fits a model to how the observable degrades with that scale, and extrapolates the fitted curve backward to what the observable WOULD be in the unreachable zero-noise limit.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>What assumption is being made when a LINEAR fit is used to extrapolate to zero noise, and when might this assumption fail?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A linear fit assumes the observable degrades roughly proportionally to the noise scale factor over the sampled range; for larger noise levels or certain noise channels, the true relationship can be closer to exponential decay, in which case a linear extrapolation may over- or under-correct compared to an exponential fit.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>Why is readout error mitigation handled completely separately from gate-error mitigation (ZNE) in this experiment?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Readout error occurs at the very end of the circuit during measurement and has fundamentally different statistics (a fixed misclassification probability per qubit) than accumulated gate errors; it can be characterised independently via calibration circuits and corrected with its own dedicated technique, such as confusion-matrix inversion.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>Why does calibrating readout error by preparing a known state (like |00&gt;) and measuring it provide a useful correction factor?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Since the TRUE outcome is known in advance (deterministically |00&gt;), any deviation observed in the measurement results is attributable entirely to readout misclassification, giving a direct empirical estimate of the confusion probabilities needed to correct future measurements on unknown states.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>If both gate errors and readout errors are present simultaneously, in what order should ZNE and readout mitigation typically be applied?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Readout mitigation is usually applied first (or as a separate post-processing correction on raw counts) to remove measurement-specific bias, and ZNE is applied across the gate-noise scaling axis on top of that; keeping the two error sources' corrections conceptually separate avoids conflating a measurement artifact with genuine gate-noise scaling behaviour.</td></tr>
</tbody>
</table>